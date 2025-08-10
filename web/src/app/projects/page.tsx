import Link from "next/link";

async function fetchProjects() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/projects`, { cache: "no-store" });
  if (!res.ok) return { items: [] };
  return res.json();
}

export default async function ProjectsPage() {
  const { items } = await fetchProjects();
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Projects</h1>
        <Link href="/projects/new" className="text-sm px-3 py-2 rounded bg-black text-white">New Project</Link>
      </div>
      <ul className="space-y-3">
        {items.map((p: any) => (
          <li key={p.id} className="border rounded p-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-medium">{p.title}</h2>
                <p className="text-sm text-gray-600 line-clamp-2">{p.pitch}</p>
              </div>
              <Link href={`/projects/${p.id}/edit`} className="text-sm underline">Edit</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

