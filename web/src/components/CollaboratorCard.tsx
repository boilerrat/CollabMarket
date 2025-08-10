"use client";
import { track } from "@vercel/analytics/react";

type Profile = {
  id: string;
  userId: string;
  skills: string[];
  bio?: string | null;
  availabilityHoursWeek: number;
  visibility: string;
  user?: { handle?: string | null; displayName?: string | null };
};

export function CollaboratorCard({ c }: { c: Profile }) {
  function onClick() {
    try { track("collaborator_view", { id: c.id }); } catch {}
  }
  return (
    <div className="border rounded p-3 hover:shadow-sm transition" onClick={onClick} role="button" tabIndex={0}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium">{c.user?.displayName ?? c.user?.handle ?? "Collaborator"}</h3>
          <p className="text-sm text-gray-700">{c.skills.join(", ")}</p>
          {c.bio && <p className="text-sm text-gray-600 line-clamp-3 mt-1">{c.bio}</p>}
          <div className="mt-2 text-xs text-gray-500">{c.availabilityHoursWeek} hrs/week • {c.visibility}</div>
        </div>
      </div>
    </div>
  );
}

