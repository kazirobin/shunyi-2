import { promises as fs } from "node:fs";
import path from "node:path";
import { MongoClient, type Collection, type Document } from "mongodb";
import { MONGODB_DATABASE, MONGODB_URI } from "@/lib/config";

const DATA_DIR = path.join(process.cwd(), "data");
const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
let lastStorageMode: "mongodb" | "local" = "local";
export function getLastStorageMode() { return lastStorageMode; }
const allowed = new Set(["employees","attendance","payroll","departments","buyers","suppliers","orders","production","inventory","quality-control","shipments","settings","work-style","products"]);

const seedLoaders: Record<string, () => Promise<unknown[]>> = {
  employees: async () => (await import("@/data/employees")).employees,
  attendance: async () => (await import("@/data/attendance")).attendance,
  payroll: async () => (await import("@/data/payroll")).payroll,
  departments: async () => (await import("@/data/departments")).departments,
  buyers: async () => (await import("@/data/buyers")).buyers,
  suppliers: async () => (await import("@/data/suppliers")).suppliers,
  orders: async () => (await import("@/data/orders")).orders,
  production: async () => (await import("@/data/production")).production,
  inventory: async () => (await import("@/data/inventory")).inventory,
  "quality-control": async () => (await import("@/data/quality-control")).qualityControl,
  shipments: async () => (await import("@/data/shipments")).shipments,
  settings: async () => (await import("@/data/settings")).settings,
  "work-style": async () => (await import("@/data/work-style")).workStyle,
  products: async () => (await import("@/data/products")).products,
};

function assertResource(resource: string) {
  if (!allowed.has(resource)) throw new Error("Unknown data resource");
  return path.join(DATA_DIR, `${resource}.json`);
}
function requireMongoInProduction() {
  if (isProduction) {
    throw new Error("MongoDB is required in production. Set MONGODB_URI in Vercel Environment Variables and redeploy.");
  }
}

async function readJsonRecords(resource: string): Promise<Record<string, unknown>[]> {
  const file = assertResource(resource);
  try {
    const parsed: unknown = JSON.parse(await fs.readFile(file, "utf8"));
    if (!Array.isArray(parsed)) throw new Error(`Invalid ${resource}.json format`);
    return parsed as Record<string, unknown>[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const seed = (await seedLoaders[resource]()) as Record<string, unknown>[];
    if (!isProduction) await writeJsonRecords(resource, seed);
    return seed;
  }
}
async function writeJsonRecords(resource: string, records: Record<string, unknown>[]) {
  if (isProduction) return; // Vercel serverless filesystem is read-only/ephemeral.
  const file = assertResource(resource);
  await fs.mkdir(DATA_DIR, { recursive: true });
  const temp = `${file}.tmp`;
  await fs.writeFile(temp, JSON.stringify(records, null, 2) + "\n", "utf8");
  await fs.rename(temp, file);
}
async function writeFallbackRecords(resource: string, records: Record<string, unknown>[]) {
  requireMongoInProduction();
  await writeJsonRecords(resource, records);
  const marker = path.join(DATA_DIR, `.${resource}.fallback-dirty`);
  await fs.writeFile(marker, new Date().toISOString(), "utf8");
}
async function syncDirtyFallback(resource: string, collection: Collection<Document>) {
  if (isProduction) return;
  const marker = path.join(DATA_DIR, `.${resource}.fallback-dirty`);
  try {
    await fs.access(marker);
    const local = await readJsonRecords(resource);
    await collection.deleteMany({});
    if (local.length) await collection.insertMany(local.map(item => ({ ...item })));
    await fs.unlink(marker);
    console.info(`[storage][sync][${resource}] local fallback snapshot synchronized to MongoDB (${local.length} records)`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
    console.error(`[storage][sync][${resource}] Could not synchronize local fallback snapshot:`, error);
    throw error;
  }
}

let mongoClient: MongoClient | null = null;
let mongoPromise: Promise<MongoClient> | null = null;
async function getMongoClient(): Promise<MongoClient> {
  if (!MONGODB_URI.trim()) throw new Error("MONGODB_URI is missing. Add it to Vercel Environment Variables.");
  if (mongoClient) return mongoClient;
  if (!mongoPromise) {
    mongoPromise = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000, maxPoolSize: 10 })
      .connect().then(client => { mongoClient = client; return client; })
      .catch(error => { mongoPromise = null; throw error; });
  }
  return mongoPromise;
}
async function getCollection(resource: string): Promise<Collection<Document>> {
  assertResource(resource);
  const client = await getMongoClient();
  return client.db(MONGODB_DATABASE).collection(resource);
}
function clean<T extends Record<string, unknown>>(record: T): Record<string, unknown> {
  const { _id, ...rest } = record;
  return rest;
}

/** Import the bundled seed data into an empty MongoDB collection once. */
async function initializeMongoCollection(resource: string, collection: Collection<Document>) {
  const client = await getMongoClient();
  const db = client.db(MONGODB_DATABASE);
  const migrations = db.collection<{ _id: string; completedAt?: Date }>("__app_migrations");
  const migrationKey = `json-to-mongo-v2:${resource}`;
  if (await migrations.findOne({ _id: migrationKey })) return;
  if (await collection.estimatedDocumentCount() === 0) {
    // In production use bundled TypeScript seed data; never attempt filesystem writes.
    const seed = isProduction
      ? (await seedLoaders[resource]()) as Record<string, unknown>[]
      : await readJsonRecords(resource);
    if (seed.length) await collection.insertMany(seed.map(item => ({ ...item })));
  }
  await migrations.updateOne({ _id: migrationKey }, { $set: { completedAt: new Date() } }, { upsert: true });
}

export async function getStorageStatus(): Promise<{mode:"mongodb"|"local";connected:boolean;message:string}> {
  try {
    const client = await getMongoClient();
    await client.db(MONGODB_DATABASE).command({ ping: 1 });
    lastStorageMode = "mongodb";
    return { mode:"mongodb", connected:true, message:"MongoDB Atlas connection is healthy. Data is stored in MongoDB." };
  } catch (error) {
    lastStorageMode = "local";
    const detail = error instanceof Error ? error.message : "Unknown MongoDB connection error";
    if (isProduction) return { mode:"local", connected:false, message:`MongoDB is not connected: ${detail}` };
    return { mode:"local", connected:false, message:"MongoDB is unavailable; using local JSON storage for development." };
  }
}

export async function readRecords(resource: string): Promise<Record<string, unknown>[]> {
  assertResource(resource);
  try {
    const collection = await getCollection(resource);
    await initializeMongoCollection(resource, collection);
    await syncDirtyFallback(resource, collection);
    const records = (await collection.find({}, { projection: { _id: 0 } }).toArray()).map(item => clean(item));
    await writeJsonRecords(resource, records);
    lastStorageMode = "mongodb";
    return records;
  } catch (error) {
    if (isProduction) throw new Error(`MongoDB read failed for ${resource}: ${error instanceof Error ? error.message : String(error)}`);
    console.warn(`[storage][read][${resource}] MongoDB read failed; using JSON fallback:`, error instanceof Error ? error.message : error);
    lastStorageMode = "local";
    return readJsonRecords(resource);
  }
}

export async function writeRecords(resource: string, records: Record<string, unknown>[]) {
  assertResource(resource);
  if (isProduction) {
    const collection = await getCollection(resource);
    await initializeMongoCollection(resource, collection);
    await collection.deleteMany({});
    if (records.length) await collection.insertMany(records.map(item => ({ ...item })));
    lastStorageMode = "mongodb";
    return;
  }
  await writeJsonRecords(resource, records);
}

export async function createRecord(resource: string, data: Record<string, unknown>) {
  assertResource(resource);
  const id = String(data.id || `${resource.slice(0,3).toUpperCase()}-${Date.now()}`);
  let record: Record<string, unknown> = { ...data, id };
  const prepareAppend = (records: Record<string, unknown>[]) => {
    const ordered: Record<string, unknown>[] = [...records].map((item, index) => ({ item, index })).sort((a, b) => {
      const av = Number(a.item.sortOrder);
      const bv = Number(b.item.sortOrder);
      const ao = Number.isFinite(av) ? av : a.index;
      const bo = Number.isFinite(bv) ? bv : b.index;
      return ao - bo || a.index - b.index;
    }).map(({ item }, index) => ({ ...item, sortOrder: index }));
    return { ordered, next: ordered.length };
  };
  try {
    const collection = await getCollection(resource);
    await initializeMongoCollection(resource, collection);
    await syncDirtyFallback(resource, collection);
    if (await collection.findOne({ id })) throw new Error("A record with this ID already exists");
    if (resource === "employees") {
      const existing = (await collection.find({}, { projection: { _id: 0 } }).toArray()).map(item => clean(item));
      const { ordered, next } = prepareAppend(existing);
      if (ordered.length) await collection.bulkWrite(ordered.map(item => ({ updateOne: { filter: { id: item.id }, update: { $set: { sortOrder: item.sortOrder } } } })));
      record = { ...record, sortOrder: next };
    }
    await collection.insertOne(record);
    if (!isProduction) {
      const all = (await collection.find({}, { projection: { _id: 0 } }).toArray()).map(item => clean(item));
      await writeJsonRecords(resource, all);
    }
    lastStorageMode = "mongodb";
    return record;
  } catch (error) {
    if (error instanceof Error && error.message === "A record with this ID already exists") throw error;
    if (isProduction) throw new Error(`MongoDB create failed for ${resource}: ${error instanceof Error ? error.message : String(error)}`);
    console.warn(`[storage][create][${resource}] MongoDB write failed; saving to JSON:`, error instanceof Error ? error.message : error);
    lastStorageMode = "local";
    const records = await readJsonRecords(resource);
    if (records.some(item => String(item.id) === id)) throw new Error("A record with this ID already exists");
    if (resource === "employees") {
      const indexed = records.map((item, index) => ({ item, index })).sort((a,b) => {
        const av = Number(a.item.sortOrder), bv = Number(b.item.sortOrder);
        return (Number.isFinite(av) ? av : a.index) - (Number.isFinite(bv) ? bv : b.index) || a.index-b.index;
      });
      const ordered = indexed.map(({item}, index) => ({...item, sortOrder:index}));
      record = { ...record, sortOrder: ordered.length };
      await writeFallbackRecords(resource, [...ordered, record]);
    } else {
      records.unshift(record);
      await writeFallbackRecords(resource, records);
    }
    return record;
  }
}

/** Repair legacy duplicate employee IDs without deleting employee records. */
export async function repairEmployeeIdentityConflicts() {
  const repairRows = (employees: Record<string, unknown>[], attendance: Record<string, unknown>[], payroll: Record<string, unknown>[]) => {
    const groups = new Map<string, number[]>();
    employees.forEach((employee, index) => {
      const id = String(employee.id || "").trim();
      if (!id) throw new Error(`Employee at row ${index + 1} has no ID; repair stopped without changing data.`);
      groups.set(id, [...(groups.get(id) || []), index]);
    });
    const used = new Set(employees.map(employee => String(employee.id)));
    const newId = () => {
      for (let n = 1001; n < 1000000; n++) {
        const candidate = `EMP-${n}`;
        if (!used.has(candidate)) { used.add(candidate); return candidate; }
      }
      throw new Error("Could not allocate a unique employee ID");
    };
    const nextEmployees = employees.map(employee => ({ ...employee }));
    const remaps: Array<{ oldId: string; newId: string; name: string; nameCount: number }> = [];
    for (const [oldId, indexes] of groups) {
      if (indexes.length < 2) continue;
      // Keep the historic ID with the employee whose name is referenced by existing attendance/payroll.
      let keeper = indexes[0];
      if (oldId === "EMP-1001") {
        const rahim = indexes.find(index => String(employees[index].name || "").trim().toLowerCase() === "rahim uddin");
        if (rahim !== undefined) keeper = rahim;
      }
      for (const index of indexes) {
        if (index === keeper) continue;
        const assigned = newId();
        const name = String(nextEmployees[index].name || "").trim();
        nextEmployees[index] = { ...nextEmployees[index], id: assigned };
        const nameCount = indexes.filter(rowIndex => String(employees[rowIndex].name || "").trim().toLowerCase() === name.toLowerCase()).length;
        remaps.push({ oldId, newId: assigned, name, nameCount });
      }
    }
    // Keep existing serial order as much as possible, then compact to unique 1..N positions (stored 0-based).
    const ordered: Array<Record<string, unknown>> = nextEmployees.map((item, index) => ({ item, index })).sort((a, b) => {
      const av = Number(a.item.sortOrder), bv = Number(b.item.sortOrder);
      const ao = Number.isFinite(av) ? av : a.index;
      const bo = Number.isFinite(bv) ? bv : b.index;
      return ao - bo || a.index - b.index;
    }).map(({ item }, sortOrder) => ({ ...item, sortOrder }));
    const updateRefs = (records: Record<string, unknown>[]) => records.map(record => {
      const oldId = String(record.employeeId || "");
      const name = String(record.employee || record.employeeName || "").trim().toLowerCase();
      const matchingRemaps = remaps.filter(item => item.oldId === oldId && item.name && item.name.toLowerCase() === name && item.nameCount === 1);
      if (matchingRemaps.length === 1) return { ...record, employeeId: matchingRemaps[0].newId };
      // Backfill missing IDs only where the employee name has exactly one matching employee.
      if (!oldId && name) {
        const matches = ordered.filter(employee => String(employee.name || "").trim().toLowerCase() === name);
        if (matches.length === 1) return { ...record, employeeId: String(matches[0].id) };
      }
      return record;
    });
    return { employees: ordered, attendance: updateRefs(attendance), payroll: updateRefs(payroll), remaps };
  };

  let client: MongoClient;
  try {
    client = await getMongoClient();
  } catch (connectionError) {
    if (isProduction) throw new Error(`Employee identity repair requires MongoDB: ${connectionError instanceof Error ? connectionError.message : String(connectionError)}`);
    console.warn("[storage][employee-repair] MongoDB unavailable; repairing local JSON:", connectionError);
    const employees = await readJsonRecords("employees");
    const attendance = await readJsonRecords("attendance");
    const payroll = await readJsonRecords("payroll");
    const backupPath = path.join(DATA_DIR, "employee-identity-repair-backup.json");
    try { await fs.access(backupPath); }
    catch { await fs.writeFile(backupPath, JSON.stringify({ createdAt: new Date().toISOString(), employees, attendance, payroll }, null, 2) + "\n", "utf8"); }
    const result = repairRows(employees, attendance, payroll);
    await writeFallbackRecords("employees", result.employees);
    await writeFallbackRecords("attendance", result.attendance);
    await writeFallbackRecords("payroll", result.payroll);
    lastStorageMode = "local";
    return { mode: "local", repaired: true, employeeCount: result.employees.length, remapped: result.remaps.length, message: "Employee IDs repaired in local JSON; attendance and payroll references preserved." };
  }

  // Once connected, any database write failure is surfaced; never silently switch to a different data source.
  const db = client.db(MONGODB_DATABASE);
  const employeeCollection = db.collection<Document>("employees");
  const attendanceCollection = db.collection<Document>("attendance");
  const payrollCollection = db.collection<Document>("payroll");
  await syncDirtyFallback("employees", employeeCollection);
  await syncDirtyFallback("attendance", attendanceCollection);
  await syncDirtyFallback("payroll", payrollCollection);
  const rawEmployees = await employeeCollection.find({}).toArray();
  const rawAttendance = await attendanceCollection.find({}).toArray();
  const rawPayroll = await payrollCollection.find({}).toArray();
  const result = repairRows(rawEmployees.map(clean), rawAttendance.map(clean), rawPayroll.map(clean));
  type EmployeeIdentityRepairBackup = {
    _id: string;
    createdAt: Date;
    employees: Document[];
    attendance: Document[];
    payroll: Document[];
  };
  const backup = db.collection<EmployeeIdentityRepairBackup>("__employee_identity_repair_backup");
  const backupKey = "employee-identity-repair-v1";
  if (!(await backup.findOne({ _id: backupKey }))) {
    await backup.insertOne({ _id: backupKey, createdAt: new Date(), employees: rawEmployees, attendance: rawAttendance, payroll: rawPayroll });
  }
  // Rebuild deterministic row mapping from original document order.
  const groups = new Map<string, number[]>();
  rawEmployees.forEach((doc, index) => { const id = String(doc.id || ""); groups.set(id, [...(groups.get(id) || []), index]); });
  const used = new Set(rawEmployees.map(doc => String(doc.id || "")));
  const assigned = rawEmployees.map(doc => clean(doc));
  for (const [oldId, indexes] of groups) {
    if (indexes.length < 2) continue;
    let keeper = indexes[0];
    if (oldId === "EMP-1001") { const match = indexes.find(i => String(rawEmployees[i].name || "").trim().toLowerCase() === "rahim uddin"); if (match !== undefined) keeper = match; }
    for (const index of indexes) if (index !== keeper) {
      let n = 1001, candidate = "";
      do { candidate = `EMP-${n++}`; } while (used.has(candidate));
      used.add(candidate); assigned[index] = { ...assigned[index], id: candidate };
    }
  }
  const finalEmployees = result.employees;
  // Phase one frees any unique serial index; phase two writes the final unique sequence.
  for (let index = 0; index < rawEmployees.length; index++) {
    await employeeCollection.updateOne({ _id: rawEmployees[index]._id }, { $set: { id: String(assigned[index].id), sortOrder: -2000000 - index } });
  }
  for (let index = 0; index < rawEmployees.length; index++) {
    const repairedId = String(assigned[index].id);
    const sortOrder = finalEmployees.find(item => String(item.id) === repairedId)?.sortOrder ?? index;
    await employeeCollection.updateOne({ _id: rawEmployees[index]._id }, { $set: { sortOrder } });
  }
  const updateRelated = async (collection: Collection<Document>, before: Document[], after: Record<string, unknown>[]) => {
    for (let index = 0; index < before.length; index++) {
      const next = after[index];
      if (next) {
        const { _id: ignored, ...fields } = next as Record<string, unknown>;
        await collection.updateOne({ _id: before[index]._id }, { $set: fields });
      }
    }
  };
  await updateRelated(attendanceCollection, rawAttendance, result.attendance);
  await updateRelated(payrollCollection, rawPayroll, result.payroll);
  if (!isProduction) {
    await writeJsonRecords("employees", finalEmployees);
    await writeJsonRecords("attendance", result.attendance);
    await writeJsonRecords("payroll", result.payroll);
  }
  lastStorageMode = "mongodb";
  return { mode: "mongodb", repaired: true, employeeCount: finalEmployees.length, remapped: assigned.filter((item, index) => String(item.id) !== String(rawEmployees[index].id)).length, message: "Employee IDs repaired; attendance and payroll references preserved." };
}

/** Persist a complete employee order with two-phase writes to avoid unique sortOrder index collisions. */
export async function reorderRecords(resource: string, ids: string[]) {
  assertResource(resource);
  if (resource !== "employees") throw new Error("Ordering is supported only for employees");
  if (new Set(ids).size !== ids.length) throw new Error("Duplicate employee IDs detected. Run the Employee ID repair before changing serials.");
  const apply = (records: Record<string, unknown>[]): Record<string, unknown>[] => {
    const recordIds = records.map(item => String(item.id || ""));
    if (recordIds.some(id => !id) || new Set(recordIds).size !== recordIds.length) throw new Error("Employee IDs are still duplicated. Run Employee ID repair first.");
    if (ids.length !== records.length || ids.some(id => !recordIds.includes(id))) throw new Error("Employee list changed. Reload and try again.");
    const byId = new Map(records.map(item => [String(item.id), item]));
    return ids.map((id, sortOrder) => ({ ...byId.get(id)!, sortOrder }));
  };
  let collection: Collection<Document>;
  try {
    collection = await getCollection(resource);
  } catch (connectionError) {
    if (isProduction) throw new Error(`Employee order save failed: ${connectionError instanceof Error ? connectionError.message : String(connectionError)}`);
    console.warn("[storage][employee-order] MongoDB unavailable; saving order to local JSON:", connectionError);
    const current = await readJsonRecords(resource);
    const ordered = apply(current);
    await writeFallbackRecords(resource, ordered);
    lastStorageMode = "local";
    return ordered;
  }
  // Do not silently fall back if MongoDB is connected but the write itself fails.
  await initializeMongoCollection(resource, collection);
  await syncDirtyFallback(resource, collection);
  const docs = await collection.find({}).toArray();
  const current = docs.map(clean);
  const ordered = apply(current);
  // Move every row to a unique temporary negative sortOrder before assigning final 0-based values.
  for (let index = 0; index < docs.length; index++) {
    await collection.updateOne({ _id: docs[index]._id }, { $set: { sortOrder: -1000000 - index } });
  }
  for (let index = 0; index < docs.length; index++) {
    await collection.updateOne({ _id: docs[index]._id }, { $set: { sortOrder: ordered.find(item => String(item.id) === String(docs[index].id))?.sortOrder ?? index } });
  }
  if (!isProduction) await writeJsonRecords(resource, ordered);
  lastStorageMode = "mongodb";
  return ordered;
}

export async function updateRecord(resource: string, id: string, data: Record<string, unknown>) {
  assertResource(resource);
  try {
    const collection = await getCollection(resource);
    await initializeMongoCollection(resource, collection);
    await syncDirtyFallback(resource, collection);
    const result = await collection.findOneAndUpdate({ id }, { $set: { ...data, id } }, { returnDocument: "after", projection: { _id: 0 } });
    if (!result) return null;
    const updated = clean(result);
    if (!isProduction) {
      const all = (await collection.find({}, { projection: { _id: 0 } }).toArray()).map(item => clean(item));
      await writeJsonRecords(resource, all);
    }
    lastStorageMode = "mongodb";
    return updated;
  } catch (error) {
    if (isProduction) throw new Error(`MongoDB update failed for ${resource}: ${error instanceof Error ? error.message : String(error)}`);
    console.warn(`[storage][update][${resource}] MongoDB update failed; updating JSON:`, error instanceof Error ? error.message : error);
    lastStorageMode = "local";
    const records = await readJsonRecords(resource);
    const index = records.findIndex(item => String(item.id) === id);
    if (index < 0) return null;
    records[index] = { ...records[index], ...data, id };
    await writeFallbackRecords(resource, records);
    return records[index];
  }
}

export async function deleteRecord(resource: string, id: string) {
  assertResource(resource);
  try {
    const collection = await getCollection(resource);
    await initializeMongoCollection(resource, collection);
    await syncDirtyFallback(resource, collection);
    const result = await collection.deleteOne({ id });
    if (!result.deletedCount) return false;
    if (!isProduction) {
      const all = (await collection.find({}, { projection: { _id: 0 } }).toArray()).map(item => clean(item));
      await writeJsonRecords(resource, all);
    }
    lastStorageMode = "mongodb";
    return true;
  } catch (error) {
    if (isProduction) throw new Error(`MongoDB delete failed for ${resource}: ${error instanceof Error ? error.message : String(error)}`);
    console.warn(`[storage][delete][${resource}] MongoDB write failed; deleting from JSON:`, error instanceof Error ? error.message : error);
    lastStorageMode = "local";
    const records = await readJsonRecords(resource);
    const next = records.filter(item => String(item.id) !== id);
    if (next.length === records.length) return false;
    await writeFallbackRecords(resource, next);
    return true;
  }
}
