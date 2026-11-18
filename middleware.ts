import { NextRequest, NextResponse } from "next/server";

async function validSession(token: string, secret: string) {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  try {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const decode = (value: string) => Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
    const ok = await crypto.subtle.verify("HMAC", key, decode(parts[1]), new TextEncoder().encode(parts[0]));
    if (!ok) return false;
    const payload = JSON.parse(new TextDecoder().decode(decode(parts[0]))) as { sub?: string; exp?: number };
    return !!payload.sub && typeof payload.exp === "number" && payload.exp > Date.now();
  } catch { return false; }
}
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === "/login" && request.cookies.has("shunyi_admin_session")) {
    const secret = process.env.SESSION_SECRET;
    const token = request.cookies.get("shunyi_admin_session")?.value || "";
    if (secret && await validSession(token, secret)) return NextResponse.redirect(new URL("/overview", request.url));
  }
  const isProtectedPage = path === "/overview" || path === "/admin" || path === "/employees" || path === "/attendance-management" || path === "/daily-attendance" || path.startsWith("/api/") && !path.startsWith("/api/auth/") || path !== "/" && !path.startsWith("/login") && !path.startsWith("/_next/") && !path.includes(".");
  if (!isProtectedPage) return NextResponse.next();
  const secret = process.env.SESSION_SECRET;
  const token = request.cookies.get("shunyi_admin_session")?.value || "";
  if (secret && await validSession(token, secret)) return NextResponse.next();
  if (path.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized. Admin login required." }, { status: 401 });
  return NextResponse.redirect(new URL("/login", request.url));
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
