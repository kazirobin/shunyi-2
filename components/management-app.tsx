"use client";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { modules, type ModuleConfig } from "@/lib/modules";
import EmployeesPage from "@/components/pages/EmployeesPage";
import AttendancePage from "@/components/pages/AttendancePage";
import AttendanceManagementPage from "@/components/pages/AttendanceManagementPage";
import GenericModulePage from "@/components/pages/GenericModulePage";
import OverviewPage from "@/components/pages/OverviewPage";
import { applyLanguage, type Language } from "@/lib/language";

type Row = Record<string, unknown> & { id: string };
type StorageStatus = { mode: "mongodb" | "local"; connected: boolean; message: string };
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const text = (v: unknown) => v === null || v === undefined || v === "" ? "—" : String(v);
const money = (v: unknown) => `৳${Number(v || 0).toLocaleString("en-BD")}`;
const phoneDigits = (v: unknown) => String(v || "").replace(/\D/g, "");

export default function ManagementApp({ pageKey = "overview" }: { pageKey?: string }) {
  const router = useRouter();
  const active = pageKey;
  const navigate = (key: string) => router.push(key === "overview" ? "/overview" : `/${key}`);
  const [rows, setRows] = useState<Row[]>([]);
  const [employees, setEmployees] = useState<Row[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<Row[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Record<string,string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [dark, setDark] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [languageReady, setLanguageReady] = useState(false);
  const languageOriginals = useRef(new WeakMap<Node, { original: string; translated: string }>());
  const [storage, setStorage] = useState<StorageStatus>({mode:"local",connected:false,message:"Checking storage"});
  const [dragId, setDragId] = useState<string | null>(null);
  const [serialSaving, setSerialSaving] = useState(false);

  const config: ModuleConfig | undefined = modules.find(m => m.key === active);
  const resource = active === "daily-attendance" ? "attendance" : active;

  const loadResource = useCallback(async (key: string, reflectSource = false): Promise<Row[]> => {
    const response = await fetch(`/api/${key}`, {cache:"no-store"});
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `Could not load ${key}`);
    if (reflectSource) { const mode=response.headers.get("x-storage-mode"); if(mode==="mongodb"||mode==="local") setStorage({mode,connected:mode==="mongodb",message:mode==="mongodb"?"This module is currently reading from MongoDB.":"This module is currently reading from local JSON fallback."}); }
    if (!Array.isArray(data)) throw new Error(`Invalid response for ${key}`);
    return data as Row[];
  }, []);

  const refreshStorage = useCallback(async () => {
    try {
      const response = await fetch("/api/storage-status", {cache:"no-store"});
      const data = await response.json();
      if (response.ok) setStorage(data as StorageStatus);
      else throw new Error(data.error || "Storage status unavailable");
    } catch (e) { console.warn("[UI][storage-status]", e); setStorage({mode:"local",connected:false,message:"Status unavailable; local fallback assumed"}); }
  }, []);

  const refreshCounts = useCallback(async () => {
    const pairs = await Promise.all(modules.map(async m => {
      try { return [m.key, (await loadResource(m.key)).length] as const; }
      catch (e) { console.error(`[UI][counts][${m.key}]`, e); return [m.key, 0] as const; }
    }));
    setCounts(Object.fromEntries(pairs));
  }, [loadResource]);

  const refreshActive = useCallback(async () => {
    if (!modules.some(m => m.key === resource)) return;
    setLoading(true); setError("");
    try {
      const data = await loadResource(resource, true);
      setRows(data);
      console.info(`[UI][load] ${resource}: ${data.length} records`);
      if (resource === "employees") setEmployees(data);
    } catch (e) {
      console.error(`[UI][load][${resource}]`, e);
      setError(e instanceof Error ? e.message : "Could not load data");
      setRows([]);
    } finally { setLoading(false); }
  }, [loadResource, resource]);

  useEffect(() => {
    const saved = window.localStorage.getItem("shunyi-language");
    if (saved === "zh" || saved === "en") setLanguage(saved);
    setLanguageReady(true);
  }, []);
  useEffect(() => {
    if (!languageReady) return;
    window.localStorage.setItem("shunyi-language", language);
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    const root = document.querySelector(".shell");
    if (!root) return;
    const apply = () => applyLanguage(root as HTMLElement, language, languageOriginals.current);
    apply();
    const observer = new MutationObserver(() => apply());
    observer.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["placeholder", "title", "aria-label"] });
    return () => observer.disconnect();
  }, [language, languageReady]);
  useEffect(() => { refreshCounts(); refreshStorage(); }, [refreshCounts, refreshStorage]);
  useEffect(() => { if (active !== "overview" && active !== "daily-attendance") refreshActive(); }, [active, refreshActive]);
  useEffect(() => {
    if (active === "employees") {
      loadResource("attendance").then(data=>setTodayAttendance(data.filter(r=>r.date===today()))).catch(e=>console.warn("[UI][employee-today-attendance]",e));
    }
  }, [active, loadResource]);

  const filtered = useMemo(() => rows.filter(row => JSON.stringify(row).toLowerCase().includes(query.toLowerCase())), [rows, query]);
  const employeeRows = useMemo(() => {
    const list = active === "employees" ? filtered : employees;
    return [...list].sort((a, b) => Number(a.sortOrder ?? 999999) - Number(b.sortOrder ?? 999999));
  }, [active, filtered, employees]);
  const upcomingEmployees = useMemo(() => employees.filter(employee => {
    const joiningDate = String(employee.joiningDate ?? "").slice(0, 10);
    return joiningDate !== "" && joiningDate > today() && String(employee.status ?? "Active") !== "Inactive";
  }).sort((a, b) => String(a.joiningDate ?? "").localeCompare(String(b.joiningDate ?? ""))), [employees]);
  const todayAttendanceByEmployee = new Map<string,Row>();
  todayAttendance.forEach(r=>{if(r.employeeId)todayAttendanceByEmployee.set(String(r.employeeId),r);if(r.employee)todayAttendanceByEmployee.set(String(r.employee),r);});

  function showToast(message: string) { setToast(message); window.setTimeout(()=>setToast(""),2800); }
  function openCreate() {
    setEditing(null); const blank: Record<string,string> = {};
    config?.fields.forEach(f => blank[f.key] = "");
    if (active === "employees") { blank.status = "Active"; blank.grade = "Grade C"; blank.dailyRate = ""; }
    setForm(blank); setError(""); setModal(true);
  }
  function openEdit(row: Row) {
    setEditing(row); const values: Record<string,string> = {};
    config?.fields.forEach(f => values[f.key] = row[f.key] == null ? "" : String(row[f.key]));
    setForm(values); setError(""); setModal(true);
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!config) return;
    setLoading(true); setError("");
    const payload: Record<string,unknown> = {};
    config.fields.forEach(field => { const value=form[field.key]??""; payload[field.key]=field.type==="number"?(value===""?0:Number(value)):value; });
    try {
      const endpoint = editing ? `/api/${config.key}/${encodeURIComponent(editing.id)}` : `/api/${config.key}`;
      const response = await fetch(endpoint,{method:editing?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const result = await response.json(); if(!response.ok) throw new Error(result.error||"Save failed");
      console.info(`[UI][${editing?"update":"create"}] ${config.key}`, result.id);
      setModal(false); showToast(editing?"Record updated successfully.":"Record created successfully.");
      await refreshActive(); await refreshCounts(); await refreshStorage();
    } catch(e) { console.error(`[UI][save][${config.key}]`,e); setError(e instanceof Error?e.message:"Save failed"); }
    finally { setLoading(false); }
  }
  async function remove(row: Row) {
    if(!config||!window.confirm(`Delete ${String(row.name||row.id)}? This cannot be undone.`)) return;
    try {
      const response=await fetch(`/api/${config.key}/${encodeURIComponent(row.id)}`,{method:"DELETE"}); const result=await response.json();
      if(!response.ok) throw new Error(result.error||"Delete failed");
      console.info(`[UI][delete] ${config.key}`,row.id); showToast("Record deleted."); await refreshActive(); await refreshCounts(); await refreshStorage();
    } catch(e) { console.error(`[UI][delete][${config.key}]`,e); setError(e instanceof Error?e.message:"Delete failed"); }
  }
  async function copyPhone(phone: unknown) {
    const value=String(phone||""); if(!value) { window.alert("No mobile number saved."); return; }
    try { await navigator.clipboard.writeText(value); window.alert(`Copied mobile number: ${value}`); console.info("[UI][phone-copy] copied",value); }
    catch(e) {
      console.warn("[UI][phone-copy] Clipboard API unavailable; trying fallback",e);
      const field=document.createElement("textarea"); field.value=value; field.style.position="fixed"; field.style.opacity="0"; document.body.appendChild(field); field.select();
      const copied=document.execCommand("copy"); field.remove();
      if(copied) { window.alert(`Copied mobile number: ${value}`); console.info("[UI][phone-copy] fallback copied",value); }
      else { console.error("[UI][phone-copy] copy failed"); window.alert(`Copy failed. Mobile number: ${value}`); }
    }
  }
  async function repairEmployeeIds() {
    const duplicateIds = employees.map(row => String(row.id)).filter((id, index, all) => all.indexOf(id) !== index);
    const duplicateSummary = duplicateIds.length ? [...new Set(duplicateIds)].join(", ") : "No duplicate IDs detected";
    const confirmed = window.confirm(`${duplicateSummary}.

This check will keep all employee records, repair duplicate IDs if present, preserve attendance/payroll references where the employee name identifies the person, and normalize serial numbers. A database backup will be created before MongoDB changes. Continue?`);
    if (!confirmed) return;
    setSerialSaving(true); setError("");
    try {
      const response = await fetch("/api/employees/repair", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirm: "REPAIR_EMPLOYEE_IDS" }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Employee ID repair failed");
      showToast(`${result.message} ${result.remapped} duplicate ID(s) reassigned.`);
      await refreshActive(); await refreshCounts(); await refreshStorage();
    } catch (error) {
      console.error("[UI][employee-repair]", error);
      setError(error instanceof Error ? error.message : "Employee ID repair failed");
    } finally { setSerialSaving(false); }
  }

  async function persistEmployeeOrder(orderedRows: Row[]) {
    if (serialSaving) return;
    setSerialSaving(true);
    try {
      // Always build the order from fresh server data so "Employee list changed"
      // never fires due to client/server drift between load and save.
      const freshResponse = await fetch("/api/employees", { cache: "no-store" });
      const freshEmployees: Row[] = await freshResponse.json();
      if (!freshResponse.ok || !Array.isArray(freshEmployees)) throw new Error("Could not load fresh employee list");

      const byId = new Map(freshEmployees.map(e => [String(e.id), e]));
      const requestedIds = orderedRows.map(r => String(r.id)).filter(id => byId.has(id));
      const missingIds = freshEmployees.map(e => String(e.id)).filter(id => !requestedIds.includes(id));
      const allIds = [...requestedIds, ...missingIds];

      const optimistic = allIds.map((id, index) => ({ ...byId.get(id)!, sortOrder: index }));
      setRows(optimistic);
      setEmployees(optimistic);

      const response = await fetch("/api/employees/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: allIds }),
      });
      const result: unknown = await response.json();
      if (!response.ok) throw new Error((result as { error?: string })?.error || "Could not save employee order");
      if (!Array.isArray(result) || result.length !== allIds.length) throw new Error("The server did not confirm the complete employee order. Reload and try again.");
      const verifyResponse = await fetch("/api/employees", { cache: "no-store" });
      const verified: unknown = await verifyResponse.json();
      if (!verifyResponse.ok || !Array.isArray(verified)) throw new Error("Serials were submitted, but the saved order could not be verified. Reload the page.");
      const confirmed = [...(verified as Row[])].sort((a,b) => Number(a.sortOrder ?? 999999)-Number(b.sortOrder ?? 999999));
      setRows(confirmed);
      setEmployees(confirmed);
      showToast("Employee serial order saved and verified.");
    } catch (error) {
      console.error("[UI][employee-order]", error);
      setError(error instanceof Error ? error.message : "Could not save employee order");
      await refreshActive();
    } finally {
      setSerialSaving(false);
    }
  }
  async function changeEmployeeSerial(employeeId: string, requestedSerial: number) {
    if (query.trim()) { setError("Clear the employee search before changing serial number."); return; }
    if (!Number.isFinite(requestedSerial) || requestedSerial < 1) { setError("Serial number must be 1 or higher."); return; }
    const sorted = [...employeeRows];
    const from = sorted.findIndex(employee => employee.id === employeeId);
    if (from < 0) return;
    const [moving] = sorted.splice(from, 1);
    const targetIndex = Math.max(0, Math.min(sorted.length, Math.floor(requestedSerial) - 1));
    sorted.splice(targetIndex, 0, moving);
    await persistEmployeeOrder(sorted);
  }
  async function reorderEmployees(targetId: string, movingId: string | null = dragId) {
    if (query.trim()) { setError("Clear the employee search before changing serial order."); return; }
    if (!movingId || movingId === targetId) return;
    const sorted = [...employeeRows];
    const from = sorted.findIndex(row => row.id === movingId);
    const to = sorted.findIndex(row => row.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = sorted.splice(from, 1);
    sorted.splice(to, 0, moved);
    setDragId(null);
    await persistEmployeeOrder(sorted);
  }
  async function exportJson() {
    try {
      const all:Record<string,Row[]>={}; for(const m of modules) all[m.key]=await loadResource(m.key);
      const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),data:all},null,2)],{type:"application/json"});
      const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="shunyigarments-backup.json"; a.click(); URL.revokeObjectURL(url); console.info("[UI][backup] exported");
    } catch(e) { console.error("[UI][backup-export]",e); setError(e instanceof Error?e.message:"Backup export failed"); }
  }
  async function importJson(file?: File) {
    if(!file) return;
    try {
      const parsed=JSON.parse(await file.text()); if(!parsed.data||typeof parsed.data!=="object") throw new Error("Invalid backup file");
      for(const m of modules) if(Array.isArray(parsed.data[m.key])) {
        const existing=await loadResource(m.key);
        for(const item of existing) { const d=await fetch(`/api/${m.key}/${encodeURIComponent(item.id)}`,{method:"DELETE"}); if(!d.ok) throw new Error(`Could not clear ${m.key}`); }
        for(const item of parsed.data[m.key]) { const {id,...rest}=item; const p=await fetch(`/api/${m.key}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...rest,id})}); if(!p.ok) throw new Error(`Could not import ${m.key} record`); }
      }
      await refreshActive(); await refreshCounts(); await refreshStorage(); showToast("Backup imported."); console.info("[UI][backup-import] complete");
    } catch(e) { console.error("[UI][backup-import]",e); setError(e instanceof Error?e.message:"Import failed"); }
  }

  const nav = (key:string,label:string,icon:string) => <button className={`nav-link ${active===key?"active":""}`} onClick={()=>{navigate(key);setQuery("");}} key={key}><span>{icon}</span>{label}{key!=="daily-attendance"&&key!=="overview"&&<small>{counts[key]??"—"}</small>}</button>;

  return <main className={`shell ${dark?"dark":""}`}>
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">S</div><div><b>Shunyi Garments</b><small>FACTORY MANAGEMENT</small></div></div>
      <div className="workspace"><i/> Factory workspace <span>⌄</span></div>
      <div className="nav-caption">WORKSPACE</div>
      <nav>{nav("overview","Overview","▦")}<div className="nav-caption group-caption">PEOPLE MANAGEMENT</div>{nav("employees","Employees","♙")}{nav("daily-attendance","Daily Attendance","◷")}{nav("attendance-management","Attendance Records","▤")}<div className="nav-caption group-caption">OTHER MODULES</div>{modules.filter(m=>!['employees','attendance'].includes(m.key)).map(m=>nav(m.key,m.title,m.icon))}</nav>
      <div className="sidebar-foot"><div className="storage-note"><b>Data storage status</b><p>{storage.message}</p><span className={storage.mode==="mongodb"?"storage-mongo":"storage-local"}><i/>{storage.mode==="mongodb"?"MongoDB connected":"Local JSON active"}</span></div><div className="admin"><div className="admin-avatar">AD</div><div><b>Factory Admin</b><small>Administrator</small></div><button className="logout-mini" onClick={async()=>{await fetch("/api/auth/logout",{method:"POST"});router.replace("/");router.refresh();}}>Logout</button></div></div>
    </aside>
    <section className="main">
      <header className="topbar"><div className="crumb">Workspace <span>/</span> <b>{active==="daily-attendance"?"Daily Attendance":active==="attendance-management"?"Attendance Records":config?.title??"Overview"}</b></div><div className="top-actions"><span className={`server-state ${storage.mode}`} title={storage.message}><i/> {storage.mode==="mongodb"?"MongoDB connected":"Local JSON mode"}</span><select className="language-select" aria-label="Language" title="Language" value={language} onChange={e=>setLanguage(e.target.value as Language)}><option value="en">English</option><option value="zh">中文</option></select><button className="icon-btn" onClick={()=>setDark(!dark)} title="Toggle theme">{dark?"☀":"◐"}</button><button className="logout-top" onClick={async()=>{await fetch("/api/auth/logout",{method:"POST"});router.replace("/");router.refresh();}}>Logout</button><div className="admin-avatar">AD</div></div></header>
      <div className="content">
        <div className="heading"><div><div className="eyebrow">SHUNYI GARMENTS MANAGEMENT</div><h1>{active==="daily-attendance"?"Daily Attendance":active==="attendance-management"?"Attendance Records":config?.title??"Factory overview"}</h1><p>{active==="employees"?"Manage employee profiles, grades, work status, contact and serial order.":active==="daily-attendance"?"Mark daily হাজিরা in a few clicks and calculate attendance wages automatically.":active==="attendance-management"?"Manage attendance records separately with create, update and delete.":config?`Create, update, search and manage your ${config.title.toLowerCase()} records.`:"A clear view of your garments factory operations."}</p></div><div className="heading-actions"><button className="btn secondary" onClick={exportJson}>⇩ Backup all data</button>{config&&<button className="btn primary" onClick={openCreate}>＋ Add {config.singular}</button>}</div></div>
        {toast&&<div className="toast">{toast}</div>}{error&&<div className="error">{error}<button onClick={()=>setError("")}>×</button></div>}
        {active==="overview"?<OverviewPage counts={counts} setActive={navigate} storage={storage}/>:active==="employees"? <EmployeesPage employees={employees} rows={rows} todayAttendance={todayAttendance} upcomingEmployees={upcomingEmployees} employeeRows={employeeRows} todayAttendanceByEmployee={todayAttendanceByEmployee} query={query} setQuery={setQuery} loading={loading} dragId={dragId} setDragId={setDragId} serialSaving={serialSaving} reorderEmployees={reorderEmployees} changeEmployeeSerial={changeEmployeeSerial} repairEmployeeIds={repairEmployeeIds} copyPhone={copyPhone} money={money} text={text} phoneDigits={phoneDigits} today={today} EmployeeStatus={EmployeeStatus} TodayAttendance={TodayAttendance} openEdit={openEdit} remove={remove} storage={storage} />
        :active==="daily-attendance" ? <AttendancePage />
        :active==="attendance-management" ? <AttendanceManagementPage />
        :config ? <GenericModulePage config={config} rows={rows} query={query} setQuery={setQuery} loading={loading} filtered={filtered} text={text} money={money} openEdit={openEdit} remove={remove} />
        :null}
        <footer>© 2026 Shunyi Garments Management <span>MongoDB · Local JSON fallback · ImgBB URLs</span></footer>
      </div>
    </section>
    {modal&&config&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false)}}><form className="modal" onSubmit={submit}><div className="modal-head"><div><h2>{editing?`Edit ${config.singular}`:`Add ${config.singular}`}</h2><p>All listed fields can be edited. Photo uses a direct ImgBB image URL.</p></div><button type="button" className="icon-btn" onClick={()=>setModal(false)}>×</button></div><div className="form-grid">{config.fields.map(field=><label key={field.key}>{field.label}{field.type==="select"?<select required={field.required} value={form[field.key]??""} onChange={e=>setForm({...form,[field.key]:e.target.value})}><option value="">Select {field.label.toLowerCase()}</option>{field.options?.map(option=><option key={option}>{option}</option>)}</select>:field.type==="textarea"?<textarea rows={4} value={form[field.key]??""} onChange={e=>setForm({...form,[field.key]:e.target.value})} placeholder={`Write ${field.label.toLowerCase()}...`}/>:field.type==="image"?<><input type="url" value={form[field.key]??""} onChange={e=>setForm({...form,[field.key]:e.target.value})} placeholder="Paste ImgBB direct image URL"/>{form[field.key]&&<div className="photo-preview-wrap"><img className="photo-preview" src={form[field.key]} alt="Employee preview" onError={e=>{e.currentTarget.style.display="none";}}/><button type="button" className="remove-photo" onClick={()=>setForm(v=>({...v,[field.key]:""}))}>Remove photo URL</button></div>}<small className="field-help">Upload at imgbb.com, then paste the direct image URL.</small></>:<input required={field.required} type={field.type} value={form[field.key]??""} onChange={e=>setForm({...form,[field.key]:e.target.value})} placeholder={`Enter ${field.label.toLowerCase()}`}/>}</label>)}</div>{error&&<p className="form-error">{error}</p>}<div className="modal-actions"><button type="button" className="btn secondary" onClick={()=>setModal(false)}>Cancel</button><button className="btn primary" disabled={loading}>{loading?"Saving":"Save changes"}</button></div></form></div>}
  </main>;
}

function TodayAttendance({employee,records}:{employee:Row;records:Map<string,Row>}) {
  const record=records.get(String(employee.id))||records.get(String(employee.name||""));
  const status=String(record?.status||"Not marked");
  return <span className={`attendance-status ${status.toLowerCase().replace(/\s/g,"-")}`}>{status}</span>;
}
function EmployeeStatus({row}:{row:Row}) {
  const future=String(row.joiningDate||"")>today(); const status=future?"Future joining":String(row.status||"Active");
  return <span className={`employee-status ${status.toLowerCase().replace(/\s/g,"-")}`}>{status}</span>;
}
