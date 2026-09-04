import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/content";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

// Card image ratio is fixed at 4:3 across archive/related contexts —
// docs/07-design-system.md §11 "Product Image Ratios: define consistent
// ratios... use object-fit intentionally."
export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-md border border-neutral-100 transition-colors duration-fast hover:border-brand-600"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-50">
        {product.featuredImage ? (
          <Image
            src={product.featuredImage.publicUrl}
            alt={product.featuredImage.altText ?? product.name}
            fill
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-normal group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-5">
        {product.shortName && (
          <p className="text-caption font-medium tracking-wide text-brand-600 uppercase">
            {product.shortName}
          </p>
        )}
        <h3 className="text-h5 font-semibold text-neutral-950">{product.name}</h3>
        {product.shortDescription && (
          <p className="text-body-sm text-neutral-600">{product.shortDescription}</p>
        )}
      </div>
    </Link>
  );
}
