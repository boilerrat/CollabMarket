import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { getOrCreateUserId } from "@/server/auth";

export async function GET() {
  const userId = await getOrCreateUserId();
  if (!userId) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const profile = await prisma.collaboratorProfile.findFirst({ where: { userId } });
  return Response.json({ ok: true, profile });
}

export async function POST(req: NextRequest) {
  const userId = await getOrCreateUserId();
  if (!userId) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let data: {
    display_name?: string;
    handle?: string;
    bio?: string;
    skills?: string[] | string;
    project_types?: string[] | string;
    availability_hours_week?: number | string;
  };
  try {
    data = await req.json();
  } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const display_name = String(data?.display_name || "").trim();
  const handle = String(data?.handle || "").trim();
  const bio = String(data?.bio || "");
  const skills: string[] = Array.isArray(data?.skills)
    ? data.skills.map((s) => String(s).trim()).filter(Boolean)
    : String(data?.skills || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
  const project_types: string[] = Array.isArray(data?.project_types)
    ? data.project_types.map((s) => String(s).trim()).filter(Boolean)
    : String(data?.project_types || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
  const availability_hours_week = Number(data?.availability_hours_week);

  if (!display_name || !handle) {
    return Response.json({ ok: false, error: "display_name and handle are required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.upsert({ where: { id: userId }, update: { handle: handle || undefined, displayName: display_name || undefined }, create: { id: userId, handle, displayName: display_name } });
    const existing = await prisma.collaboratorProfile.findFirst({ where: { userId: user.id } });
    const profile = existing
      ? await prisma.collaboratorProfile.update({
          where: { id: existing.id },
          data: {
            bio,
            skills,
            projectTypes: project_types,
            availabilityHoursWeek: Number.isFinite(availability_hours_week) ? availability_hours_week : null,
          },
        })
      : await prisma.collaboratorProfile.create({
          data: {
            userId: user.id,
            bio,
            skills,
            projectTypes: project_types,
            availabilityHoursWeek: Number.isFinite(availability_hours_week) ? availability_hours_week : null,
          },
        });
    return Response.json({ ok: true, profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : "failed";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}


