import { prisma } from "@/server/db";
import { getOrCreateUserId } from "@/server/auth";

export async function GET() {
  const userId = await getOrCreateUserId();
  if (!userId) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return Response.json({ ok: true, user });
}


