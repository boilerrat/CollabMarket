import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { getOrCreateUserId } from "@/server/auth";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const project = await prisma.project.findUnique({ where: { id }, include: { owner: true } });
  if (!project) return Response.json({ ok: false, error: "not found" }, { status: 404 });
  return Response.json({ ok: true, project });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const ownerId = await getOrCreateUserId();
  if (!ownerId) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return Response.json({ ok: false, error: "not found" }, { status: 404 });
  if (existing.ownerId !== ownerId) return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
  let body: any = {};
  try {
    body = await req.json();
  } catch {}
  const data: any = {};
  if (typeof body.title === "string") data.title = body.title;
  if (typeof body.pitch === "string") data.pitch = body.pitch;
  if (Array.isArray(body.skills)) data.skills = body.skills;
  if (typeof body.projectType === "string") data.projectType = body.projectType;
  if (typeof body.status === "string") data.status = body.status;
  if (typeof body.archived === "boolean") data.archived = body.archived;
  const project = await prisma.project.update({ where: { id }, data });
  return Response.json({ ok: true, project });
}


