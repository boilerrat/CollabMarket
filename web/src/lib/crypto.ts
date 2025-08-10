import crypto from "node:crypto";

export function generateRandomHex(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export function signValue(value: string, secret: string): string {
  const h = crypto.createHmac("sha256", secret);
  h.update(value);
  return h.digest("hex");
}

export function timingSafeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}


