import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { generateRandomHex, signValue, timingSafeEqual } from "@/lib/crypto";

const SESSION_COOKIE = "cm_session";
const CSRF_COOKIE = "cm_csrf";
const CSRF_HEADER = "x-csrf-token";

type SessionData = {
  fid: string; // store as string to keep JSON serialization safe
  userId: string;
};

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return secret;
}

export function createSignedCookie(value: string): string {
  const secret = getSecret();
  const sig = signValue(value, secret);
  return `${value}.${sig}`;
}

export function verifySignedCookie(cookieValue: string | undefined): string | null {
  if (!cookieValue) return null;
  const [value, sig] = cookieValue.split(".");
  if (!value || !sig) return null;
  const expected = signValue(value, getSecret());
  return timingSafeEqual(sig, expected) ? value : null;
}

export async function getSession(): Promise<SessionData | null> {
  const store = await cookies();
  const signed = store.get(SESSION_COOKIE)?.value;
  const raw = verifySignedCookie(signed);
  if (!raw) return null;
  try {
    const data = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as SessionData;
    if (!data?.fid || !data?.userId) return null;
    return data;
  } catch {
    return null;
  }
}

export async function setSession(data: SessionData): Promise<void> {
  const payload = Buffer.from(JSON.stringify(data), "utf8").toString("base64url");
  const signed = createSignedCookie(payload);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, signed, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 0 });
}

export async function ensureCsrfToken(): Promise<string> {
  const store = await cookies();
  const existing = store.get(CSRF_COOKIE)?.value;
  if (existing) return existing;
  const token = generateRandomHex(16);
  store.set(CSRF_COOKIE, token, { httpOnly: false, secure: true, sameSite: "strict", path: "/", maxAge: 60 * 60 * 24 });
  return token;
}

export function verifyCsrfOnRequest(request: NextRequest): boolean {
  const tokenCookie = request.cookies.get(CSRF_COOKIE)?.value;
  const tokenHeader = request.headers.get(CSRF_HEADER);
  if (!tokenCookie || !tokenHeader) return false;
  return timingSafeEqual(tokenCookie, tokenHeader);
}

export function getCsrfHeaderName(): string {
  return CSRF_HEADER;
}


