"use client";
import { useEffect, useState } from "react";

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [title, setTitle] = useState("");
  const [pitch, setPitch] = useState("");
  const [status, setStatus] = useState("active");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/projects?take=1&cursor=`); // quick fetch list then pick by id if needed
      // For simplicity, not preloading; real UI would GET /api/projects/:id
    })();
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const csrfHeader = "x-csrf-token";
    const csrfToken = document.cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith("cm_csrf="))?.split("=")[1] ?? "";
    const res = await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", [csrfHeader]: csrfToken },
      body: JSON.stringify({ title, pitch, status }),
    });
    setMessage(res.ok ? "Saved" : "Failed");
    if (res.ok) {
      try { (await import("@vercel/analytics/react")).track("project_saved", { id }); } catch {}
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Edit Project</h1>
      <form onSubmit={onSubmit} className="space-y-3" aria-label="Edit project form">
        <input aria-label="Title" className="w-full border rounded p-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea aria-label="Pitch" className="w-full border rounded p-2" placeholder="Pitch" value={pitch} onChange={(e) => setPitch(e.target.value)} />
        <label className="block text-sm">Status
          <select aria-label="Status" className="w-full border rounded p-2" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <button type="submit" className="px-4 py-2 rounded bg-black text-white">Save</button>
      </form>
      {message && <p className="mt-3 text-sm" role="status">{message}</p>}
    </div>
  );
}
