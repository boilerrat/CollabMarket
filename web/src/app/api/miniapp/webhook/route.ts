import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  // Placeholder receiver: log and 200 OK
  // TODO: verify signature when available and handle notifications/events
  try {
    await req.json();
  } catch {}
  return Response.json({ ok: true });
}


