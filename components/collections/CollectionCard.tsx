import Image from "next/image";
import Link from "next/link";
import type { Collection } from "@/types/content";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

// Visually distinct from ProductCard (docs/06-wireframe-spec.md H04: "Use
// visual hierarchy distinct from product cards") — wider aspect ratio, no
// category eyebrow, kicker + name framed as a landing-page entry point
// rather than a catalogue item.
export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="group flex flex-col overflow-hidden rounded-md border border-neutral-100 transition-colors duration-fast hover:border-brand-600"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-brand-50">
        {collection.heroImage ? (
          <Image
            src={collection.heroImage.publicUrl}
            alt={collection.heroImage.altText ?? collection.name}
            fill
            sizes="(min-width: 1024px) 400px, 90vw"
            className="object-cover transition-transform duration-normal group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-5">
        {collection.kicker && (
          <p className="text-caption font-medium tracking-wide text-brand-600 uppercase">
            {collection.kicker}
          </p>
        )}
        <h3 className="text-h5 font-semibold text-neutral-950">{collection.name}</h3>
        {collection.shortDescription && (
          <p className="text-body-sm text-neutral-600">{collection.shortDescription}</p>
        )}
      </div>
    </Link>
  );
}
