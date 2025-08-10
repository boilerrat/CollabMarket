import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { CollaboratorProfileInput, ListQuery } from "@/lib/schemas";
import { sanitizeText, sanitizeArray } from "@/lib/sanitize";
import { isTextAllowed } from "@/lib/moderation";

function normalizeProfile(p: any) {
  return {
    id: p.id,
    userId: p.user_id,
    skills: p.skills,
    bio: p.bio,
    availabilityHoursWeek: p.availability_hours_week,
    categories: p.categories,
    location: p.location,
    compPreference: p.comp_preference,
    visibility: p.visibility,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    user: p.user ? { id: p.user.id, handle: p.user.handle, displayName: p.user.display_name, avatarUrl: p.user.avatar_url } : undefined,
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const parsed = ListQuery.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return NextResponse.json({ error: { code: "BAD_REQUEST" } }, { status: 400 });
  const { q, category, visibility, take, cursor } = parsed.data;
  const where: any = { is_deleted: false, user: { shadow_banned: false } };
  if (visibility) where.visibility = visibility;
  if (category) where.categories = { has: category };
  if (q) {
    where.OR = [
      { bio: { contains: q, mode: "insensitive" } },
      { skills: { has: q } },
      { location: { contains: q, mode: "insensitive" } },
    ];
  }
  const args: any = { where, orderBy: { updated_at: "desc" }, take: take + 1, include: { user: true } };
  if (cursor) args.cursor = { id: cursor };
  const items = await prisma.collaborator_profiles.findMany(args);
  let nextCursor: string | undefined = undefined;
  if (items.length > take) {
    const next = items.pop();
    nextCursor = next?.id;
  }
  const res = NextResponse.json({ items: items.map(normalizeProfile), nextCursor });
  res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  return res;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: { code: "UNAUTHENTICATED" } }, { status: 401 });
  const me = await prisma.users.findUnique({ where: { id: session.userId }, select: { shadow_banned: true } });
  if (me?.shadow_banned) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Account restricted" } }, { status: 403 });
  const payload = await request.json();
  const parsed = CollaboratorProfileInput.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: { code: "BAD_REQUEST" } }, { status: 400 });
  const d = parsed.data;
  if (!isTextAllowed(d.bio ?? "") || !isTextAllowed(d.location ?? "") || !isTextAllowed(d.compPreference ?? "")) {
    return NextResponse.json({ error: { code: "CONTENT_BLOCKED", message: "Content violates guidelines" } }, { status: 400 });
  }
  const saved = await prisma.collaborator_profiles.upsert({
    where: { user_id: session.userId },
    update: {
      skills: sanitizeArray(d.skills),
      bio: d.bio ? sanitizeText(d.bio) : null,
      availability_hours_week: d.availabilityHoursWeek,
      categories: sanitizeArray(d.categories ?? []),
      location: d.location ? sanitizeText(d.location) : null,
      comp_preference: d.compPreference ? sanitizeText(d.compPreference) : null,
      visibility: d.visibility,
    },
    create: {
      user_id: session.userId,
      skills: sanitizeArray(d.skills),
      bio: d.bio ? sanitizeText(d.bio) : null,
      availability_hours_week: d.availabilityHoursWeek,
      categories: sanitizeArray(d.categories ?? []),
      location: d.location ? sanitizeText(d.location) : null,
      comp_preference: d.compPreference ? sanitizeText(d.compPreference) : null,
      visibility: d.visibility,
    },
    include: { user: true },
  });
  return NextResponse.json({ profile: normalizeProfile(saved) });
}
