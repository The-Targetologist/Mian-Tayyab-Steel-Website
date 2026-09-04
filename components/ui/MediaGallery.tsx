"use client";

import { useState } from "react";
import Image from "next/image";
import type { MediaAsset } from "@/types/content";
import { cn } from "@/lib/utils/cn";
import { ImagePlaceholder } from "./ImagePlaceholder";

interface MediaGalleryProps {
  images: MediaAsset[];
  label: string;
}

// Generic image gallery — used by both product and service detail pages
// (docs/08-component-system.md lists ProductGallery/ServiceGallery
// separately, but neither has product/service-specific behavior, so one
// shared component serves both).
export function MediaGallery({ images, label }: MediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-brand-50">
        {activeImage ? (
          <Image
            src={activeImage.publicUrl}
            alt={activeImage.altText ?? label}
            fill
            sizes="(min-width: 1024px) 560px, 90vw"
            priority
            className="object-cover"
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={`${label} gallery thumbnails`}>
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Show image ${index + 1} of ${images.length}`}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative aspect-square w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors duration-fast",
                index === activeIndex ? "border-brand-600" : "border-transparent hover:border-neutral-200",
              )}
            >
              <Image
                src={image.publicUrl}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
