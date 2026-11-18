import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "shunyi_admin_session";
const secret = () => {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must be configured with at least 32 characters.");
  return value;
};
export function createSessionToken(email: string) {
  const payload = Buffer.from(JSON.stringify({ sub: email, exp: Date.now() + 1000 * 60 * 60 * 12 })).toString("base64url");
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}
export function verifySessionToken(token: string) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = createHmac("sha256", secret()).update(payload).digest();
  let actual: Buffer;
  try { actual = Buffer.from(signature, "base64url"); } catch { return false; }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
  try { const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { sub?: string; exp?: number }; return !!data.sub && typeof data.exp === "number" && data.exp > Date.now(); } catch { return false; }
}
export const sessionCookieName = COOKIE_NAME;
export async function isAdminSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : false;
}
