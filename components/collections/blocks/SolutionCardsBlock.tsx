import type { CollectionBlock } from "@/types/content";
import { cn } from "@/lib/utils/cn";

type Props = { block: Extract<CollectionBlock, { type: "solution_cards" }> };

export function SolutionCardsBlock({ block }: Props) {
  return (
    <div>
      {block.title && (
        <h2 className="text-h2 font-bold text-neutral-950 lg:text-h2-lg">{block.title}</h2>
      )}
      <div
        className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
          block.title && "mt-6",
        )}
      >
        {block.items.map((item) => (
          <div key={item.title} className="rounded-md border border-neutral-100 p-5">
            <p className="font-semibold text-neutral-950">{item.title}</p>
            {item.description && (
              <p className="mt-2 text-body-sm text-neutral-600">{item.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
