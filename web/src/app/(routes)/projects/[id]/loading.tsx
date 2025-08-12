import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <main className="p-4">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border p-4">
          <Skeleton className="h-6 w-56 mb-2" />
          <Skeleton className="h-4 w-28 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-4/5 mb-2" />
          <Skeleton className="h-9 w-32 mt-4" />
        </div>
      </div>
    </main>
  )
}


