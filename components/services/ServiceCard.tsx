import Image from "next/image";
import Link from "next/link";
import type { Service } from "@/types/content";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

// Same 4:3 ratio as ProductCard — services are catalogue-like entries too,
// unlike the wider CollectionCard which is a landing-page entry point.
export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex flex-col overflow-hidden rounded-md border border-neutral-100 transition-colors duration-fast hover:border-brand-600"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-50">
        {service.featuredImage ? (
          <Image
            src={service.featuredImage.publicUrl}
            alt={service.featuredImage.altText ?? service.name}
            fill
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-normal group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-5">
        <h3 className="text-h5 font-semibold text-neutral-950">{service.name}</h3>
        {service.shortDescription && (
          <p className="text-body-sm text-neutral-600">{service.shortDescription}</p>
        )}
      </div>
    </Link>
  );
}
