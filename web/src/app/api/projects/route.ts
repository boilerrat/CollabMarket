import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ProjectInput, ListQuery } from "@/lib/schemas";
import { sanitizeText, sanitizeArray } from "@/lib/sanitize";
import { isTextAllowed } from "@/lib/moderation";

function normalizeProject(p: any) {
  return {
    id: p.id,
    ownerUserId: p.owner_user_id,
    title: p.title,
    pitch: p.pitch,
    category: p.category,
    onchain: p.onchain,
    repoUrl: p.repo_url,
    contactMethod: p.contact_method,
    contactValue: p.contact_value,
    commitment: p.commitment,
    startDate: p.start_date,
    incentives: p.incentives,
    status: p.status,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    roles: p.roles?.map((r: any) => ({ id: r.id, skill: r.skill, level: r.level, count: r.count })) ?? [],
  };
}

// GET /api/projects?filters
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const parsed = ListQuery.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid query" } }, { status: 400 });
  }
  const { q, category, status, take, cursor } = parsed.data;
  const where: any = { is_deleted: false, owner: { shadow_banned: false } };
  if (category) where.category = category;
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { pitch: { contains: q, mode: "insensitive" } },
    ];
  }
  const args: any = {
    where,
    orderBy: { created_at: "desc" },
    take: take + 1,
    include: { roles: true },
  };
  if (cursor) args.cursor = { id: cursor };
  const items = await prisma.projects.findMany(args);
  let nextCursor: string | undefined = undefined;
  if (items.length > take) {
    const next = items.pop();
    nextCursor = next?.id;
  }
  const body = { items: items.map(normalizeProject), nextCursor };
  const res = NextResponse.json(body);
  res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  return res;
}

// POST /api/projects
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: { code: "UNAUTHENTICATED" } }, { status: 401 });
  // Shadow-banned users cannot post
  const me = await prisma.users.findUnique({ where: { id: session.userId }, select: { shadow_banned: true } });
  if (me?.shadow_banned) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Account restricted" } }, { status: 403 });

  const payload = await request.json();
  const parsed = ProjectInput.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid payload" } }, { status: 400 });
  }
  const data = parsed.data;
  if (!isTextAllowed(data.title) || !isTextAllowed(data.pitch) || !isTextAllowed(data.contactValue ?? "")) {
    return NextResponse.json({ error: { code: "CONTENT_BLOCKED", message: "Content violates guidelines" } }, { status: 400 });
  }

  // Basic per-user rate limit: 10 creates/hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const count = await prisma.projects.count({ where: { owner_user_id: session.userId, created_at: { gte: oneHourAgo } } });
  if (count >= 10) {
    return NextResponse.json({ error: { code: "RATE_LIMIT", message: "Too many creates" } }, { status: 429 });
  }

  const created = await prisma.projects.create({
    data: {
      owner_user_id: session.userId,
      title: sanitizeText(data.title),
      pitch: sanitizeText(data.pitch),
      category: sanitizeText(data.category),
      onchain: !!data.onchain,
      repo_url: data.repoUrl ?? null,
      contact_method: sanitizeText(data.contactMethod),
      contact_value: sanitizeText(data.contactValue),
      commitment: sanitizeText(data.commitment),
      start_date: data.startDate ? new Date(data.startDate) : null,
      incentives: sanitizeArray(data.incentives ?? []),
      roles: {
        create: (data.roles ?? []).map((r) => ({
          skill: sanitizeText(r.skill),
          level: r.level ? sanitizeText(r.level) : null,
          count: r.count ?? 1,
        })),
      },
    },
    include: { roles: true },
  });

  return NextResponse.json({ project: normalizeProject(created) }, { status: 201 });
}
