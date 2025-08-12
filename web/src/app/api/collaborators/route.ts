import { NextRequest } from "next/server";
import { prisma } from "@/server/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const skills = (searchParams.get("skills") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const projectType = (searchParams.get("type") || "").trim();
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const per = Math.min(50, Math.max(1, Number(searchParams.get("per") || 10)));

  const where: Record<string, unknown> = {};
  if (projectType) where.projectTypes = { has: projectType };
  if (skills.length) where.skills = { hasEvery: skills };
  if (q) {
    where.OR = [
      { bio: { contains: q, mode: "insensitive" } },
      {
        user: {
          OR: [
            { displayName: { contains: q, mode: "insensitive" } },
            { handle: { contains: q, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  const list = await prisma.collaboratorProfile.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { user: true },
    skip: (page - 1) * per,
    take: per,
  });

  const collaborators = list.map((p) => ({
    userKey: p.userId,
    display_name: p.user?.displayName || "",
    handle: p.user?.handle || "",
    bio: p.bio || "",
    skills: p.skills || [],
    project_types: p.projectTypes || [],
  }));

  return Response.json({ ok: true, collaborators, page, per, hasMore: list.length === per });
}


