import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(_request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: { code: "UNAUTHENTICATED" } }, { status: 401 });
  const me = await prisma.users.findUnique({ where: { id: session.userId }, select: { shadow_banned: true } });
  if (me?.shadow_banned) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Account restricted" } }, { status: 403 });

  const project = await prisma.projects.findUnique({ where: { id: params.id } });
  if (!project) return NextResponse.json({ error: { code: "NOT_FOUND" } }, { status: 404 });
  if (project.owner_user_id === session.userId) return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Cannot interest own project" } }, { status: 400 });

  const created = await prisma.interests.create({
    data: {
      project_id: project.id,
      from_user_id: session.userId,
      status: "pending",
    },
  });

  // Placeholder: webhook/notification would trigger here
  return NextResponse.json({ interest: { id: created.id, status: created.status, createdAt: created.created_at } }, { status: 201 });
}
