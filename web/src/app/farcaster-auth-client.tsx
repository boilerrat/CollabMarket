"use client";

import { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

type AuthStatus = {
  isAuthenticated: boolean;
  token?: string;
};

async function persistSession(token: string): Promise<void> {
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token }),
    credentials: "same-origin",
  }).catch(() => {});
}

export function FarcasterAuthClient(): null {
  const [hasAttempted, setHasAttempted] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      // If not running inside a Farcaster client, silently exit
      try {
        if (process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_ENABLE_QUICK_AUTH_DEV !== "1") {
          return; // avoid SDK quick auth during local dev unless explicitly enabled
        }
        // Attempt Quick Auth automatically; method name may vary by SDK version
        // Use defensive access to avoid hard type coupling
        const quickAuth: any = (sdk as any).quickAuth;
        let token: string | undefined;
        if (quickAuth?.getToken) {
          token = await quickAuth.getToken().catch(() => undefined);
        } else if (quickAuth?.signIn) {
          const result = await quickAuth.signIn();
          token = result?.token ?? result?.jwt;
        }

        if (token && isMounted) {
          await persistSession(token);
        }
      } catch {
        // ignore errors (e.g., not in FC client)
      } finally {
        if (isMounted) setHasAttempted(true);
      }
    };

    if (!hasAttempted) run();
    return () => {
      isMounted = false;
    };
  }, [hasAttempted]);

  return null;
}


