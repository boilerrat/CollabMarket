"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  const load = async () => {
    try {
      const res = await fetch("/api/inbox", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setInbox(data.inbox || []);
    } catch {}
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="p-4">
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
            <CardDescription>Incoming interests for your projects.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {inbox.map((i) => (
                <div key={i.id} className="flex items-center justify-between border rounded-md p-3">
                  <div className="text-sm">
                    <div className="font-medium">Interest</div>
                    <div className="text-muted-foreground">Project: {i.projectId}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={async () => {
                      await fetch(`/api/interests/${i.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'accepted' }) });
                      load();
                    }}>Accept</Button>
                    <Button size="sm" variant="ghost" onClick={async () => {
                      await fetch(`/api/interests/${i.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'dismissed' }) });
                      load();
                    }}>Dismiss</Button>
                  </div>
                </div>
              ))}
              {!inbox.length ? <p className="text-sm text-muted-foreground">No requests yet.</p> : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


