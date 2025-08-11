import { NextRequest } from "next/server";
import { getUserKey } from "@/app/api/utils/session";
import { prisma } from "@/server/db";
import { getOrCreateUserId } from "@/server/auth";

export async function POST(req: NextRequest) {
  const fromUserId = await getOrCreateUserId();
  if (!fromUserId) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  let body: { projectId?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400 });
  }
  const projectId = String(body?.projectId || "").trim();
  if (!projectId) return Response.json({ ok: false, error: "projectId required" }, { status: 400 });
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return Response.json({ ok: false, error: "project not found" }, { status: 404 });
  const profile = await prisma.collaboratorProfile.findFirst({ where: { userId: fromUserId } });
  const hasMatch = !!profile && project.skills.some((s) => (profile.skills || []).map((x) => x.toLowerCase()).includes(s.toLowerCase()));
  const interest = await prisma.interest.create({ data: { projectId, fromUserId, message: body?.message, skillMatch: hasMatch } });
  return Response.json({ ok: true, interest });
}


