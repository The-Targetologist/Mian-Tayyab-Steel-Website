import type { ContentStatus } from "@/types/content";
import { cn } from "@/lib/utils/cn";

const styles: Record<ContentStatus, string> = {
  draft: "bg-neutral-100 text-neutral-700",
  published: "bg-brand-100 text-brand-700",
  archived: "bg-neutral-100 text-neutral-500",
};

const labels: Record<ContentStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-sm px-2 py-0.5 text-caption font-medium",
        styles[status],
      )}
    >
      {labels[status]}
    </span>
  );
}
