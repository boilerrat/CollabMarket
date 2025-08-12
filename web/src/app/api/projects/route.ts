import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { getOrCreateUserId } from "@/server/auth";
import { getFeeConfig, verifyAndRecordPayment } from "@/app/api/utils/fees";

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

  const where: Record<string, unknown> = {};
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

type NewProjectBody = { title?: string; pitch?: string; project_type?: string; skills?: string[] };

export async function POST(req: NextRequest) {
  const ownerId = await getOrCreateUserId();
  if (!ownerId) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  let data: NewProjectBody;
  try {
    data = await req.json();
  } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400 });
  }
  const title = (data.title || "").trim();
  const pitch = (data.pitch || "").trim();
  const skills = Array.isArray(data.skills) ? data.skills : [];
  if (!title || !pitch) return Response.json({ ok: false, error: "title and pitch required" }, { status: 400 });

  // Fee gating
  const feeCfg = await getFeeConfig();
  if (feeCfg.enabled) {
    const paymentTx = (new URL(req.url).searchParams.get("payment_tx") || "").trim();
    if (!paymentTx) return Response.json({ ok: false, error: "payment_tx required" }, { status: 402 });
    try {
      await verifyAndRecordPayment({ txHash: paymentTx, expectedAction: "project", userId: ownerId });
    } catch (e) {
      const message = e instanceof Error ? e.message : "payment verification failed";
      return Response.json({ ok: false, error: message }, { status: 402 });
    }
  }
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


