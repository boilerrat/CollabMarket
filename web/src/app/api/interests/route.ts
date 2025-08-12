import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { getOrCreateUserId } from "@/server/auth";
import { newInterestSchema } from "@/app/api/_validation";
import { okJson, errorJson } from "@/app/api/_responses";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const fromUserId = await getOrCreateUserId();
  if (!fromUserId) return errorJson("unauthorized", 401);
  let body: { projectId?: string; message?: string };
  try {
    body = newInterestSchema.parse(await req.json());
  } catch {
    return errorJson("invalid json", 400, "invalid_input");
  }
  const projectId = String(body?.projectId || "").trim();
  if (!projectId) return errorJson("projectId required", 400, "invalid_input");
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return errorJson("project not found", 404);
  const profile = await prisma.collaboratorProfile.findFirst({ where: { userId: fromUserId } });
  const profileSkills = (profile?.skills || []).map((x) => x.toLowerCase());
  const hasMatch = project.skills.some((s) => profileSkills.includes(s.toLowerCase()));
  try {
    const interest = await prisma.interest.create({ data: { projectId, fromUserId, message: body?.message, skillMatch: hasMatch } });
    revalidatePath("/inbox");
    return okJson({ interest });
  } catch (e) {
    // Unique constraint duplicate interest
    return errorJson("duplicate interest", 409, "conflict");
  }
}


