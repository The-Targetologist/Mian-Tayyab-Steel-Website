import type { CollectionBlock } from "@/types/content";
import { cn } from "@/lib/utils/cn";

type Props = { block: Extract<CollectionBlock, { type: "application_grid" }> };

export function ApplicationGridBlock({ block }: Props) {
  return (
    <div>
      {block.title && (
        <h2 className="text-h2 font-bold text-neutral-950 lg:text-h2-lg">{block.title}</h2>
      )}
      <ul className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2", block.title && "mt-6")}>
        {block.items.map((item) => (
          <li key={item.title} className="rounded-md border border-neutral-100 p-4 text-body-sm">
            <p className="font-medium text-neutral-950">{item.title}</p>
            {item.description && <p className="mt-1 text-neutral-600">{item.description}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
