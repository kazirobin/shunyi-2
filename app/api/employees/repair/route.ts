import { NextResponse } from "next/server";
import { getLastStorageMode, repairEmployeeIdentityConflicts } from "@/lib/file-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || (body as { confirm?: unknown }).confirm !== "REPAIR_EMPLOYEE_IDS") {
      return NextResponse.json({ error: "Explicit confirmation is required before repairing employee IDs." }, { status: 400 });
    }
    const result = await repairEmployeeIdentityConflicts();
    return NextResponse.json(result, { headers: { "X-Storage-Mode": getLastStorageMode() } });
  } catch (error) {
    console.error("[api][employees][repair]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Employee identity repair failed" }, { status: 500 });
  }
}
