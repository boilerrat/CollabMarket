"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { SkillsMultiSelect } from "@/components/skills-multiselect";

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
  const [skills, setSkills] = useState<string[]>([]);
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const per = 10;

  const load = async () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (skills.length) params.set("skills", skills.join(","));
    if (type) params.set("type", type);
    params.set("page", String(page));
    params.set("per", String(per));
    const res = await fetch(`/api/collaborators?${params.toString()}`, { cache: "no-store" });
    const data = await res.json();
    if (res.ok) {
      setProfiles(data.collaborators || []);
      setHasMore(Boolean(data.hasMore));
    }
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
          <SkillsMultiSelect
            selected={skills}
            onChange={setSkills}
            options={["React","Next.js","TypeScript","Tailwind","Design","Solidity","Python"]}
            placeholder="Filter skills"
          />
          <Input placeholder="Project Type" value={type} onChange={(e) => setType(e.target.value)} />
          <Button onClick={() => { setPage(1); load(); }}>Filter</Button>
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
                {p.skills?.length ? (
                  <div className="flex flex-wrap gap-1">
                    {p.skills.map((s) => (
                      <Badge key={s} variant="secondary">{s}</Badge>
                    ))}
                  </div>
                ) : null}
                <div className="mt-3 flex items-center gap-2">
                  <Button asChild size="sm">
                    <a href={`https://warpcast.com/${p.handle}`} target="_blank" rel="noopener noreferrer">
                      View on Farcaster
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={`https://warpcast.com/~/compose?text=${encodeURIComponent(`@${p.handle} let’s connect about collaborating on a project`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Cast to @{p.handle}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!profiles.length ? <p className="text-sm text-muted-foreground">No collaborators yet.</p> : null}
        </div>
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => {
              setPage((p) => Math.max(1, p - 1));
              setTimeout(load, 0);
            }}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">Page {page}</span>
          <Button
            variant="outline"
            disabled={!hasMore}
            onClick={() => {
              setPage((p) => p + 1);
              setTimeout(load, 0);
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </main>
  );
}


