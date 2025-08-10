"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TabBar(): React.ReactElement {
  const pathname = usePathname();
  const items = [
    { href: "/feed", label: "Feed" },
    { href: "/projects/new", label: "Post" },
    { href: "/projects", label: "Projects" },
    { href: "/collaborators/me", label: "Profile" },
  ];
  return (
    <div className="tabbar">
      {items.map((i) => {
        const active = pathname?.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} className={active ? "active" : undefined}>
            {i.label}
          </Link>
        );
      })}
    </div>
  );
}


