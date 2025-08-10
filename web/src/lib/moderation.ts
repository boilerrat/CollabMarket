const DEFAULT_BLOCKLIST = [
  "http://", "https://", "viagra", "casino", "porn", "xxx", "adult", "bitcoin multiplier",
];

export function hasSuspiciousLinks(text: string): boolean {
  const urlLike = /(https?:\/\/|www\.)/i.test(text);
  return urlLike;
}

export function containsBlockedKeywords(text: string, extra: string[] = []): boolean {
  const list = new Set([...DEFAULT_BLOCKLIST, ...extra].map((s) => s.toLowerCase()));
  const lower = text.toLowerCase();
  for (const token of list) {
    if (token && lower.includes(token)) return true;
  }
  return false;
}

export function isTextAllowed(text?: string | null): boolean {
  if (!text) return true;
  if (hasSuspiciousLinks(text)) return false;
  if (containsBlockedKeywords(text)) return false;
  return true;
}

