import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a raw guest name from URL slug/query param into Title Case.
 * Example: 'joevano-pangangkat' -> 'Joevano Pangangkat'
 * Example: 'joevano-alfeus-pangangkat' -> 'Joevano Alfeus Pangangkat'
 */
export function formatGuestName(raw?: string | null): string {
  if (!raw) return "";

  let str = raw;
  try {
    str = decodeURIComponent(str);
  } catch {}

  // Replace +, -, _ with space
  const cleaned = str
    .replace(/[+_]/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "";

  // Title-case each word
  return cleaned
    .split(" ")
    .map((word) => {
      if (!word) return "";
      if (word === "&") return "&";
      const lower = word.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

