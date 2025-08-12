export function okJson<T>(data: T, init?: ResponseInit): Response {
  return Response.json({ ok: true, ...((data as unknown) as object) }, init);
}

export function errorJson(message: string, status = 400, code?: string, meta?: Record<string, unknown>): Response {
  const body: Record<string, unknown> = { ok: false, error: message };
  if (code) body.code = code;
  if (meta) body.meta = meta;
  const res = Response.json(body, { status });
  // Ensure responses are not cached by intermediaries for errors
  res.headers.set("Cache-Control", "no-store");
  return res;
}


