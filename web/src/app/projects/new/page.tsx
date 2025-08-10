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
        <input aria-label="Title" className="w-full bg-transparent border rounded p-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea aria-label="Pitch" className="w-full bg-transparent border rounded p-2" placeholder="Pitch" value={pitch} onChange={(e) => setPitch(e.target.value)} required />
        <input aria-label="Category" className="w-full bg-transparent border rounded p-2" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} required />
        <div className="grid grid-cols-2 gap-2">
          <input aria-label="Contact method" className="bg-transparent border rounded p-2" placeholder="Contact method" value={contactMethod} onChange={(e) => setContactMethod(e.target.value)} required />
          <input aria-label="Contact value" className="bg-transparent border rounded p-2" placeholder="Contact value" value={contactValue} onChange={(e) => setContactValue(e.target.value)} required />
        </div>
        <input aria-label="Commitment" className="w-full bg-transparent border rounded p-2" placeholder="Commitment" value={commitment} onChange={(e) => setCommitment(e.target.value)} required />
        <button type="submit" className="btn-primary">Create</button>
      </form>
      {message && <p className="mt-3 text-sm" role="status">{message}</p>}
    </div>
  );
}
