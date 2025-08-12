"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PageHeaderProps = {
  title?: string
  description?: string
  action?: React.ReactNode
  backFallbackHref?: string
  className?: string
}

export function PageHeader({ title, description, action, backFallbackHref, className }: PageHeaderProps) {
  const router = useRouter()

  const onBack = React.useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
      return
    }
    if (backFallbackHref) router.push(backFallbackHref)
  }, [router, backFallbackHref])

  return (
    <div className={cn("flex items-start justify-between gap-3 pb-2", className)}>
      <div>
        <div className="flex items-center gap-2">
          {backFallbackHref ? (
            <Button type="button" variant="ghost" size="sm" onClick={onBack}>Back</Button>
          ) : null}
          {title ? <h1 className="text-base font-semibold leading-none tracking-tight">{title}</h1> : null}
        </div>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}


