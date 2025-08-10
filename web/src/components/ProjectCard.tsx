"use client";
import { track } from "@vercel/analytics/react";

type Project = {
  id: string;
  title: string;
  pitch: string;
  category: string;
  status: string;
};

export function ProjectCard({ p }: { p: Project }) {
  async function interest() {
    const csrf = document.cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith("cm_csrf="))?.split("=")[1] ?? "";
    const res = await fetch(`/api/projects/${p.id}/interest`, {
      method: "POST",
      headers: { "x-csrf-token": csrf },
    });
    if (res.ok) {
      try { track("interest_sent", { projectId: p.id }); } catch {}
      alert("Interest sent!");
    } else {
      alert("Failed to send interest");
    }
  }

  return (
    <div className="border rounded p-3 hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium">{p.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-3">{p.pitch}</p>
          <div className="mt-2 text-xs text-gray-500">{p.category} • {p.status}</div>
        </div>
        <button onClick={interest} className="text-sm px-3 py-2 rounded bg-black text-white">I'm interested</button>
      </div>
    </div>
  );
}

