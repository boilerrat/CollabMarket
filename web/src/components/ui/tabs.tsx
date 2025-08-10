"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

type TabsContextValue = {
  value: string;
  setValue: (v: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

export function Tabs({ defaultValue, value, onValueChange, className, children }: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const [internal, setInternal] = React.useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const current = isControlled ? (value as string) : internal;
  const set = (v: string) => {
    if (!isControlled) setInternal(v);
    onValueChange?.(v);
  };
  return (
    <TabsContext.Provider value={{ value: current, setValue: set }}>
      <div className={cn(className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid grid-cols-2 gap-2", className)} {...props} />;
}

export function TabsTrigger({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) return null;
  const isActive = ctx.value === value;
  return (
    <button
      className={cn("btn-outline", isActive && "ring-1 ring-[--ring]", className)}
      onClick={() => ctx.setValue(value)}
      type="button"
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) {
  const ctx = React.useContext(TabsContext);
  if (!ctx || ctx.value !== value) return null;
  return <div className={cn(className)}>{children}</div>;
}


