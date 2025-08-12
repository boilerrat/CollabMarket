"use client"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="p-4">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-md border bg-destructive/10 text-destructive p-4">
          <p className="font-medium mb-1">Something went wrong</p>
          <p className="text-sm opacity-80 mb-3">{error?.message || "Failed to load project."}</p>
          <button className="text-sm underline" onClick={reset}>Try again</button>
        </div>
      </div>
    </main>
  )
}


