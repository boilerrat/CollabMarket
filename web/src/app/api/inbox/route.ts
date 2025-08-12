import { getOrCreateUserId } from "@/server/auth";
import { prisma } from "@/server/db";
import { okJson, errorJson } from "@/app/api/_responses";

export async function GET() {
  const userId = await getOrCreateUserId();
  if (!userId) return errorJson("unauthorized", 401);
  const items = await prisma.interest.findMany({ where: { project: { ownerId: userId } }, orderBy: { createdAt: "desc" } });
  const res = okJson({ inbox: items });
  res.headers.set("Cache-Control", "private, max-age=30");
  return res;
}


