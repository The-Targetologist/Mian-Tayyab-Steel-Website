import type { Metadata } from "next";
import type { MediaAsset } from "@/types/content";

export const SITE_NAME = "Mian Tayyab Steel";

// Placeholder until a real production domain is chosen (.env.local flags
// this) — every URL-based metadata field below composes against this, so
// updating the one env var fixes canonical/OG/sitemap/robots together.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

interface BuildPageMetadataInput {
  path: string;
  title: string;
  description?: string | null;
  canonicalUrl?: string | null;
  ogImage?: MediaAsset | null;
  type?: "website" | "article";
}

// Shared by every indexable page's generateMetadata — docs/12-seo-and-url-strategy.md
// "Every indexable page should have intentional: title, meta description,
// canonical, Open Graph title/description/image." `canonicalUrl` is the
// admin-editable per-entity override (Products/Collections/Services/Posts
// SEO sections, built in Phase 10); falls back to the page's own real path
// when unset, never a guessed/duplicate URL.
export function buildPageMetadata({
  path,
  title,
  description,
  canonicalUrl,
  ogImage,
  type = "website",
}: BuildPageMetadataInput): Metadata {
  const canonical = canonicalUrl || path;
  const resolvedDescription = description ?? undefined;
  const images = ogImage
    ? [
        {
          url: ogImage.publicUrl,
          width: ogImage.width ?? undefined,
          height: ogImage.height ?? undefined,
          alt: ogImage.altText ?? title,
        },
      ]
    : undefined;

  return {
    title,
    description: resolvedDescription,
    alternates: { canonical },
    openGraph: {
      title,
      description: resolvedDescription,
      url: canonical,
      siteName: SITE_NAME,
      type,
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description: resolvedDescription,
      images: images?.map((image) => image.url),
    },
  };
}
