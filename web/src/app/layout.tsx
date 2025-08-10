import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { isAdminByFid } from "@/lib/admin";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Collaborators Marketplace",
  description: "Find collaborators and projects in seconds",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const isAdmin = isAdminByFid(session?.fid ?? null);
  // Fetch CSRF on initial layout render to prime cookie in SSR
  // This is safe and lightweight; header values are exposed for clients if needed
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="sticky top-0 z-40 border-b backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/40">
          <nav className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex items-center gap-4 text-sm">
            <Link href="/" className="text-base font-semibold tracking-tight text-gradient">Collab</Link>
            <Link href="/feed" className="opacity-80 hover:opacity-100 transition">Feed</Link>
            <Link href="/projects" className="opacity-80 hover:opacity-100 transition">Projects</Link>
            <Link href="/projects/new" className="opacity-80 hover:opacity-100 transition">New</Link>
            <Link href="/collaborators/me" className="opacity-80 hover:opacity-100 transition">My Profile</Link>
            <div className="ml-auto flex items-center gap-3">
              {session && <Link href="/inbox" className="btn-outline">Inbox</Link>}
              {isAdmin && <Link href="/admin/reports" className="btn-outline">Admin</Link>}
            </div>
          </nav>
        </header>
        <main className="min-h-[calc(100dvh-56px)]">{children}</main>
        <footer className="border-t mt-12">
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 text-xs opacity-70">
            Built for Farcaster Mini Apps · MVP
          </div>
        </footer>
      </body>
    </html>
  );
}
