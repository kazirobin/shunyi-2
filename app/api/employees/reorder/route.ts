import { NextResponse } from "next/server";
import { getLastStorageMode, reorderRecords } from "@/lib/file-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || !Array.isArray((body as { ids?: unknown }).ids) || !(body as { ids: unknown[] }).ids.every(id => typeof id === "string")) {
      return NextResponse.json({ error: "Expected an ordered list of employee IDs" }, { status: 400 });
    }
    const ordered = await reorderRecords("employees", (body as { ids: string[] }).ids);
    return NextResponse.json(ordered, { headers: { "X-Storage-Mode": getLastStorageMode() } });
  } catch (error) {
    console.error("[api][employees][reorder]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save employee order" }, { status: 400 });
  }
}
