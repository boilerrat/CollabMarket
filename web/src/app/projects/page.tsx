import Link from "next/link";
import { getBaseUrl } from "@/lib/url";

async function fetchProjects() {
  const base = await getBaseUrl();
  const res = await fetch(new URL("/api/projects", base).toString(), { cache: "no-store" });
  if (!res.ok) return { items: [] };
  return res.json();
}

export default async function ProjectsPage() {
  const { items } = await fetchProjects();
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <Link href="/projects/new" className="btn-primary text-sm">New Project</Link>
      </div>
      <ul className="space-y-3">
        {items.map((p: any) => (
          <li key={p.id} className="surface p-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-medium text-[15px]">{p.title}</h2>
                <p className="text-sm opacity-80 line-clamp-2">{p.pitch}</p>
              </div>
              <Link href={`/projects/${p.id}/edit`} className="text-sm btn-outline">Edit</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
