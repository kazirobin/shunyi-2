import { NextResponse } from "next/server";
import { getStorageStatus } from "@/lib/file-storage";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  const status = await getStorageStatus();
  return NextResponse.json(status, { status: status.connected ? 200 : 503 });
}
