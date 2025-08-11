"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

type Project = {
  id: string;
  title: string;
  pitch: string;
  projectType?: string;
  skills: string[];
  owner?: { handle?: string | null; displayName?: string | null };
};

export default function ProjectDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [message, setMessage] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editPitch, setEditPitch] = useState("");
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/projects/${params.id}`);
      const data = await res.json();
      if (res.ok) {
        setProject(data.project);
        setEditTitle(data.project.title);
        setEditPitch(data.project.pitch);
      }
      const me = await fetch('/api/me');
      const meData = await me.json();
      if (me.ok && meData?.user?.id && data?.project?.ownerId) setIsOwner(meData.user.id === data.project.ownerId);
    };
    load();
  }, [params.id]);

  if (!project) return null;

  const sendInterest = async () => {
    const res = await fetch("/api/interests", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ projectId: project.id, message: message || undefined }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Interest sent");
      setMessage("");
      router.push("/inbox");
    } else {
      toast.error(data?.error || "Failed to send interest");
    }
  };

  return (
    <main className="p-4">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{project.title}</CardTitle>
            <CardDescription>{project.projectType}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{project.pitch}</p>
            {project.owner?.handle ? (
              <p className="text-xs text-muted-foreground">
                by <a className="underline" href={`https://warpcast.com/${project.owner.handle}`} target="_blank" rel="noopener noreferrer">@{project.owner.handle}</a>
              </p>
            ) : null}
            {project.skills?.length ? (
              <p className="text-sm">Skills: {project.skills.join(", ")}</p>
            ) : null}
            <div className="grid gap-2">
              <label htmlFor="msg" className="text-sm font-medium">Message (optional)</label>
              <Textarea id="msg" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <Button onClick={sendInterest}>I’m interested</Button>
            {isOwner ? (
              <div className="mt-6 space-y-3 border-t pt-4">
                <p className="text-sm font-medium">Owner actions</p>
                <div className="grid gap-2">
                  <label className="text-sm">Title</label>
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm">Pitch</label>
                  <Textarea rows={3} value={editPitch} onChange={(e) => setEditPitch(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const res = await fetch(`/api/projects/${project.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title: editTitle, pitch: editPitch }) });
                      if (res.ok) {
                        toast.success('Project updated');
                        router.refresh();
                      } else {
                        toast.error('Failed to update');
                      }
                    }}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={archiving}
                    onClick={async () => {
                      setArchiving(true);
                      const res = await fetch(`/api/projects/${project.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ archived: true }) });
                      setArchiving(false);
                      if (res.ok) {
                        toast.success('Project archived');
                        router.push('/projects');
                      } else {
                        toast.error('Failed to archive');
                      }
                    }}
                  >
                    Archive Project
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


