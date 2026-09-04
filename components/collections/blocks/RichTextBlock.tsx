import type { CollectionBlock } from "@/types/content";

type Props = { block: Extract<CollectionBlock, { type: "rich_text" }> };

export function RichTextBlock({ block }: Props) {
  return (
    <div className="max-w-(--container-md)">
      {block.title && (
        <h2 className="text-h2 font-bold text-neutral-950 lg:text-h2-lg">{block.title}</h2>
      )}
      <p className="mt-4 text-body-lg text-neutral-700 whitespace-pre-line">{block.body}</p>
    </div>
  );
}
