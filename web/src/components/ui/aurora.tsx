"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type AuroraProps = {
  className?: string
}

export function AuroraBackground({ className }: AuroraProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden [mask-image:radial-gradient(50%_50%_at_50%_40%,#000_60%,transparent_100%)]",
        className
      )}
    >
      <div className="absolute -top-24 left-1/2 size-[40rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl animate-aurora" />
      <div className="absolute -bottom-40 -left-20 size-[35rem] rounded-full bg-chart-2/20 blur-3xl animate-aurora [animation-delay:.-8s]" />
      <div className="absolute -right-24 top-1/3 size-[30rem] rounded-full bg-chart-3/20 blur-3xl animate-aurora [animation-delay:.-4s]" />
    </div>
  )
}


