"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      intent: {
        primary: "bg-[--primary] text-[--primary-foreground] hover:brightness-110",
        outline: "border bg-transparent hover:bg-black/5 dark:hover:bg-white/10",
        ghost: "hover:bg-black/5 dark:hover:bg-white/10",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-4",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
    },
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, intent, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ intent, size }), className)} {...props} />
  )
);
Button.displayName = "Button";


