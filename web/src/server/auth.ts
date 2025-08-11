import { cookies } from "next/headers";
import { createHash } from "crypto";
import { prisma } from "@/server/db";

export async function getSessionToken(): Promise<string | null> {
  return cookies().get("fc_session")?.value || null;
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


