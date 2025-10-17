import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cleanTitle(title: string): string {
  // Remove leading numbers followed by dash (e.g., "81319680 - " becomes "")
  return title.replace(/^\d+\s*-\s*/, '');
}
