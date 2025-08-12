import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { getOrCreateUserId } from "@/server/auth";
import { getFeeConfig, verifyAndRecordPayment } from "@/app/api/utils/fees";

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
    links?: Array<{ label?: string; url: string }> | string;
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
  // Parse links: accept array of objects or comma-separated URLs
  let links: Array<{ label?: string; url: string }> | undefined;
  if (Array.isArray(data?.links)) {
    links = data.links
      .map((l) => ({ label: l?.label ? String(l.label).trim() : undefined, url: String(l?.url || "").trim() }))
      .filter((l) => !!l.url);
  } else if (typeof data?.links === "string" && data.links.trim().length) {
    links = String(data.links)
      .split(",")
      .map((u) => ({ url: u.trim() }))
      .filter((l) => !!l.url);
  }

  if (!display_name || !handle) {
    return Response.json({ ok: false, error: "display_name and handle are required" }, { status: 400 });
  }

  try {
    // Fee gating
    const feeCfg = await getFeeConfig();
    if (feeCfg.enabled) {
      const paymentTx = (new URL(req.url).searchParams.get("payment_tx") || "").trim();
      if (!paymentTx) return Response.json({ ok: false, error: "payment_tx required" }, { status: 402 });
      await verifyAndRecordPayment({ txHash: paymentTx, expectedAction: "profile", userId });
    }

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
            links: links && links.length ? links : undefined,
          },
        })
      : await prisma.collaboratorProfile.create({
          data: {
            userId: user.id,
            bio,
            skills,
            projectTypes: project_types,
            availabilityHoursWeek: Number.isFinite(availability_hours_week) ? availability_hours_week : null,
            links: links && links.length ? links : undefined,
          },
        });
    return Response.json({ ok: true, profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : "failed";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}


