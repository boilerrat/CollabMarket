import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/server/db";
import { verifyQuickAuthToken } from "@/server/auth";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
    return Response.json({ ok: false, error: "missing token" }, { status: 401 });
  }
  const token = auth.slice(7).trim();
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
  const secret = process.env.SESSION_SECRET || "dev-secret-not-for-prod";
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
    maxAge: 60 * 60 * 8,
  });
  return Response.json({ ok: true });
}



