"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Profile = {
  userKey: string;
  display_name: string;
  handle: string;
  bio: string;
  skills: string[];
  project_types?: string[];
};

export default function CollaboratorsPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [q, setQ] = useState("");
  const [skills, setSkills] = useState("");

  const load = async () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (skills) params.set("skills", skills);
    const res = await fetch(`/api/collaborators?${params.toString()}`);
    const data = await res.json();
    if (res.ok) setProfiles(data.collaborators || []);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="p-4">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex items-center gap-2">
          <Input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
          <Input placeholder="Skills (comma)" value={skills} onChange={(e) => setSkills(e.target.value)} />
          <Button onClick={load}>Filter</Button>
          <Button asChild>
            <Link href="/profile">Create/Update Profile</Link>
          </Button>
        </div>
        <div className="grid gap-3">
          {profiles.map((p) => (
            <Card key={p.userKey}>
              <CardHeader>
                <CardTitle>{p.display_name}</CardTitle>
                <CardDescription>@{p.handle}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-sm text-muted-foreground">{p.bio}</p>
              </CardContent>
            </Card>
          ))}
          {!profiles.length ? <p className="text-sm text-muted-foreground">No collaborators yet.</p> : null}
        </div>
      </div>
    </main>
  );
}


