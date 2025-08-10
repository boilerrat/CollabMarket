import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ReportInput } from "@/lib/schemas";
import { sanitizeText } from "@/lib/sanitize";
import { isTextAllowed } from "@/lib/moderation";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: { code: "UNAUTHENTICATED" } }, { status: 401 });

  const body = await request.json();
  const parsed = ReportInput.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: { code: "BAD_REQUEST" } }, { status: 400 });
  const d = parsed.data;
  if (!isTextAllowed(d.reason)) return NextResponse.json({ error: { code: "CONTENT_BLOCKED" } }, { status: 400 });

  const created = await prisma.abuse_reports.create({
    data: {
      reporter_user_id: session.userId,
      target_kind: d.targetKind,
      target_id: d.targetId,
      reason: sanitizeText(d.reason),
    },
  });

  return NextResponse.json({ report: { id: created.id } }, { status: 201 });
}
