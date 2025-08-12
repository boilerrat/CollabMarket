import type { NextConfig } from "next";

function buildCsp(): string {
  // Keep permissive enough for Next.js while offering baseline protection
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'self'"],
    "script-src": ["'self'", "'unsafe-eval'", "'wasm-unsafe-eval'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'", "https:", "wss:"],
    // Add any third-party domains as needed above
  };
  return Object.entries(directives)
    .map(([k, v]) => `${k} ${v.join(' ')}`)
    .join('; ');
}

const securityHeaders = [
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
];

const nextConfig: NextConfig = {
  async headers() {
    const headers = [
      ...securityHeaders,
      // Add CSP only in production to reduce local dev friction
      ...(process.env.NODE_ENV === 'production'
        ? [{ key: 'Content-Security-Policy', value: buildCsp() }]
        : []),
    ];
    return [
      {
        source: "/:path*",
        headers,
      },
    ];
  },
};

export default nextConfig;
