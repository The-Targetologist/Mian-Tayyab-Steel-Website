import type { CollectionBlock } from "@/types/content";
import { Button } from "@/components/ui/Button";

type Props = { block: Extract<CollectionBlock, { type: "cta" }> };

export function CtaBlock({ block }: Props) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-lg border border-brand-100 bg-brand-50 p-8">
      <h2 className="text-h3 font-bold text-neutral-950">{block.title}</h2>
      {block.body && <p className="text-body text-neutral-700">{block.body}</p>}
      <Button href={block.buttonHref} variant="primary">
        {block.buttonLabel}
      </Button>
    </div>
  );
}
