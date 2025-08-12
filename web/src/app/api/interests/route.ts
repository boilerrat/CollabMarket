import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { getOrCreateUserId } from "@/server/auth";
import { newInterestSchema } from "@/app/api/_validation";

export async function POST(req: NextRequest) {
  const fromUserId = await getOrCreateUserId();
  if (!fromUserId) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  let body: { projectId?: string; message?: string };
  try {
    body = newInterestSchema.parse(await req.json());
  } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400 });
  }
  const projectId = String(body?.projectId || "").trim();
  if (!projectId) return Response.json({ ok: false, error: "projectId required" }, { status: 400 });
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return Response.json({ ok: false, error: "project not found" }, { status: 404 });
  const profile = await prisma.collaboratorProfile.findFirst({ where: { userId: fromUserId } });
  const profileSkills = (profile?.skills || []).map((x) => x.toLowerCase());
  const hasMatch = project.skills.some((s) => profileSkills.includes(s.toLowerCase()));
  const interest = await prisma.interest.create({ data: { projectId, fromUserId, message: body?.message, skillMatch: hasMatch } });
  return Response.json({ ok: true, interest });
}


