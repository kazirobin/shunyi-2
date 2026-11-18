import type { AttendanceRecord } from "./model";

const endpoint = "/api/attendance";
export async function list(): Promise<AttendanceRecord[]> {
  const response = await fetch(endpoint, { cache: "no-store" });
  if (!response.ok) throw new Error(`Could not load attendance`);
  return response.json();
}
export async function create(payload: Record<string, unknown>) {
  const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error(`Could not create attendance record`);
  return response.json();
}
export async function update(id: string, payload: Record<string, unknown>) {
  const response = await fetch(`${endpoint}/${encodeURIComponent(id)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error(`Could not update attendance record`);
  return response.json();
}
export async function remove(id: string) {
  const response = await fetch(`${endpoint}/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!response.ok) throw new Error(`Could not delete attendance record`);
}
