import { getOrCreateUserId } from "@/server/auth";
import { prisma } from "@/server/db";

export async function GET() {
  const userId = await getOrCreateUserId();
  if (!userId) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const items = await prisma.interest.findMany({ where: { project: { ownerId: userId } }, orderBy: { createdAt: "desc" } });
  return Response.json({ ok: true, inbox: items });
}


