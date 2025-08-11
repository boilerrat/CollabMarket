import { NextRequest } from "next/server";
import { prisma } from "@/server/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase();
  const skills = (searchParams.get("skills") || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const projectType = (searchParams.get("type") || "").toLowerCase();

  const all = await prisma.collaboratorProfile.findMany({ include: { user: true } });
  const list = all.filter((p) => {
    if (q && !(`${p.user?.displayName || ""} ${p.user?.handle || ""} ${p.bio || ""}`.toLowerCase().includes(q))) return false;
    if (projectType && !(p.projectTypes || []).map((t) => t.toLowerCase()).includes(projectType)) return false;
    if (skills.length && !skills.every((s) => (p.skills || []).map((x) => x.toLowerCase()).includes(s))) return false;
    return true;
  }).map((p) => ({
    userKey: p.userId,
    display_name: p.user?.displayName || "",
    handle: p.user?.handle || "",
    bio: p.bio || "",
    skills: p.skills || [],
    project_types: p.projectTypes || [],
  }));

  return Response.json({ ok: true, collaborators: list });
}


