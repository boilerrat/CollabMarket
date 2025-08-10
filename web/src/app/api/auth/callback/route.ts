import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/session";
import { jwtVerify } from "jose";

type FarcasterAuthPayload = {
  fid: number;
  handle?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  quickAuthToken?: string | null; // optional Mini App Quick Auth token
};

type QuickAuthClaims = {
  fid: number | string;
  handle?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
};

async function verifyQuickAuthToken(token: string): Promise<{
  fid: number;
  handle?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
} | null> {
  try {
    const secret = process.env.MINIAPP_QUICKAUTH_JWT_SECRET;
    if (!secret) return null;
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const claims = payload as unknown as QuickAuthClaims;
    const fid = typeof claims.fid === "number" ? claims.fid : Number(claims.fid);
    if (!fid || Number.isNaN(fid)) return null;
    return {
      fid,
      handle: claims.handle ?? null,
      displayName: claims.displayName ?? null,
      avatarUrl: claims.avatarUrl ?? null,
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as FarcasterAuthPayload | null;
    let fid = body?.fid;
    let handle = body?.handle ?? null;
    let displayName = body?.displayName ?? null;
    let avatarUrl = body?.avatarUrl ?? null;

    if (!fid && body?.quickAuthToken) {
      const verified = await verifyQuickAuthToken(body.quickAuthToken);
      if (verified) {
        fid = verified.fid;
        handle = handle ?? verified.handle ?? null;
        displayName = displayName ?? verified.displayName ?? null;
        avatarUrl = avatarUrl ?? verified.avatarUrl ?? null;
      }
    }

    if (typeof fid !== "number") {
      return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Missing fid" } }, { status: 400 });
    }

    const fidBig = BigInt(fid);

    const user = await prisma.users.upsert({
      where: { fid: fidBig },
      update: {
        handle: handle ?? undefined,
        display_name: displayName ?? undefined,
        avatar_url: avatarUrl ?? undefined,
        updated_at: new Date(),
      },
      create: {
        fid: fidBig,
        handle: handle ?? `user_${fid}`,
        display_name: displayName ?? null,
        avatar_url: avatarUrl ?? null,
      },
      select: { id: true, fid: true, handle: true, display_name: true, avatar_url: true },
    });

    await setSession({ fid: user.fid.toString(), userId: user.id });

    return NextResponse.json({ user: { ...user, displayName: user.display_name, avatarUrl: user.avatar_url } });
  } catch (error) {
    return NextResponse.json({ error: { code: "SERVER_ERROR", message: "Auth failed" } }, { status: 500 });
  }
}


