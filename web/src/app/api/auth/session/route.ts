import { cookies } from "next/headers";
import { NextRequest } from "next/server";

// Temporary: store token in an httpOnly cookie for demo purposes.
// Replace with server-side verification and a signed session cookie.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = typeof body?.token === "string" ? body.token : undefined;
    if (!token) {
      return Response.json({ ok: false, error: "missing token" }, { status: 400 });
    }

    const cookieStore = await cookies();
    cookieStore.set({
      name: "fc_session",
      value: token,
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      secure: true,
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "bad request" }, { status: 400 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set({ name: "fc_session", value: "", path: "/", maxAge: 0 });
  return Response.json({ ok: true });
}


