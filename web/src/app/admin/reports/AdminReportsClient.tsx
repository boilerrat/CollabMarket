"use client";
import { useEffect, useState } from "react";

type Report = { id: string; target_kind: string; target_id: string; reason: string; created_at: string };

export function AdminReportsClient() {
  const [items, setItems] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [shadowUserId, setShadowUserId] = useState("");
  const csrf = () => document.cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith("cm_csrf="))?.split("=")[1] ?? "";

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports", { cache: "no-store" });
      const j = await res.json();
      setItems(j.items ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function resolve(id: string) {
    const res = await fetch(`/api/admin/reports/${id}/resolve`, { method: "POST", headers: { "x-csrf-token": csrf() } });
    if (res.ok) {
      setItems((prev) => prev.filter((r) => r.id !== id));
    } else {
      alert("Failed to resolve");
    }
  }

  async function shadowBan() {
    if (!shadowUserId) return;
    const res = await fetch(`/api/admin/users/${shadowUserId}/shadow-ban`, { method: "POST", headers: { "x-csrf-token": csrf() } });
    if (res.ok) {
      alert("User shadow-banned");
      setShadowUserId("");
    } else {
      alert("Failed to shadow-ban user");
    }
  }

  async function unshadowBan() {
    if (!shadowUserId) return;
    const res = await fetch(`/api/admin/users/${shadowUserId}/unshadow-ban`, { method: "POST", headers: { "x-csrf-token": csrf() } });
    if (res.ok) {
      alert("User unshadow-banned");
      setShadowUserId("");
    } else {
      alert("Failed to unshadow-ban user");
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold">Admin Reports</h1>
      <div className="flex gap-2 items-center">
        <input className="border rounded p-2" placeholder="User ID" value={shadowUserId} onChange={(e) => setShadowUserId(e.target.value)} />
        <button className="px-3 py-2 rounded border" onClick={shadowBan}>Shadow-ban</button>
        <button className="px-3 py-2 rounded border" onClick={unshadowBan}>Unshadow-ban</button>
      </div>
      {loading && <p className="text-sm text-gray-500">Loading…</p>}
      {!loading && items.length === 0 && <p className="text-sm text-gray-500">No reports in queue.</p>}
      <ul className="space-y-3">
        {items.map((r) => (
          <li key={r.id} className="border rounded p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{r.target_kind} • {r.target_id}</div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{r.reason}</div>
                <div className="text-xs text-gray-500 mt-1">{new Date(r.created_at).toLocaleString()}</div>
              </div>
              <button className="px-3 py-2 rounded border" onClick={() => resolve(r.id)}>Resolve</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

