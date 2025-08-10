import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
"use client";
import { useState } from "react";
import { track } from "@vercel/analytics/react";

export default function NewProjectPage() {
  const [title, setTitle] = useState("");
  const [pitch, setPitch] = useState("");
  const [category, setCategory] = useState("");
  const [contactMethod, setContactMethod] = useState("farcaster");
  const [contactValue, setContactValue] = useState("");
  const [commitment, setCommitment] = useState("part-time");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const csrfHeader = "x-csrf-token";
    const csrfToken = document.cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith("cm_csrf="))?.split("=")[1] ?? "";
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "content-type": "application/json", [csrfHeader]: csrfToken },
      body: JSON.stringify({ title, pitch, category, contactMethod, contactValue, commitment, roles: [] }),
    });
    if (res.ok) {
      setMessage("Created");
      try { track("project_created"); } catch {}
    } else {
      const j = await res.json().catch(() => ({}));
      setMessage(j?.error?.message ?? "Failed");
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-semibold tracking-tight mb-4">New Project</h1>
      <form onSubmit={onSubmit} className="space-y-3 surface p-4" aria-label="Create project form">
        <Input aria-label="Title" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Textarea aria-label="Pitch" placeholder="Pitch" value={pitch} onChange={(e) => setPitch(e.target.value)} required />
        <Input aria-label="Category" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} required />
        <div className="grid grid-cols-2 gap-2">
          <Input aria-label="Contact method" placeholder="Contact method" value={contactMethod} onChange={(e) => setContactMethod(e.target.value)} required />
          <Input aria-label="Contact value" placeholder="Contact value" value={contactValue} onChange={(e) => setContactValue(e.target.value)} required />
        </div>
        <Input aria-label="Commitment" placeholder="Commitment" value={commitment} onChange={(e) => setCommitment(e.target.value)} required />
        <Button type="submit">Create</Button>
      </form>
      {message && <p className="mt-3 text-sm" role="status">{message}</p>}
    </div>
  );
}
