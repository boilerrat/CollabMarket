import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <main className="p-4">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="rounded-lg border p-4">
          <Skeleton className="h-5 w-24 mb-1" />
          <Skeleton className="h-4 w-64 mb-4" />
          <div className="grid gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border rounded-md p-3">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}


