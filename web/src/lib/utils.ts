import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function withStagger(index: number, baseDelay = 40) {
  return { style: { ['--stagger' as any]: `${index * baseDelay}ms` } }
}
