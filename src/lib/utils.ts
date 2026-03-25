/**
 * Utility helpers shared across the app.
 *
 * Currently exports `cn` - a class-name merger that combines clsx (conditional
 * class logic) with tailwind-merge (deduplication of conflicting Tailwind
 * utility classes).
 *
 * @module lib/utils
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
