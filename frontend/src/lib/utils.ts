import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Soft background tint of any CSS colour (including var(--token)). */
export function tint(color: string, percent = 12) {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`
}
