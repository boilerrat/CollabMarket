import { cookies } from "next/headers";
import { createHash, createHmac } from "crypto";
import { prisma } from "@/server/db";

export async function getSessionToken(): Promise<string | null> {
  const raw = cookies().get("fc_session")?.value || null;
  if (!raw) return null;
  const [token, sig] = raw.split(".");
  if (!token || !sig) return null;
  const secret = process.env.SESSION_SECRET || "dev-secret-not-for-prod";
  const expected = createHmac("sha256", secret).update(token).digest("hex");
  if (expected !== sig) return null;
  return token;
}

export function deriveUserIdFromToken(token: string): string {
  const hash = createHash("sha256").update(token).digest("hex");
  return `usr_${hash.slice(0, 24)}`;
}

export async function getOrCreateUserId(): Promise<string | null> {
  const token = await getSessionToken();
  if (!token) return null;
  const id = deriveUserIdFromToken(token);
  await prisma.user.upsert({
    where: { id },
    update: {},
    create: { id },
  });
  return id;
}


