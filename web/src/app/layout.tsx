import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { NavLinks } from "@/components/NavLinks";
import { getSession } from "@/lib/session";
import { isAdminByFid } from "@/lib/admin";
import { Background } from "@/components/Background";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Playful, modern display font for brand and headings
const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
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
      <body className={`${geistSans.variable} ${geistMono.variable} ${display.variable} antialiased`}>
        <Background />
        <header
          className="sticky top-0 z-40 border-b backdrop-blur supports-[backdrop-filter]:bg-white/40 dark:supports-[backdrop-filter]:bg-black/40"
          style={{ backgroundImage: 'linear-gradient(90deg, rgba(0,104,110,.18), rgba(85,220,223,.18))' }}
        >
          <nav className="w-full max-w-[900px] mx-auto py-3 px-4 flex flex-col items-center gap-3 text-sm">
            <NavLinks showInbox={Boolean(session)} showAdmin={isAdmin} />
          </nav>
        </header>
        <main className="min-h-[calc(100dvh-56px)] w-full px-4 flex justify-center">
          <div className="w-full max-w-[900px]">
            {children}
          </div>
        </main>
        {/* footer removed per request */}
      </body>
    </html>
  );
}
