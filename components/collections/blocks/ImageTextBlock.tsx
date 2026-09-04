import Image from "next/image";
import type { CollectionBlock } from "@/types/content";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { cn } from "@/lib/utils/cn";

type Props = { block: Extract<CollectionBlock, { type: "image_text" }> };

export function ImageTextBlock({ block }: Props) {
  return (
    <div
      className={cn(
        "grid items-center gap-10 lg:grid-cols-2 lg:gap-16",
        block.imagePosition === "right" && "lg:[&>*:first-child]:order-2",
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-brand-50">
        {block.image ? (
          <Image
            src={block.image.publicUrl}
            alt={block.image.altText ?? block.title}
            fill
            sizes="(min-width: 1024px) 560px, 90vw"
            className="object-cover"
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>
      <div>
        <h2 className="text-h2 font-bold text-neutral-950 lg:text-h2-lg">{block.title}</h2>
        <p className="mt-4 text-body-lg text-neutral-700 whitespace-pre-line">{block.body}</p>
      </div>
    </div>
  );
}
