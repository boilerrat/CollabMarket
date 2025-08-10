export function isAdminByFid(fid?: string | null): boolean {
  if (!fid) return false;
  const list = (process.env.ADMIN_FIDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return list.includes(fid);
}

