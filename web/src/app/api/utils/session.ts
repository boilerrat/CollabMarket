export function getUserKey(): string | null {
  // next/headers cookies() is async in this Next version; keep compatibility with older usage
  // But this util is deprecated in favor of server/auth getSessionToken
  return null;
}


