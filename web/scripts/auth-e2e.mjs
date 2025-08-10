#!/usr/bin/env node
/*
  Minimal E2E for Day 2 Auth
  Preconditions:
  - Next.js app running on http://localhost:3000 (dev or start)
  - DATABASE_URL and SESSION_SECRET set
*/

const BASE = process.env.BASE_URL || "http://localhost:3000";

/** @type {Record<string, string>} */
const jar = {};

function setCookieFromResponse(res) {
  const setCookie = res.headers.getSetCookie?.() || res.headers.raw?.()["set-cookie"] || res.headers.getAll?.("set-cookie") || [];
  const arr = Array.isArray(setCookie) ? setCookie : [setCookie].filter(Boolean);
  for (const c of arr) {
    const [pair] = c.split(";");
    if (!pair) continue;
    const [name, value] = pair.split("=");
    jar[name.trim()] = value ?? "";
  }
}

function cookieHeader() {
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

async function getCsrf() {
  const res = await fetch(`${BASE}/api/auth/csrf`, { headers: { cookie: cookieHeader() } });
  setCookieFromResponse(res);
  const header = res.headers.get("x-csrf-token");
  if (!header) throw new Error("Missing CSRF header");
  return header;
}

async function signIn(fid = 999999, handle = "tester") {
  const csrf = await getCsrf();
  const res = await fetch(`${BASE}/api/auth/callback`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-csrf-token": csrf,
      cookie: cookieHeader(),
    },
    body: JSON.stringify({ fid, handle, displayName: "Test User", avatarUrl: null }),
  });
  setCookieFromResponse(res);
  if (!res.ok) throw new Error(`Sign-in failed: ${res.status}`);
}

async function me() {
  const res = await fetch(`${BASE}/api/me`, { headers: { cookie: cookieHeader() } });
  const data = await res.json();
  return data;
}

async function logout() {
  const csrf = await getCsrf();
  const res = await fetch(`${BASE}/api/auth/logout`, {
    method: "POST",
    headers: { "x-csrf-token": csrf, cookie: cookieHeader() },
  });
  setCookieFromResponse(res);
  if (!res.ok) throw new Error(`Logout failed: ${res.status}`);
}

(async () => {
  console.log("[Auth E2E] Start");
  await signIn();
  const me1 = await me();
  if (!me1?.user?.id) throw new Error("Expected user after sign-in");
  console.log("Signed in as:", me1.user.handle);
  await logout();
  const me2 = await me();
  if (me2?.user) throw new Error("Expected no user after logout");
  console.log("[Auth E2E] OK");
})().catch((err) => {
  console.error("[Auth E2E] FAIL:", err?.message || err);
  process.exitCode = 1;
});


