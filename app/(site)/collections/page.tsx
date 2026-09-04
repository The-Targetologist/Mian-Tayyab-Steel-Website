import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CollectionGrid } from "@/components/collections/CollectionGrid";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getPublishedCollections } from "@/lib/queries/collections";

export const metadata: Metadata = buildPageMetadata({
  path: "/collections",
  title: "Collections | Mian Tayyab Steel",
  description: "Browse Mian Tayyab Steel products by application and use case.",
});

export default async function CollectionsPage() {
  const collections = await getPublishedCollections();

  return (
    <Section background="white">
      <div className="flex flex-col gap-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Collections" }]} />

        <div className="max-w-2xl">
          <p className="text-sm font-medium tracking-wide text-brand-600 uppercase">
            Collections
          </p>
          <h1 className="mt-2 text-h1 font-bold text-neutral-950 lg:text-h1-lg">
            Find the right steel by application
          </h1>
          <p className="mt-4 text-body-lg text-neutral-700">
            {collections.length > 0
              ? "Browse our product collections by use case, or get in touch if you need help finding the right one."
              : "We're finalizing our application and use-case guides for this site. Tell us what you need and our team will help directly."}
          </p>
        </div>

        <CollectionGrid
          collections={collections}
          emptyMessage="No collections are published yet — check back soon, or get in touch."
        />
      </div>
    </Section>
  );
}
