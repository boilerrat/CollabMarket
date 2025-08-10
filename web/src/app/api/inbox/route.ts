import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(_request: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: { code: "UNAUTHENTICATED" } }, { status: 401 });

  // Interests for projects owned by the current user
  const items = await prisma.interests.findMany({
    where: { project: { owner_user_id: session.userId } },
    orderBy: { created_at: "desc" },
    include: {
      project: { select: { id: true, title: true } },
      from_user: { select: { id: true, handle: true, display_name: true, avatar_url: true } },
    },
  });

  const mapped = items.map((i) => ({
    id: i.id,
    status: i.status,
    createdAt: i.created_at,
    project: i.project,
    fromUser: { id: i.from_user.id, handle: i.from_user.handle, displayName: i.from_user.display_name, avatarUrl: i.from_user.avatar_url },
  }));
  return NextResponse.json({ items: mapped });
}

