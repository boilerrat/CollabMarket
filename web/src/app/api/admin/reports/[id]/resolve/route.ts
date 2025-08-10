import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

function isAdmin(fid: string): boolean {
  const list = (process.env.ADMIN_FIDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return list.includes(fid);
}

export async function POST(_request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: { code: "UNAUTHENTICATED" } }, { status: 401 });
  if (!isAdmin(session.fid)) return NextResponse.json({ error: { code: "FORBIDDEN" } }, { status: 403 });

  const report = await prisma.abuse_reports.findUnique({ where: { id: params.id } });
  if (!report) return NextResponse.json({ error: { code: "NOT_FOUND" } }, { status: 404 });

  // Soft-delete target content when applicable
  if (report.target_kind === "project") {
    await prisma.projects.update({ where: { id: report.target_id }, data: { is_deleted: true, status: "archived" } });
  } else if (report.target_kind === "profile") {
    await prisma.collaborator_profiles.update({ where: { id: report.target_id }, data: { is_deleted: true, visibility: "private" } });
  } else if (report.target_kind === "user") {
    await prisma.users.update({ where: { id: report.target_id }, data: { is_deleted: true } });
  }

  return NextResponse.json({ ok: true });
}

