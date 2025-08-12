import { NextRequest } from "next/server";
import { timingSafeEqual, createHmac } from "crypto";

export async function POST(req: NextRequest) {
  // Verify HMAC signature if provided using WEBHOOK_SECRET
  const secret = process.env.WEBHOOK_SECRET || "";
  const signature = req.headers.get("x-signature") || req.headers.get("x-webhook-signature") || "";
  const timestamp = req.headers.get("x-timestamp");
  const bodyText = await req.text();

  if (secret) {
    try {
      // Optional replay protection: require timestamp within 5 minutes
      if (!timestamp) return Response.json({ ok: false, error: "missing timestamp" }, { status: 400 });
      const ts = Number(timestamp);
      if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > 5 * 60_000) {
        return Response.json({ ok: false, error: "stale request" }, { status: 401 });
      }

      const payloadToSign = `${timestamp}.${bodyText}`;
      const digest = createHmac("sha256", secret).update(payloadToSign).digest();
      const providedTrim = signature.trim();
      const providedBuf = /^[a-f0-9]{64}$/i.test(providedTrim)
        ? Buffer.from(providedTrim, "hex")
        : Buffer.from(providedTrim, "utf8");
      const valid = providedBuf.length === digest.length && timingSafeEqual(digest, providedBuf);
      if (!valid) return Response.json({ ok: false, error: "invalid signature" }, { status: 401 });
    } catch {
      return Response.json({ ok: false, error: "invalid signature" }, { status: 401 });
    }
  }

  // Parse payload optionally; keep handler minimal for now
  try {
    JSON.parse(bodyText);
  } catch {}

  return Response.json({ ok: true });
}


