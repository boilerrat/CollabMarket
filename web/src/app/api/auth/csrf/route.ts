import { NextRequest, NextResponse } from "next/server";

const CSRF_COOKIE = "cm_csrf";
const CSRF_HEADER = "x-csrf-token";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.json({ ok: true });
  const existing = request.cookies.get(CSRF_COOKIE)?.value;
  const token = existing ?? crypto.randomUUID().replace(/-/g, "");
  if (!existing) {
    response.cookies.set(CSRF_COOKIE, token, { httpOnly: false, secure: true, sameSite: "strict", path: "/", maxAge: 60 * 60 * 24 });
  }
  response.headers.set("x-csrf-header", CSRF_HEADER);
  response.headers.set("x-csrf-token", token);
  return response;
}


