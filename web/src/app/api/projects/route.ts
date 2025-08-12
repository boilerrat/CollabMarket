import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { getOrCreateUserId } from "@/server/auth";
import { getFeeConfig, verifyAndRecordPayment } from "@/app/api/utils/fees";
import { newProjectSchema, type NewProjectInput } from "@/app/api/_validation";
import { okJson, errorJson } from "@/app/api/_responses";
import { revalidatePath } from "next/cache";

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

  // If q is present, use Postgres FTS + trigram for better search
  if (q.trim().length) {
    const offset = (page - 1) * per;
    // Compose raw SQL with parameters to leverage indexes
    const ids = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT p."id"
      FROM "Project" p
      WHERE
        ${(showArchived ? prisma.$queryRaw`TRUE` : prisma.$queryRaw`p."archived" = FALSE`)}
        AND ${(projectType ? prisma.$queryRaw`p."projectType" = ${projectType}` : prisma.$queryRaw`TRUE`)}
        AND ${skills.length ? prisma.$queryRaw`p."skills" @> ${skills as unknown as string[]}` : prisma.$queryRaw`TRUE`}
        AND (
          p."search" @@ plainto_tsquery('simple', ${q})
          OR p."title" % ${q}
          OR p."pitch" % ${q}
        )
      ORDER BY ts_rank(p."search", plainto_tsquery('simple', ${q})) DESC, p."createdAt" DESC
      OFFSET ${offset} LIMIT ${per}
    `;
    const idOrder = ids.map((r) => r.id);
    if (!idOrder.length) return Response.json({ ok: true, projects: [], page, per, hasMore: false });
    const projects = await prisma.project.findMany({ where: { id: { in: idOrder } }, include: { owner: true, roles: true } });
    const orderMap = new Map(idOrder.map((id, idx) => [id, idx] as const));
    projects.sort((a, b) => (orderMap.get(a.id)! - orderMap.get(b.id)!));
    return Response.json({ ok: true, projects, page, per, hasMore: projects.length === per });
  }

  const where: Record<string, unknown> = {};
  if (!showArchived) where.archived = false;
  if (projectType) where.projectType = projectType;
  if (skills.length) where.skills = { hasEvery: skills };

  const list = await prisma.project.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { owner: true, roles: true },
    skip: (page - 1) * per,
    take: per,
  });
  const res = okJson({ projects: list, page, per, hasMore: list.length === per });
  res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
  return res;
}

type NewProjectBody = NewProjectInput;

export async function POST(req: NextRequest) {
  const ownerId = await getOrCreateUserId();
  if (!ownerId) return errorJson("unauthorized", 401);
  let data: NewProjectBody;
  try {
    data = newProjectSchema.parse(await req.json());
  } catch {
    return errorJson("invalid json", 400, "invalid_input");
  }
  const title = data.title.trim();
  const pitch = data.pitch.trim();
  const skills = Array.isArray(data.skills) ? data.skills : [];

  // Fee gating
  const feeCfg = await getFeeConfig();
  if (feeCfg.enabled) {
    const paymentTx = (new URL(req.url).searchParams.get("payment_tx") || "").trim();
    if (!paymentTx) return Response.json({ ok: false, error: "payment_tx required" }, { status: 402 });
    try {
      await verifyAndRecordPayment({ txHash: paymentTx, expectedAction: "project", userId: ownerId });
    } catch (e) {
      const message = e instanceof Error ? e.message : "payment verification failed";
      return errorJson(message, 402, "payment_required");
    }
  }
  const owner = await prisma.user.findUnique({ where: { id: ownerId } });
  const project = await prisma.$transaction(async (tx) => {
    const created = await tx.project.create({
      data: {
        ownerId,
        title,
        pitch,
        projectType: data.project_type || undefined,
        skills: skills.map((s) => String(s).trim()).filter(Boolean),
        ownerSnapshot: owner
          ? { handle: owner.handle, displayName: owner.displayName, avatarUrl: owner.avatarUrl }
          : undefined,
      },
    });
    const roles = Array.isArray(data.roles)
      ? data.roles
          .map((r) => ({ skill: String(r?.skill || "").trim(), level: r?.level ? String(r.level).trim() : null, count: Number(r?.count ?? 1) }))
          .filter((r) => !!r.skill)
      : [];
    if (roles.length) {
      await tx.projectRole.createMany({
        data: roles.map((r) => ({ projectId: created.id, skill: r.skill, level: r.level || undefined, count: Number.isFinite(r.count) ? (r.count as number) : 1 })),
      });
    }
    return created;
  });
  revalidatePath("/projects");
  return okJson({ project });
}


