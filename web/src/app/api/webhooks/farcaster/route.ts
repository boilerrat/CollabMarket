import { NextRequest, NextResponse } from "next/server";

async function notifyError(message: string, payload?: unknown) {
  try {
    const url = process.env.ERROR_WEBHOOK_URL;
    if (!url) return;
    await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message, payload }) });
  } catch {
    // swallow
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const secret = process.env.WEBHOOK_SECRET;
    const provided = request.headers.get("x-webhook-secret");
    if (!secret || provided !== secret) {
      await notifyError("Unauthorized webhook", { provided });
      return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
    }
    const body = await request.json().catch(() => ({}));
    // Placeholder: process Mini App webhook events
    console.log("Webhook event", body?.type ?? "unknown");
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    await notifyError("Webhook error", { error: String(err?.message ?? err) });
    return NextResponse.json({ error: { code: "SERVER_ERROR" } }, { status: 500 });
  }
}
