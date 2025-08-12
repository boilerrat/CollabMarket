import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { getOrCreateUserId } from "@/server/auth";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const project = await prisma.project.findUnique({ where: { id }, include: { owner: true, roles: true } });
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
  let body: Partial<{
    title: string;
    pitch: string;
    skills: string[];
    projectType: string;
    status: string;
    archived: boolean;
    roles: Array<{ id?: string; skill: string; level?: string | null; count?: number | null }>;
  }> = {};
  try {
    body = await req.json();
  } catch {}
  const data: Record<string, unknown> = {};
  if (typeof body.title === "string") data.title = body.title;
  if (typeof body.pitch === "string") data.pitch = body.pitch;
  if (Array.isArray(body.skills)) data.skills = body.skills;
  if (typeof body.projectType === "string") data.projectType = body.projectType;
  if (typeof body.status === "string") data.status = body.status;
  if (typeof body.archived === "boolean") data.archived = body.archived;
  const project = await prisma.$transaction(async (tx) => {
    const updated = await tx.project.update({ where: { id }, data });
    if (Array.isArray(body.roles)) {
      const roles = body.roles
        .map((r) => ({ id: r?.id, skill: String(r?.skill || "").trim(), level: r?.level ? String(r.level).trim() : null, count: Number(r?.count ?? 1) }))
        .filter((r) => !!r.skill);
      // Upsert provided roles
      for (const role of roles) {
        if (role.id) {
          await tx.projectRole.update({ where: { id: role.id }, data: { skill: role.skill, level: role.level || undefined, count: Number.isFinite(role.count) ? role.count : 1 } });
        } else {
          await tx.projectRole.create({ data: { projectId: id, skill: role.skill, level: role.level || undefined, count: Number.isFinite(role.count) ? role.count : 1 } });
        }
      }
      // Optionally prune roles not present when a complete replacement is intended
      // If client sends roles array, remove roles not in payload ids
      const keepIds = new Set(roles.filter((r) => r.id).map((r) => r.id as string));
      await tx.projectRole.deleteMany({ where: { projectId: id, NOT: { id: { in: Array.from(keepIds) } } } });
    }
    return updated;
  });
  return Response.json({ ok: true, project });
}


