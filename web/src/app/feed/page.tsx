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
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Discover</h1>
        <div className="grid grid-cols-2 gap-2">
          <button className={`btn-outline ${tab === "projects" ? "ring-1 ring-[--ring]" : ""}`} onClick={() => setTab("projects")}>Projects</button>
          <button className={`btn-outline ${tab === "collaborators" ? "ring-1 ring-[--ring]" : ""}`} onClick={() => setTab("collaborators")}>Collaborators</button>
        </div>
      </div>
      <div className="surface p-2 flex gap-2 items-center">
        <input aria-label="Search" className="flex-1 bg-transparent border-0 focus:ring-0 px-2" placeholder="Search by title, pitch, skills" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn-primary" onClick={load} disabled={loading}>Search</button>
      </div>
      {loading && <p className="text-sm opacity-70">Loading…</p>}
      {!loading && items.length === 0 && <p className="text-sm opacity-70">No results found.</p>}
      <div className="space-y-3">
        {tab === "projects" && items.map((p: any) => <ProjectCard key={p.id} p={p} />)}
        {tab === "collaborators" && items.map((c: any) => <CollaboratorCard key={c.id} c={c} />)}
      </div>
    </div>
  );
}

