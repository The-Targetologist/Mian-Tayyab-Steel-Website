import type { CollectionBlock } from "@/types/content";
import { cn } from "@/lib/utils/cn";

type Props = { block: Extract<CollectionBlock, { type: "selection_guide" }> };

export function SelectionGuideBlock({ block }: Props) {
  return (
    <div>
      {block.title && (
        <h2 className="text-h2 font-bold text-neutral-950 lg:text-h2-lg">{block.title}</h2>
      )}
      <ol className={cn("flex flex-col gap-6", block.title && "mt-6")}>
        {block.steps.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span className="text-h3 font-bold text-neutral-200" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="font-semibold text-neutral-950">{step.title}</h3>
              {step.description && (
                <p className="mt-1 text-body-sm text-neutral-600">{step.description}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
