"use client";

import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export function AppInit(): null {
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        // Lightweight hydrate: ping health before signaling ready
        await fetch("/api/health", { cache: "no-store" });
      } catch {
        // ignore; readiness should still be signaled
      } finally {
        if (!isMounted) return;
        try {
          await sdk.actions.ready();
        } catch {
          // ignore SDK errors in dev
        }
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, []);
  return null;
}


