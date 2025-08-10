import Image from "next/image";
import { AppInit } from "@/components/AppInit";
import { AuthButtons } from "@/components/AuthButtons";

export default function Home() {
  return (
    <div className="relative min-h-[calc(100dvh-56px)]">
      <AppInit />
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-28">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
              <span className="text-gradient">Find collaborators.</span> Ship faster.
            </h1>
            <p className="mt-4 text-base opacity-80 max-w-prose">
              Post a project, discover talent, and send interest with one tap. Built for Farcaster Mini Apps.
            </p>
            <div className="mt-6 flex gap-3">
              <AuthButtons />
            </div>
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs opacity-90">
              <div className="surface p-3 flex items-center gap-2"><span className="chip">P0</span> Secure by default</div>
              <div className="surface p-3 flex items-center gap-2"><span className="chip">⚡</span> Fast mini app UX</div>
              <div className="surface p-3 flex items-center gap-2"><span className="chip">☀︎</span> Daily digest</div>
            </div>
          </div>
          <div className="surface p-8 md:p-10">
            <Image src="/globe.svg" alt="Illustration" width={160} height={160} className="opacity-80" />
            <p className="mt-4 text-sm opacity-70">Your network, focused on collaboration. No noise.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
