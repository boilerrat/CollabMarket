import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/server/db";
import { verifyQuickAuthToken, getSessionSecret } from "@/server/auth";

// Temporary: store token in an httpOnly cookie for demo purposes.
// Replace with server-side verification and a signed session cookie.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = typeof body?.token === "string" ? body.token : undefined;
    if (!token) {
      return Response.json({ ok: false, error: "missing token" }, { status: 400 });
    }
    // Verify token server-side and upsert user with derived identity.
    const claims = await verifyQuickAuthToken(token);
    if (!claims) {
      return Response.json({ ok: false, error: "invalid token" }, { status: 401 });
    }
    if (claims.fid) {
      const userId = `usr_fid_${claims.fid}`;
      await prisma.user.upsert({
        where: { id: userId },
        update: { fid: claims.fid, handle: claims.username || undefined, displayName: claims.displayName || undefined, avatarUrl: claims.pfpUrl || undefined },
        create: { id: userId, fid: claims.fid, handle: claims.username || undefined, displayName: claims.displayName || undefined, avatarUrl: claims.pfpUrl || undefined },
      });
    }
    const secret = getSessionSecret();
    const sig = createHmac("sha256", secret).update(token).digest("hex");
    const value = `${token}.${sig}`;
    const cookieStore = await cookies();
    cookieStore.set({
      name: "fc_session",
      value,
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


