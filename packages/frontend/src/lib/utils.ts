import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(cents: number) {
  return new Intl.NumberFormat("ms-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}
