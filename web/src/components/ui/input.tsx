import * as React from "react";
import { cn } from "@/lib/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md border bg-transparent px-3 py-2 text-base placeholder:text-black/40 dark:placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring]",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";


