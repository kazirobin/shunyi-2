import { NextResponse } from "next/server";
import { scryptSync, timingSafeEqual } from "node:crypto";
import { createSessionToken, sessionCookieName } from "@/lib/session";

function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  let expected: Buffer;
  try { expected = Buffer.from(hash, "hex"); } catch { return false; }
  return expected.length === candidate.length && timingSafeEqual(candidate, expected);
}
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json() as { email?: string; password?: string };
    const adminEmail = process.env.ADMIN_EMAIL;
    const passwordHash = process.env.ADMIN_PASSWORD_HASH;
    if (!adminEmail || !passwordHash || !process.env.SESSION_SECRET) return NextResponse.json({ error: "Admin authentication is not configured. Check server environment variables." }, { status: 503 });
    if (!email || !password || email.toLowerCase() !== adminEmail.toLowerCase() || !verifyPassword(password, passwordHash)) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    const response = NextResponse.json({ success: true });
    response.cookies.set(sessionCookieName, createSessionToken(adminEmail), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 12 });
    return response;
  } catch { return NextResponse.json({ error: "Unable to process login." }, { status: 400 }); }
}
