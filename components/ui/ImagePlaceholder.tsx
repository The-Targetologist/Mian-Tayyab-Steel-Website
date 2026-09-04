import { cn } from "@/lib/utils/cn";

// Shown wherever a product/collection/service has no real photography yet —
// MTS has no confirmed imagery (docs/PROJECT_STATE.md "Pending Brand
// Inputs"). Same restrained geometric language as the homepage hero visual
// (components/home/HeroVisual.tsx), scaled down for card/gallery contexts.
export function ImagePlaceholder({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label="No image available yet"
    >
      <rect width="200" height="200" className="fill-brand-50" />
      <g transform="rotate(-8 100 100)">
        <rect x="20" y="70" width="160" height="16" className="fill-brand-800" />
        <rect x="20" y="96" width="160" height="16" className="fill-brand-600" />
        <rect x="70" y="20" width="16" height="160" className="fill-brand-500" />
      </g>
    </svg>
  );
}
