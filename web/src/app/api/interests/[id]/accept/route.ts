import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(_request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: { code: "UNAUTHENTICATED" } }, { status: 401 });

  const interest = await prisma.interests.findUnique({
    where: { id: params.id },
    include: { project: { select: { owner_user_id: true } } },
  });
  if (!interest) return NextResponse.json({ error: { code: "NOT_FOUND" } }, { status: 404 });
  if (interest.project.owner_user_id !== session.userId) return NextResponse.json({ error: { code: "FORBIDDEN" } }, { status: 403 });

  const updated = await prisma.interests.update({ where: { id: params.id }, data: { status: "accepted" } });
  return NextResponse.json({ interest: { id: updated.id, status: updated.status, createdAt: updated.created_at } });
}

