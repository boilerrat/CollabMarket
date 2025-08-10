"use client";

import React, { useCallback, useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

type MeResponse = {
  user: {
    id: string;
    fid: bigint | number | string;
    handle: string;
    displayName?: string | null;
    avatarUrl?: string | null;
  } | null;
};

export function AuthButtons(): React.ReactElement {
  const [user, setUser] = useState<MeResponse["user"] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshMe = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      const data = (await res.json()) as MeResponse;
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const signIn = useCallback(async () => {
    try {
      // Ask Mini App for Quick Auth token
      // If the SDK does not provide a token yet, this call can be replaced with a simple fid prompt or Neynar flow
      const getQuickAuthToken = (sdk.actions as unknown as { getQuickAuthToken?: () => Promise<string> }).getQuickAuthToken;
      const token: string | undefined = getQuickAuthToken ? await getQuickAuthToken() : undefined;
      // Always prime CSRF
      const csrfRes = await fetch("/api/auth/csrf", { cache: "no-store" });
      const csrfToken = csrfRes.headers.get("x-csrf-token");
      await fetch("/api/auth/callback", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-csrf-token": csrfToken ?? "",
        },
        body: JSON.stringify({ quickAuthToken: token ?? null }),
      });
      await refreshMe();
    } catch {
      // noop
    }
  }, [refreshMe]);

  const logout = useCallback(async () => {
    try {
      const csrfRes = await fetch("/api/auth/csrf", { cache: "no-store" });
      const csrfToken = csrfRes.headers.get("x-csrf-token");
      await fetch("/api/auth/logout", { method: "POST", headers: { "x-csrf-token": csrfToken ?? "" } });
      await refreshMe();
    } catch {
      // noop
    }
  }, [refreshMe]);

  if (isLoading) return <div className="text-sm text-neutral-500">Loading…</div>;

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm">Signed in as @{user.handle}</div>
        <button onClick={logout} className="rounded px-3 py-1 text-sm bg-neutral-800 text-white">
          Logout
        </button>
      </div>
    );
  }

  return (
    <button onClick={signIn} className="rounded px-3 py-1 text-sm bg-neutral-800 text-white">
      Sign in with Farcaster
    </button>
  );
}


