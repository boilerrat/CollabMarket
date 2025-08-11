"use client";

import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export function MiniAppReady(): null {
  useEffect(() => {
    let isActive = true;
    const run = async () => {
      try {
        await sdk.actions.ready();
      } catch {
        // ignore if not running inside a Farcaster client
      }
    };
    if (isActive) run();
    return () => {
      isActive = false;
    };
  }, []);

  return null;
}


