import type { BuyersRecord } from "./model";

const endpoint = "/api/buyers";
export async function list(): Promise<BuyersRecord[]> {
  const response = await fetch(endpoint, { cache: "no-store" });
  if (!response.ok) throw new Error(`Could not load buyers`);
  return response.json();
}
export async function create(payload: Record<string, unknown>) {
  const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error(`Could not create buyers record`);
  return response.json();
}
export async function update(id: string, payload: Record<string, unknown>) {
  const response = await fetch(`${endpoint}/${encodeURIComponent(id)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error(`Could not update buyers record`);
  return response.json();
}
export async function remove(id: string) {
  const response = await fetch(`${endpoint}/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!response.ok) throw new Error(`Could not delete buyers record`);
}
