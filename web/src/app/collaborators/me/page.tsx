"use client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { track } from "@vercel/analytics/react";

export default function MyProfilePage() {
  const [skills, setSkills] = useState("");
  const [bio, setBio] = useState("");
  const [availability, setAvailability] = useState(0);
  const [visibility, setVisibility] = useState("public");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const csrfHeader = "x-csrf-token";
    const csrfToken = document.cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith("cm_csrf="))?.split("=")[1] ?? "";
    const res = await fetch("/api/collaborators", {
      method: "POST",
      headers: { "content-type": "application/json", [csrfHeader]: csrfToken },
      body: JSON.stringify({
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        bio,
        availabilityHoursWeek: availability,
        visibility,
      }),
    });
    setMessage(res.ok ? "Saved" : "Failed");
    if (res.ok) {
      try { track("profile_saved"); } catch {}
    }
  }

  return (
    <div className="panel max-w-3xl mx-auto p-4 md:p-8" style={{ maxWidth: 900 }}>
      <h1 className="text-2xl font-semibold tracking-tight mb-4">My Collaborator Profile</h1>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Tell others how you like to collaborate</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" aria-label="Collaborator profile form">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Skills</label>
              <Input aria-label="Skills" placeholder="e.g. React, Prisma, Product, Design" value={skills} onChange={(e) => setSkills(e.target.value)} />
              <p className="text-xs opacity-70">Comma-separated. Use broad terms so people can find you.</p>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Bio</label>
              <Textarea aria-label="Bio" placeholder="Short intro, what you build, what you’re looking for" value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Availability (hrs/week)</label>
                <Input aria-label="Availability hours per week" type="number" placeholder="e.g. 5" value={availability} onChange={(e) => setAvailability(Number(e.target.value))} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Visibility</label>
                <select aria-label="Visibility" className="h-10 w-full bg-transparent border rounded-md px-3 text-sm" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <Button type="submit">Save changes</Button>
            </div>
          </form>
          {message && <p className="mt-3 text-sm" role="status">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
