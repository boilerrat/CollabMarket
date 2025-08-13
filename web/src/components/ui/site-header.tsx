"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const links = [
  { href: "/projects", label: "Projects" },
  { href: "/collaborators", label: "Collaborators" },
  { href: "/inbox", label: "Inbox" },
]

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center gap-3">
        <Link href="/" className="font-semibold tracking-tight text-sm md:text-base text-gradient">
          CollabMarket
        </Link>
        <nav className="ml-auto hidden sm:flex items-center gap-1.5">
          {links.map((l) => {
            const active = pathname?.startsWith(l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {l.label}
              </Link>
            )
          })}
          <Link
            href="/projects/new"
            className="rounded-md px-3 py-1.5 text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Post
          </Link>
        </nav>
      </div>
    </header>
  )
}


