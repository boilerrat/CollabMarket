import { prisma } from "@/server/db";
import { getOrCreateUserId } from "@/server/auth";
import { getFeeConfig } from "@/app/api/utils/fees";

export async function GET() {
  const userId = await getOrCreateUserId();
  if (!userId) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const fees = await getFeeConfig();
  return Response.json({ ok: true, user, fees });
}


