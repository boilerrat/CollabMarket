import Image from "next/image";
import { AppInit } from "@/components/AppInit";
import { AuthButtons } from "@/components/AuthButtons";

export default function Home() {
  return (
    <div className="relative min-h-[calc(100dvh-56px)]">
      <AppInit />
      <section className="max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Find collaborators. Ship faster.
            </h1>
            <p className="mt-4 text-base opacity-80 max-w-prose">
              Post a project, discover talent, and send interest with one tap. Built for Farcaster Mini Apps.
            </p>
            <div className="mt-6 flex gap-3">
              <AuthButtons />
              <a href="/feed" className="btn-outline">Browse feed</a>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3 text-xs opacity-70">
              <div className="surface p-3">Secure by default</div>
              <div className="surface p-3">Fast mini app UX</div>
              <div className="surface p-3">Daily digest</div>
            </div>
          </div>
          <div className="surface p-6 md:p-8">
            <Image src="/globe.svg" alt="Illustration" width={160} height={160} className="opacity-80" />
            <p className="mt-4 text-sm opacity-70">Your network, focused on collaboration. No noise.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
