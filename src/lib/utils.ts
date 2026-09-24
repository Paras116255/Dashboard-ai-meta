import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(paiseOrCents: number, currency: string = 'INR'): string {
  const mainUnit = paiseOrCents / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(mainUnit);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(num);
}
