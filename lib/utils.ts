import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes, resolving conflicts (last one wins). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "FOOD_BEVERAGE" -> "Food beverage" - for display-only rendering of
 * backend enum values (which come back as SCREAMING_SNAKE_CASE). */
export function formatEnumLabel(value: string) {
  const lower = value.toLowerCase().replaceAll("_", " ");
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}
