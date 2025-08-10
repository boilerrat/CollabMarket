import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

function isAdmin(fid: string): boolean {
  const list = (process.env.ADMIN_FIDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return list.includes(fid);
}

export async function GET(_request: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: { code: "UNAUTHENTICATED" } }, { status: 401 });
  if (!isAdmin(session.fid)) return NextResponse.json({ error: { code: "FORBIDDEN" } }, { status: 403 });

  const items = await prisma.abuse_reports.findMany({ orderBy: { created_at: "desc" } });
  return NextResponse.json({ items });
}

