import type { CollectionBlock } from "@/types/content";
import { cn } from "@/lib/utils/cn";

type Props = { block: Extract<CollectionBlock, { type: "feature_list" }> };

export function FeatureListBlock({ block }: Props) {
  return (
    <div>
      {block.title && (
        <h2 className="text-h2 font-bold text-neutral-950 lg:text-h2-lg">{block.title}</h2>
      )}
      <ul className={cn("flex flex-col gap-4", block.title && "mt-6")}>
        {block.items.map((item) => (
          <li key={item.title} className="border-l-2 border-brand-600 pl-4">
            <p className="font-semibold text-neutral-950">{item.title}</p>
            {item.description && (
              <p className="mt-1 text-body-sm text-neutral-600">{item.description}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
