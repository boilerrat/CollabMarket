export function sanitizeText(input: string): string {
  // Basic HTML tag strip and trim. For richer needs, integrate a sanitizer lib.
  return input.replace(/<[^>]*>/g, "").trim();
}

export function sanitizeArray(values: string[]): string[] {
  return values.map((v) => sanitizeText(v)).filter((v) => v.length > 0);
}

