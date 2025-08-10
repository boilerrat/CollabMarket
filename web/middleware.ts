import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CSRF_COOKIE = "cm_csrf";
const CSRF_HEADER = "x-csrf-token";

function ensureCsrf(request: NextRequest, response: NextResponse): string {
  const existing = request.cookies.get(CSRF_COOKIE)?.value;
  if (existing) return existing;
  // Use Web Crypto in Edge runtime
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  const token = Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
  response.cookies.set(CSRF_COOKIE, token, { httpOnly: false, secure: true, sameSite: "strict", path: "/", maxAge: 60 * 60 * 24 });
  return token;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "img-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-eval'", // allow Next dev
      "connect-src 'self'",
      "frame-ancestors 'self'",
    ].join("; ")
  );
  // Note: Add CSP later to ensure compatibility with Farcaster Mini App container
  // CSRF: ensure token cookie and enforce on state-changing requests
  const method = request.method.toUpperCase();
  const isStateChanging = method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";
  // Skip CSRF for Next.js internal, static assets and health checks
  const pathname = request.nextUrl.pathname;
  const skip = pathname.startsWith("/_next/") || pathname.startsWith("/api/health");
  if (!skip) {
    const token = ensureCsrf(request, response);
    response.headers.set("x-csrf-header", CSRF_HEADER);
    response.headers.set("x-csrf-token", token);
    if (isStateChanging) {
      const header = request.headers.get(CSRF_HEADER);
      const cookie = request.cookies.get(CSRF_COOKIE)?.value;
      if (!header || !cookie || header !== cookie) {
      return NextResponse.json(
        { error: { code: "CSRF", message: "Invalid CSRF token" } },
        { status: 403 }
      );
      }
    }
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

