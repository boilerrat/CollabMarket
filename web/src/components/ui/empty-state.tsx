"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type EmptyStateProps = {
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border p-8 text-center",
        className
      )}
    >
      {icon ? <div className="mb-1 text-muted-foreground">{icon}</div> : null}
      <h3 className="text-sm font-medium">{title}</h3>
      {description ? (
        <p className="text-sm text-muted-foreground max-w-prose">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}


