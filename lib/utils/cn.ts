import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// twMerge resolves conflicting Tailwind utilities (e.g. a consumer's
// `className="hidden"` overriding a component's own `inline-flex`) by
// keeping the later class in each conflict group — plain clsx concatenation
// leaves the outcome to Tailwind's generated stylesheet order, which is not
// guaranteed to match source order.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
