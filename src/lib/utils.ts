import { clsx, type ClassValue } from "clsx";
import type { FieldValues } from "react-hook-form";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Stable JSON so referentially-new `useWatch` objects do not retrigger autosave. */
export function stableFormSnapshot(values: FieldValues | undefined): string {
  if (values == null || typeof values !== "object") {
    return "";
  }
  const keys = Object.keys(values).sort();
  const sorted: FieldValues = {};
  for (const key of keys) {
    sorted[key] = values[key];
  }
  return JSON.stringify(sorted);
}
