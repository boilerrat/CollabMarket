import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { getOrCreateUserId } from "@/server/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const skills = (searchParams.get("skills") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const projectType = searchParams.get("type") || "";
  const archivedParam = searchParams.get("archived");
  const showArchived = archivedParam === "1" || archivedParam === "true";
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const per = Math.min(50, Math.max(1, Number(searchParams.get("per") || 10)));

  const where: any = {};
  if (!showArchived) where.archived = false;
  if (projectType) where.projectType = projectType;
  if (skills.length) where.skills = { hasEvery: skills };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { pitch: { contains: q, mode: "insensitive" } },
    ];
  }

  const list = await prisma.project.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { owner: true },
    skip: (page - 1) * per,
    take: per,
  });
  return Response.json({ ok: true, projects: list, page, per, hasMore: list.length === per });
}

export async function POST(req: NextRequest) {
  const ownerId = await getOrCreateUserId();
  if (!ownerId) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  let data: Partial<Project>;
  try {
    data = await req.json();
  } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400 });
  }
  const title = (data.title || "").trim();
  const pitch = (data.pitch || "").trim();
  const skills = Array.isArray(data.skills) ? data.skills : [];
  if (!title || !pitch) return Response.json({ ok: false, error: "title and pitch required" }, { status: 400 });
  const project = await prisma.project.create({
    data: {
      ownerId,
      title,
      pitch,
      projectType: data.project_type || undefined,
      skills: skills.map((s) => String(s).trim()).filter(Boolean),
    },
  });
  return Response.json({ ok: true, project });
}


