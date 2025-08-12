"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SkillsMultiSelect } from "@/components/skills-multiselect";

type Project = {
  id: string;
  title: string;
  pitch: string;
  projectType?: string;
  skills: string[];
  owner?: { handle?: string | null; displayName?: string | null };
  roles?: Array<{ id: string; skill: string; level?: string | null; count: number }>;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [q, setQ] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [type, setType] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);
  const per = 10;

  const load = async () => {
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (skills.length) params.set("skills", skills.join(","));
      if (type) params.set("type", type);
      if (showArchived) params.set("archived", "1");
      params.set("page", String(page));
      params.set("per", String(per));
      const res = await fetch(`/api/projects?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok) setProjects(data.projects || []);
    } catch {}
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="p-4">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
          <SkillsMultiSelect selected={skills} onChange={setSkills} options={["React","Next.js","TypeScript","Tailwind","Design","Solidity","Python"]} placeholder="Filter skills" />
          <Input placeholder="Project Type" value={type} onChange={(e) => setType(e.target.value)} />
          <Button onClick={() => { setPage(1); load(); }}>Filter</Button>
          <label className="text-sm flex items-center gap-2 ml-auto">
            <input type="checkbox" checked={showArchived} onChange={(e) => { setShowArchived(e.target.checked); setPage(1); }} />
            Show archived
          </label>
          <Button asChild>
            <Link href="/projects/new">New Project</Link>
          </Button>
        </div>
        <div className="grid gap-3">
          {projects.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle>{p.title}</CardTitle>
                <CardDescription>{p.projectType}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-sm text-muted-foreground">{p.pitch}</p>
                {p.skills?.length ? (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {p.skills.slice(0, 8).map((s) => (
                      <Badge key={s} variant="secondary">{s}</Badge>
                    ))}
                  </div>
                ) : null}
                {p.owner?.handle ? (
                  <p className="mb-2 text-xs text-muted-foreground">
                    by <a className="underline" href={`https://warpcast.com/${p.owner.handle}`} target="_blank" rel="noopener noreferrer">@{p.owner.handle}</a>
                  </p>
                ) : null}
                {p.roles?.length ? (
                  <div className="mb-2 text-xs text-muted-foreground">
                    Roles: {p.roles.slice(0, 3).map((r) => `${r.skill}${r.level ? ` (${r.level})` : ""}${r.count && r.count > 1 ? ` ×${r.count}` : ""}`).join(", ")}
                    {p.roles.length > 3 ? " …" : ""}
                  </div>
                ) : null}
                <Button asChild size="sm">
                  <Link href={`/projects/${p.id}`}>View details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
          {!projects.length ? <p className="text-sm text-muted-foreground">No projects yet.</p> : null}
        </div>
        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => { setPage((p) => Math.max(1, p - 1)); }}>
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">Page {page}</span>
          <Button variant="outline" onClick={() => { setPage((p) => p + 1); }}>
            Next
          </Button>
        </div>
      </div>
    </main>
  );
}


