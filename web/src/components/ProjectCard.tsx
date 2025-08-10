"use client";
import { Button } from "@/components/ui/button";
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
    <div className="surface p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-medium text-[15px]">{p.title}</h3>
          <p className="text-sm opacity-80 line-clamp-3 mt-1">{p.pitch}</p>
          <div className="mt-2 text-xs opacity-60">{p.category} • {p.status}</div>
        </div>
        <Button onClick={interest}>I'm interested</Button>
      </div>
    </div>
  );
}

