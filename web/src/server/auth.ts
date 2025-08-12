import { cookies } from "next/headers";
import { createHash, createHmac } from "crypto";
import { prisma } from "@/server/db";
import { createRemoteJWKSet, jwtVerify, JWTPayload } from "jose";

const QUICK_AUTH_ISSUER = "https://auth.farcaster.xyz";
const QUICK_AUTH_JWKS_URL = "https://auth.farcaster.xyz/.well-known/jwks.json";
const jwks = createRemoteJWKSet(new URL(QUICK_AUTH_JWKS_URL));

type QuickAuthClaims = {
  fid: number | null;
  username?: string | null;
  displayName?: string | null;
  bio?: string | null;
  pfpUrl?: string | null;
};

async function verifyQuickAuthTokenInternal(token: string): Promise<QuickAuthClaims | null> {
  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: QUICK_AUTH_ISSUER,
      // audience is optional per Quick Auth; omit unless enforced for your app
    });
    return extractClaims(payload);
  } catch {
    return null;
  }
}

function extractClaims(payload: JWTPayload): QuickAuthClaims {
  type PossiblePayload = JWTPayload & {
    fid?: unknown;
    username?: unknown;
    handle?: unknown;
    displayName?: unknown;
    name?: unknown;
    bio?: unknown;
    pfpUrl?: unknown;
    pfp?: unknown;
    avatarUrl?: unknown;
  };
  const p = payload as PossiblePayload;
  const subNumber = typeof p.sub === "string" ? Number(p.sub) : null;
  const fidCandidate = typeof p.fid === "number" ? p.fid : subNumber;
  const fid = typeof fidCandidate === "number" && Number.isFinite(fidCandidate) ? fidCandidate : null;
  const username = typeof p.username === "string" ? p.username : typeof p.handle === "string" ? p.handle : null;
  const displayName = typeof p.displayName === "string" ? p.displayName : typeof p.name === "string" ? p.name : null;
  const bio = typeof p.bio === "string" ? p.bio : null;
  const pfpUrl = typeof p.pfpUrl === "string" ? p.pfpUrl : typeof p.pfp === "string" ? p.pfp : typeof p.avatarUrl === "string" ? p.avatarUrl : null;
  return { fid, username, displayName, bio, pfpUrl };
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("fc_session")?.value || null;
  if (!raw) return null;
  const [token, sig] = raw.split(".");
  if (!token || !sig) return null;
  const secret = getSessionSecret();
  const expected = createHmac("sha256", secret).update(token).digest("hex");
  if (expected !== sig) return null;
  return token;
}

export function deriveUserIdFromToken(token: string): string {
  const hash = createHash("sha256").update(token).digest("hex");
  return `usr_${hash.slice(0, 24)}`;
}

function deriveUserIdFromFid(fid: number): string {
  return `usr_fid_${fid}`;
}

export async function verifyQuickAuthToken(token: string): Promise<QuickAuthClaims | null> {
  return verifyQuickAuthTokenInternal(token);
}

export async function getOrCreateUserId(): Promise<string | null> {
  const token = await getSessionToken();
  if (!token) {
    if (process.env.NODE_ENV !== "production") {
      const id = "usr_dev_local";
      await prisma.user.upsert({ where: { id }, update: {}, create: { id, handle: "dev", displayName: "Dev User" } });
      return id;
    }
    return null;
  }
  // Prefer verified fid-based identity when possible
  const claims = await verifyQuickAuthTokenInternal(token);
  if (claims?.fid) {
    const id = deriveUserIdFromFid(claims.fid);
    await prisma.user.upsert({
      where: { id },
      update: {
        fid: claims.fid || undefined,
        handle: claims.username || undefined,
        displayName: claims.displayName || undefined,
        avatarUrl: claims.pfpUrl || undefined,
        // Optionally store avatar/bio if your schema supports it in User
      },
      create: {
        id,
        fid: claims.fid || undefined,
        handle: claims.username || undefined,
        displayName: claims.displayName || undefined,
        avatarUrl: claims.pfpUrl || undefined,
      },
    });
    return id;
  }
  // Fallback to token-derived id if verification failed
  const id = deriveUserIdFromToken(token);
  await prisma.user.upsert({ where: { id }, update: {}, create: { id } });
  return id;
}

/**
 * Returns the session secret. In production, this must be explicitly configured
 * via SESSION_SECRET and must not equal the development placeholder.
 */
export function getSessionSecret(): string {
  const envSecret = process.env.SESSION_SECRET || "";
  const isProd = process.env.NODE_ENV === "production";
  if (isProd) {
    if (!envSecret || envSecret === "dev-secret-not-for-prod") {
      throw new Error("SESSION_SECRET must be set in production");
    }
    return envSecret;
  }
  return envSecret || "dev-secret-not-for-prod";
}


