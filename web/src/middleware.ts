import { NextResponse, type NextRequest } from "next/server";

// Simple in-memory token bucket keyed by IP+route. This resets on deploys.
// For production, use a distributed store (Redis) instead.
type Bucket = { tokens: number; lastRefill: number };
const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000; // 1 minute
const BURST = 30; // max requests per window

function getKey(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for") || "";
  const real = req.headers.get("x-real-ip") || "";
  const ip = (fwd.split(",")[0] || real || "unknown").trim();
  const path = new URL(req.url).pathname;
  return `${ip}:${path}`;
}

function allow(req: NextRequest): boolean {
  const key = getKey(req);
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: BURST, lastRefill: now };
    buckets.set(key, bucket);
  }
  const elapsed = now - bucket.lastRefill;
  if (elapsed > WINDOW_MS) {
    bucket.tokens = BURST;
    bucket.lastRefill = now;
  }
  if (bucket.tokens <= 0) return false;
  bucket.tokens -= 1;
  return true;
}

// Paths to protect with rate limiting (mutating and auth routes)
const limitedPrefixes = [
  "/api/auth/",
  "/api/interests",
  "/api/projects",
  "/api/profile",
  "/api/miniapp/webhook",
];

export function middleware(req: NextRequest) {
  const path = new URL(req.url).pathname;
  const isLimited = limitedPrefixes.some((p) => path.startsWith(p));
  if (!isLimited) return NextResponse.next();

  if (!allow(req)) {
    return new NextResponse(JSON.stringify({ ok: false, error: "rate_limited" }), {
      status: 429,
      headers: {
        "content-type": "application/json",
        "retry-after": "60",
        "cache-control": "no-store",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/auth/:path*",
    "/api/interests/:path*",
    "/api/projects/:path*",
    "/api/profile",
    "/api/miniapp/webhook",
  ],
};


