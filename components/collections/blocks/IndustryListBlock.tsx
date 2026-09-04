import type { CollectionBlock } from "@/types/content";
import { cn } from "@/lib/utils/cn";

type Props = { block: Extract<CollectionBlock, { type: "industry_list" }> };

export function IndustryListBlock({ block }: Props) {
  return (
    <div>
      {block.title && (
        <h2 className="text-h2 font-bold text-neutral-950 lg:text-h2-lg">{block.title}</h2>
      )}
      <ul className={cn("flex flex-wrap gap-2", block.title && "mt-6")}>
        {block.items.map((item) => (
          <li
            key={item}
            className="rounded-md border border-neutral-200 px-3 py-1.5 text-body-sm text-neutral-700"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
