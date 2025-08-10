"use client";
import { useEffect, useMemo, useState } from "react";
import { ProjectCard } from "@/components/ProjectCard";
import { CollaboratorCard } from "@/components/CollaboratorCard";
import { track } from "@vercel/analytics/react";

type Tab = "projects" | "collaborators";

export default function FeedPage() {
  const [tab, setTab] = useState<Tab>("projects");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const endpoint = useMemo(() => tab === "projects" ? "/api/projects" : "/api/collaborators", [tab]);

  async function load() {
    setLoading(true);
    try {
      const url = new URL(endpoint, window.location.origin);
      if (q) url.searchParams.set("q", q);
      const res = await fetch(url.toString(), { cache: "no-store" });
      const json = await res.json();
      setItems(json.items ?? []);
      try { track("feed_view", { tab, q: q || undefined }); } catch {}
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* initial */ }, [tab]);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Discover</h1>
        <div className="grid grid-cols-2 gap-2">
          <button className={`px-3 py-2 rounded ${tab === "projects" ? "bg-black text-white" : "border"}`} onClick={() => setTab("projects")}>Projects</button>
          <button className={`px-3 py-2 rounded ${tab === "collaborators" ? "bg-black text-white" : "border"}`} onClick={() => setTab("collaborators")}>Collaborators</button>
        </div>
      </div>
      <div className="flex gap-2">
        <input aria-label="Search" className="flex-1 border rounded p-2" placeholder="Search by title, pitch, skills" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="px-3 py-2 rounded border" onClick={load} disabled={loading}>Search</button>
      </div>
      {loading && <p className="text-sm text-gray-500">Loading…</p>}
      {!loading && items.length === 0 && <p className="text-sm text-gray-500">No results found.</p>}
      <div className="space-y-3">
        {tab === "projects" && items.map((p: any) => <ProjectCard key={p.id} p={p} />)}
        {tab === "collaborators" && items.map((c: any) => <CollaboratorCard key={c.id} c={c} />)}
      </div>
    </div>
  );
}

