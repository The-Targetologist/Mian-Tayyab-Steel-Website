import Link from "next/link";
import { cn } from "@/lib/utils/cn";

// Provisional wordmark — a restrained geometric text lockup standing in for
// final MTS logo artwork (docs/07-design-system.md §3). Swap for the real
// mark once supplied; keep the same slot/props shape.
interface LogoProps {
  variant?: "dark" | "light";
  className?: string;
}

export function Logo({ variant = "dark", className }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Mian Tayyab Steel — home"
      className={cn(
        "inline-flex items-center gap-2",
        variant === "light" ? "text-white" : "text-neutral-950",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("h-6 w-1.5", variant === "light" ? "bg-brand-500" : "bg-brand-600")}
      />
      <span className="text-xl font-bold tracking-tight">MTS</span>
    </Link>
  );
}
