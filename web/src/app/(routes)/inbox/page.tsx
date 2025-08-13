"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { withStagger } from "@/lib/utils";

type InboxItem = {
  id: string;
  projectId: string;
  fromKey: string;
  message?: string;
  status: string;
  createdAt: number;
};

export default function InboxPage() {
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const res = await fetch("/api/inbox", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setInbox(data.inbox || []);
      else setLoadError(data?.error || "Failed to load inbox");
    } catch (err: any) {
      setLoadError(err?.message || "Failed to load inbox");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="p-4">
      <div className="mx-auto max-w-4xl">
        <PageHeader title="Inbox" description="Incoming interests for your projects." backFallbackHref="/projects" />
        <Card>
          <CardHeader>
            <CardTitle>Requests</CardTitle>
            <CardDescription>Manage collaboration requests.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadError ? (
              <div className="rounded-md border bg-destructive/10 text-destructive p-3 text-sm mb-3">{loadError}</div>
            ) : null}
            <div className="grid gap-3">
              {inbox.map((i, idx) => (
                <div key={i.id} className="flex items-center justify-between border rounded-md p-3 transition-colors hover:bg-accent/40 animate-in-up" {...withStagger(idx)}>
                  <div className="text-sm">
                    <div className="font-medium">Interest</div>
                    <div className="text-muted-foreground">Project: {i.projectId}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const prev = inbox;
                        setInbox((items) => items.filter((x) => x.id !== i.id));
                        try {
                          const res = await fetch(`/api/interests/${i.id}`, {
                            method: 'PATCH',
                            headers: { 'content-type': 'application/json' },
                            body: JSON.stringify({ status: 'accepted' })
                          });
                          if (!res.ok) throw new Error('Failed to accept');
                          toast.success('Accepted');
                        } catch (e: any) {
                          setInbox(prev);
                          toast.error(e?.message || 'Failed to accept');
                        }
                      }}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        const prev = inbox;
                        setInbox((items) => items.filter((x) => x.id !== i.id));
                        try {
                          const res = await fetch(`/api/interests/${i.id}`, {
                            method: 'PATCH',
                            headers: { 'content-type': 'application/json' },
                            body: JSON.stringify({ status: 'dismissed' })
                          });
                          if (!res.ok) throw new Error('Failed to dismiss');
                          toast.success('Dismissed');
                        } catch (e: any) {
                          setInbox(prev);
                          toast.error(e?.message || 'Failed to dismiss');
                        }
                      }}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))}
              {!inbox.length && !isLoading ? (
                <EmptyState
                  title="No requests yet"
                  description="When collaborators express interest in your projects, they’ll show up here."
                />
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


