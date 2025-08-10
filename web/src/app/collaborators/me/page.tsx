import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
"use client";
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
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-semibold tracking-tight mb-4">My Collaborator Profile</h1>
      <form onSubmit={onSubmit} className="space-y-3 surface p-4" aria-label="Collaborator profile form">
        <Input aria-label="Skills" placeholder="Skills (comma-separated)" value={skills} onChange={(e) => setSkills(e.target.value)} />
        <Textarea aria-label="Bio" placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
        <Input aria-label="Availability hours per week" type="number" placeholder="Availability hours/week" value={availability} onChange={(e) => setAvailability(Number(e.target.value))} />
        <label className="block text-sm">Visibility
          <select aria-label="Visibility" className="w-full bg-transparent border rounded p-2" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </label>
        <Button type="submit">Save</Button>
      </form>
      {message && <p className="mt-3 text-sm" role="status">{message}</p>}
    </div>
  );
}
