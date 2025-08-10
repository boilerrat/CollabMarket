import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { isAdminByFid } from "@/lib/admin";
import { AdminReportsClient } from "./AdminReportsClient";

export default async function AdminReportsPage() {
  const session = await getSession();
  if (!isAdminByFid(session?.fid ?? null)) return notFound();
  return <AdminReportsClient />;
}
