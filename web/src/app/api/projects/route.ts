import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { getOrCreateUserId } from "@/server/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase();
  const skills = (searchParams.get("skills") || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  const projectType = (searchParams.get("type") || "").toLowerCase();

  const all = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
  const list = all.filter((p) => {
    if (q && !(`${p.title} ${p.pitch}`.toLowerCase().includes(q))) return false;
    if (projectType && (p.projectType || "").toLowerCase() !== projectType) return false;
    if (skills.length && !skills.every((s) => (p.skills || []).map((x) => x.toLowerCase()).includes(s))) return false;
    return true;
  });
  return Response.json({ ok: true, projects: list });
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


