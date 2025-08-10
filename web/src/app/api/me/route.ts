import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(_request: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });
  const user = await prisma.users.findUnique({
    where: { id: session.userId },
    select: { id: true, fid: true, handle: true, display_name: true, avatar_url: true },
  });
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: { ...user, displayName: user.display_name, avatarUrl: user.avatar_url },
  });
}


