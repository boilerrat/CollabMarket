import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ProjectUpdateInput } from "@/lib/schemas";
import { sanitizeText, sanitizeArray } from "@/lib/sanitize";
import { isTextAllowed } from "@/lib/moderation";

function normalizeProject(p: any) {
  return {
    id: p.id,
    ownerUserId: p.owner_user_id,
    title: p.title,
    pitch: p.pitch,
    category: p.category,
    onchain: p.onchain,
    repoUrl: p.repo_url,
    contactMethod: p.contact_method,
    contactValue: p.contact_value,
    commitment: p.commitment,
    startDate: p.start_date,
    incentives: p.incentives,
    status: p.status,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    roles: p.roles?.map((r: any) => ({ id: r.id, skill: r.skill, level: r.level, count: r.count })) ?? [],
  };
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: { code: "UNAUTHENTICATED" } }, { status: 401 });

  const id = params.id;
  const project = await prisma.projects.findUnique({ where: { id }, select: { id: true, owner_user_id: true } });
  if (!project) return NextResponse.json({ error: { code: "NOT_FOUND" } }, { status: 404 });
  if (project.owner_user_id !== session.userId) return NextResponse.json({ error: { code: "FORBIDDEN" } }, { status: 403 });

  const payload = await request.json();
  const parsed = ProjectUpdateInput.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: { code: "BAD_REQUEST" } }, { status: 400 });
  const d = parsed.data;
  if (d.title && !isTextAllowed(d.title)) return NextResponse.json({ error: { code: "CONTENT_BLOCKED" } }, { status: 400 });
  if (d.pitch && !isTextAllowed(d.pitch)) return NextResponse.json({ error: { code: "CONTENT_BLOCKED" } }, { status: 400 });
  if (d.contactValue && !isTextAllowed(d.contactValue)) return NextResponse.json({ error: { code: "CONTENT_BLOCKED" } }, { status: 400 });

  const update: any = {};
  if (d.title) update.title = sanitizeText(d.title);
  if (d.pitch) update.pitch = sanitizeText(d.pitch);
  if (d.category) update.category = sanitizeText(d.category);
  if (typeof d.onchain === "boolean") update.onchain = d.onchain;
  if (d.repoUrl !== undefined) update.repo_url = d.repoUrl;
  if (d.contactMethod) update.contact_method = sanitizeText(d.contactMethod);
  if (d.contactValue) update.contact_value = sanitizeText(d.contactValue);
  if (d.commitment) update.commitment = sanitizeText(d.commitment);
  if (d.startDate !== undefined) update.start_date = d.startDate ? new Date(d.startDate) : null;
  if (d.incentives) update.incentives = sanitizeArray(d.incentives);
  if (d.status) update.status = d.status;

  const updated = await prisma.projects.update({ where: { id }, data: update, include: { roles: true } });
  return NextResponse.json({ project: normalizeProject(updated) });
}
