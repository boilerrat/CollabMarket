import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { getOrCreateUserId } from "@/server/auth";
import { getFeeConfig, verifyAndRecordPayment } from "@/app/api/utils/fees";
import { profileUpsertSchema } from "@/app/api/_validation";

export async function GET() {
  const userId = await getOrCreateUserId();
  if (!userId) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const profile = await prisma.collaboratorProfile.findFirst({ where: { userId } });
  return Response.json({ ok: true, profile });
}

export async function POST(req: NextRequest) {
  const userId = await getOrCreateUserId();
  if (!userId) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let data: unknown;
  try {
    data = await req.json();
  } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400 });
  }
  const parsed = profileUpsertSchema.safeParse(data);
  if (!parsed.success) return Response.json({ ok: false, error: "invalid input" }, { status: 400 });

  const display_name = String(parsed.data?.display_name || "").trim();
  const handle = String(parsed.data?.handle || "").trim();
  const bio = String(parsed.data?.bio || "");
  const skills: string[] = Array.isArray(parsed.data?.skills)
    ? parsed.data.skills.map((s) => String(s).trim()).filter(Boolean)
    : String(parsed.data?.skills || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
  const project_types: string[] = Array.isArray(parsed.data?.project_types)
    ? parsed.data.project_types.map((s) => String(s).trim()).filter(Boolean)
    : String(parsed.data?.project_types || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
  const availability_hours_week = Number(parsed.data?.availability_hours_week);
  // Parse links: accept array of objects or comma-separated URLs
  let links: Array<{ label?: string; url: string }> | undefined;
  if (Array.isArray(parsed.data?.links)) {
    links = parsed.data.links
      .map((l) => ({ label: l?.label ? String(l.label).trim() : undefined, url: String(l?.url || "").trim() }))
      .filter((l) => !!l.url);
  } else if (typeof parsed.data?.links === "string" && parsed.data.links.trim().length) {
    links = String(parsed.data.links)
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


