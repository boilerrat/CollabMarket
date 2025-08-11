"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sdk } from "@farcaster/miniapp-sdk";
import { SkillsMultiSelect } from "@/components/skills-multiselect";

type ProfileForm = {
  display_name: string;
  handle: string;
  bio: string;
  skills: string;
  availability_hours_week: number | "";
};

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileForm>({
    display_name: "",
    handle: "",
    bio: "",
    skills: "",
    availability_hours_week: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fillFromFarcaster = async () => {
      try {
        const context: any = (sdk as any).context?.get?.();
        const user = context?.user;
        if (!user) return;
        setForm((prev) => ({
          ...prev,
          display_name: user.displayName || prev.display_name,
          handle: user.username || prev.handle,
          bio: user.bio || prev.bio,
        }));
      } catch {
        // ignore if SDK context not available
      }
    };
    fillFromFarcaster();
  }, []);

  const onChange = (key: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = key === "availability_hours_week" ? Number(e.target.value) || "" : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const onSubmit = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save");
      setMessage("Saved");
    } catch (err: any) {
      setMessage(err?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="p-4">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Fill details for collaborator directory.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input id="display_name" value={form.display_name} onChange={onChange("display_name")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="handle">Farcaster Handle</Label>
              <Input id="handle" value={form.handle} onChange={onChange("handle")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" rows={4} value={form.bio} onChange={onChange("bio")} />
            </div>
            <div className="grid gap-2">
              <Label>Skills</Label>
              <SkillsMultiSelect
                selected={form.skills ? form.skills.split(',').map((s) => s.trim()).filter(Boolean) : []}
                onChange={(skills) => setForm((f) => ({ ...f, skills: skills.join(', ') }))}
                options={["React","Next.js","TypeScript","Tailwind","Design","Solidity","Python"]}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="availability_hours_week">Availability (hours/week)</Label>
              <Input id="availability_hours_week" inputMode="numeric" value={String(form.availability_hours_week)} onChange={onChange("availability_hours_week")} />
            </div>
            <div className="flex gap-2">
              <Button onClick={onSubmit} disabled={saving}>{saving ? "Saving..." : "Save Profile"}</Button>
            </div>
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


