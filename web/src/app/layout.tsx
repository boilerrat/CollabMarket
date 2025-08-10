import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { NavLinks } from "@/components/NavLinks";
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
        <header className="sticky top-0 z-40 border-b backdrop-blur supports-[backdrop-filter]:bg-white/40 dark:supports-[backdrop-filter]:bg-black/40" style={{ backgroundImage: "linear-gradient(90deg, rgba(0,104,110,.18), rgba(85,220,223,.18))" }}>
          <nav className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex items-center gap-4 text-sm">
            <Link href="/" className="text-base font-semibold tracking-tight text-gradient no-underline">Collab</Link>
            <div className="ml-auto">
              <NavLinks showInbox={Boolean(session)} showAdmin={isAdmin} />
            </div>
          </nav>
        </header>
        <main className="min-h-[calc(100dvh-56px)]">{children}</main>
        <footer className="border-t mt-12">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 text-xs opacity-70">
            Built for Farcaster Mini Apps · MVP
          </div>
        </footer>
      </body>
    </html>
  );
}
