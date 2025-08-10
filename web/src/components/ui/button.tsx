"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/cn";

type Intent = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const baseButton =
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 no-underline";

const intentClasses: Record<Intent, string> = {
  primary: "bg-[--primary] text-[--primary-foreground] hover:brightness-110",
  outline:
    "text-current border border-black/10 dark:border-white/15 bg-transparent hover:bg-black/5 dark:hover:bg-white/10",
  ghost: "text-current hover:bg-black/5 dark:hover:bg-white/10",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3",
  md: "h-10 px-4",
  lg: "h-11 px-5",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  intent?: Intent;
  size?: Size;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, intent = "primary", size = "md", asChild, ...props }, ref) => {
    const Comp: any = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(baseButton, intentClasses[intent], sizeClasses[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";


