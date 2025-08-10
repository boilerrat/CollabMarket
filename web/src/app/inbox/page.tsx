import { Button } from "@/components/ui/button";
"use client";
import { useEffect, useState } from "react";

type InboxItem = {
  id: string;
  status: string;
  createdAt: string;
  project: { id: string; title: string };
  fromUser: { id: string; handle: string | null; displayName: string | null; avatarUrl: string | null };
};

export default function InboxPage() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(false);
  const csrf = () => document.cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith("cm_csrf="))?.split("=")[1] ?? "";

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/inbox", { cache: "no-store" });
      const j = await res.json();
      setItems(j.items ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function act(id: string, action: "accept" | "dismiss") {
    const res = await fetch(`/api/interests/${id}/${action}`, { method: "POST", headers: { "x-csrf-token": csrf() } });
    if (res.ok) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: action === "accept" ? "accepted" : "dismissed" } : i)));
    } else {
      alert("Action failed");
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
      {loading && <p className="text-sm opacity-70">Loading…</p>}
      {!loading && items.length === 0 && <p className="text-sm opacity-70">No requests yet.</p>}
      <ul className="space-y-3">
        {items.map((i) => (
          <li key={i.id} className="surface p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-[15px]">{i.project.title}</div>
                <div className="text-sm opacity-80">From {i.fromUser.displayName ?? i.fromUser.handle ?? "User"} • {new Date(i.createdAt).toLocaleString()}</div>
                <div className="text-xs mt-1 opacity-60">Status: {i.status}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => act(i.id, "accept")} disabled={i.status !== "pending"}>Accept</Button>
                <Button intent="outline" onClick={() => act(i.id, "dismiss")} disabled={i.status !== "pending"}>Dismiss</Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

