import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { getOrCreateUserId } from "@/server/auth";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const userId = await getOrCreateUserId();
  if (!userId) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  let body: { status?: "accepted" | "dismissed" } = {};
  try {
    body = await req.json();
  } catch {}
  const interest = await prisma.interest.findUnique({ where: { id } });
  if (!interest) return Response.json({ ok: false, error: "not found" }, { status: 404 });
  const project = await prisma.project.findUnique({ where: { id: interest.projectId } });
  if (!project || project.ownerId !== userId) return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
  const updated = await prisma.interest.update({ where: { id }, data: { status: body.status || "pending" } });
  return Response.json({ ok: true, interest: updated });
}


