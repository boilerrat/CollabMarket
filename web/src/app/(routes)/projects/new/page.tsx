"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SkillsMultiSelect } from "@/components/skills-multiselect";

export default function NewProjectPage() {
  const [title, setTitle] = useState("");
  const [pitch, setPitch] = useState("");
  const [projectType, setProjectType] = useState("");
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();

  const submit = async () => {
    setSaving(true);
    setMessage(null);
    try {
      if (!title.trim() || !pitch.trim()) {
        toast.error("Title and pitch are required");
        setSaving(false);
        return;
      }
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          pitch,
          project_type: projectType,
          skills: skillsList,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create");
      setTitle("");
      setPitch("");
      setProjectType("");
      setSkillsList([]);
      toast.success("Project created");
      router.push("/projects");
    } catch (err: any) {
      setMessage(err?.message || "Failed to create");
      toast.error(err?.message || "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="p-4">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>New Project</CardTitle>
            <CardDescription>Describe your project and required skills.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pitch">Pitch</Label>
              <Textarea id="pitch" rows={4} value={pitch} onChange={(e) => setPitch(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Project Type</Label>
              <Input id="type" value={projectType} onChange={(e) => setProjectType(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Required Skills</Label>
              <SkillsMultiSelect selected={skillsList} onChange={setSkillsList} options={["React","Next.js","TypeScript","Tailwind","Design","Solidity","Python"]} />
            </div>
            <div className="flex gap-2">
              <Button onClick={submit} disabled={saving}>{saving ? "Creating..." : "Create Project"}</Button>
              <Button type="button" variant="outline" onClick={() => router.push("/projects")}>Cancel</Button>
            </div>
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


