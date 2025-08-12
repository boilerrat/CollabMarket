"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { SkillsMultiSelect } from "@/components/skills-multiselect";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

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
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const per = 10;

  const load = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (skills.length) params.set("skills", skills.join(","));
      if (type) params.set("type", type);
      params.set("page", String(page));
      params.set("per", String(per));
      const res = await fetch(`/api/collaborators?${params.toString()}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setProfiles(data.collaborators || []);
        setHasMore(Boolean(data.hasMore));
      } else {
        setLoadError(data?.error || "Failed to load collaborators");
      }
    } catch (err: any) {
      setLoadError(err?.message || "Failed to load collaborators");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="p-4">
      <div className="mx-auto max-w-4xl space-y-4">
        <PageHeader title="Collaborators" description="Explore profiles and connect with builders." backFallbackHref="/" action={<Button asChild><Link href="/profile">Create/Update Profile</Link></Button>} />
        <div className="flex flex-wrap items-center gap-2">
          <Input className="w-full sm:w-64 md:flex-1" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
          <SkillsMultiSelect
            selected={skills}
            onChange={setSkills}
            options={["React","Next.js","TypeScript","Tailwind","Design","Solidity","Python"]}
            placeholder="Filter skills"
          />
          <Input className="w-full sm:w-40" placeholder="Project Type" value={type} onChange={(e) => setType(e.target.value)} />
          <Button disabled={isLoading} onClick={() => { setPage(1); load(); }}>{isLoading ? "Loading..." : "Filter"}</Button>
          
        </div>
        {loadError ? (
          <div className="rounded-md border bg-destructive/10 text-destructive p-3 text-sm">{loadError}</div>
        ) : null}
        <div className="grid gap-3">
          {profiles.map((p) => (
            <Card key={p.userKey} className="transition-shadow hover:shadow-sm">
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
          {!profiles.length && !isLoading ? (
            <EmptyState
              title="No collaborators found"
              description="Try adjusting your search or skills filters, or invite friends to join."
              action={(
                <Button asChild size="sm">
                  <a href={`https://warpcast.com/~/compose?text=${encodeURIComponent("Come join CollabMarket to find collaborators!")}`} target="_blank" rel="noopener noreferrer">Invite on Farcaster</a>
                </Button>
              )}
            />
          ) : null}
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


