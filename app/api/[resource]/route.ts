import { NextResponse } from "next/server";
import { createRecord, getLastStorageMode, readRecords } from "@/lib/file-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ resource: string }> }) {
  try {
    const { resource } = await context.params;
    const records = await readRecords(resource);
    console.info(`[api][GET][${resource}] ${records.length} records returned`);
    return NextResponse.json(records, { headers: { "X-Storage-Mode": getLastStorageMode() } });
  } catch (error) {
    console.error("[api][resource]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to read data" }, { status: 400 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ resource: string }> }) {
  try {
    const { resource } = await context.params;
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Expected a JSON object" }, { status: 400 });
    const record = await createRecord(resource, body as Record<string, unknown>);
    console.info(`[api][POST][${resource}] record created: ${String(record.id)}`);
    return NextResponse.json(record, { status: 201, headers: { "X-Storage-Mode": getLastStorageMode() } });
  } catch (error) {
    console.error("[api][resource]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create record" }, { status: 400 });
  }
}
