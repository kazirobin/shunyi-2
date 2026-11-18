import { NextResponse } from "next/server";
import { deleteRecord, getLastStorageMode, updateRecord } from "@/lib/file-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(request: Request, context: { params: Promise<{ resource: string; id: string }> }) {
  try {
    const { resource, id } = await context.params;
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Expected a JSON object" }, { status: 400 });
    const updated = await updateRecord(resource, decodeURIComponent(id), body as Record<string, unknown>);
    if (updated) console.info(`[api][PUT][${resource}] record updated: ${id}`);
    return updated ? NextResponse.json(updated, { headers: { "X-Storage-Mode": getLastStorageMode() } }) : NextResponse.json({ error: "Record not found" }, { status: 404 });
  } catch (error) {
    console.error("[api][resource-id]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update record" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ resource: string; id: string }> }) {
  try {
    const { resource, id } = await context.params;
    const deleted = await deleteRecord(resource, decodeURIComponent(id));
    if (deleted) console.info(`[api][DELETE][${resource}] record deleted: ${id}`);
    return deleted ? NextResponse.json({ success: true }, { headers: { "X-Storage-Mode": getLastStorageMode() } }) : NextResponse.json({ error: "Record not found" }, { status: 404 });
  } catch (error) {
    console.error("[api][resource-id]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete record" }, { status: 400 });
  }
}
