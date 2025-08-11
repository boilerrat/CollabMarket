import { cookies } from "next/headers";

export function getUserKey(): string | null {
  return cookies().get("fc_session")?.value || null;
}


