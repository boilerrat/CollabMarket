import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <main className="p-4">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="grid gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4">
              <Skeleton className="h-5 w-56 mb-1" />
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-4/5 mb-2" />
              <div className="flex gap-2 mt-2">
                {Array.from({ length: 7 }).map((_, j) => (
                  <Skeleton key={j} className="h-6 w-16 rounded-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}


