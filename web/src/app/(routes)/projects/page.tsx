"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

type Project = {
  id: string;
  title: string;
  pitch: string;
  project_type?: string;
  skills: string[];
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [q, setQ] = useState("");
  const [skills, setSkills] = useState("");
  const [type, setType] = useState("");

  const load = async () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (skills) params.set("skills", skills);
    if (type) params.set("type", type);
    const res = await fetch(`/api/projects?${params.toString()}`);
    const data = await res.json();
    if (res.ok) setProjects(data.projects || []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="p-4">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex items-center gap-2">
          <Input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
          <Input placeholder="Skills (comma)" value={skills} onChange={(e) => setSkills(e.target.value)} />
          <Input placeholder="Project Type" value={type} onChange={(e) => setType(e.target.value)} />
          <Button onClick={load}>Filter</Button>
          <Button asChild>
            <Link href="/projects/new">New Project</Link>
          </Button>
        </div>
        <div className="grid gap-3">
          {projects.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle>{p.title}</CardTitle>
                <CardDescription>{p.project_type}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-sm text-muted-foreground">{p.pitch}</p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={async () => {
                      await fetch("/api/interests", {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ projectId: p.id }),
                      });
                    }}
                  >
                    I’m interested
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!projects.length ? <p className="text-sm text-muted-foreground">No projects yet.</p> : null}
        </div>
      </div>
    </main>
  );
}


