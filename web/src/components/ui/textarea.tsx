import * as React from "react";
import { cn } from "@/lib/cn";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[96px] w-full rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-black/40 dark:placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring]",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";


