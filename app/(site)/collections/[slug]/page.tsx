import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/components/layout/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { QuoteCtaSection } from "@/components/layout/QuoteCtaSection";
import { ProductGrid } from "@/components/products/ProductGrid";
import { CollectionBlockRenderer } from "@/components/collections/CollectionBlockRenderer";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getCollectionBySlug } from "@/lib/queries/collections";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    return { title: "Collection not found | Mian Tayyab Steel" };
  }

  return buildPageMetadata({
    path: `/collections/${collection.slug}`,
    title: collection.seoTitle ?? `${collection.name} | Mian Tayyab Steel`,
    description: collection.seoDescription ?? collection.shortDescription,
    canonicalUrl: collection.canonicalUrl,
    ogImage: collection.ogImage ?? collection.heroImage,
  });
}

export default async function CollectionDetailPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  return (
    <>
      <Section background="white">
        <div className="flex flex-col gap-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Collections", href: "/collections" },
              { label: collection.name },
            ]}
          />

          <div className="max-w-2xl">
            {collection.kicker && (
              <p className="text-sm font-medium tracking-wide text-brand-600 uppercase">
                {collection.kicker}
              </p>
            )}
            <h1 className="mt-2 text-h1 font-bold text-neutral-950 lg:text-h1-lg">
              {collection.h1}
            </h1>
            {collection.shortDescription && (
              <p className="mt-4 text-body-lg text-neutral-700">{collection.shortDescription}</p>
            )}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button href="/contact" variant="primary">
                Request a Quote
              </Button>
              {collection.brochure && (
                <Button href={collection.brochure.publicUrl} variant="secondary">
                  Download Brochure
                </Button>
              )}
            </div>
          </div>
        </div>
      </Section>

      {collection.introRichtext && (
        <Section background="off-white">
          <p className="max-w-(--container-md) text-body-lg text-neutral-700">
            {collection.introRichtext}
          </p>
        </Section>
      )}

      {collection.contentBlocks.length > 0 && (
        <Section background="white">
          <div className="flex flex-col gap-16">
            <CollectionBlockRenderer blocks={collection.contentBlocks} />
          </div>
        </Section>
      )}

      {collection.products.length > 0 && (
        <Section background="off-white">
          <h2 className="text-h2 font-bold text-neutral-950 lg:text-h2-lg">
            Products in this collection
          </h2>
          <div className="mt-6">
            <ProductGrid products={collection.products} />
          </div>
        </Section>
      )}

      {collection.faqs.length > 0 && (
        <Section background="white">
          <h2 className="text-h2 font-bold text-neutral-950 lg:text-h2-lg">
            Frequently asked questions
          </h2>
          <div className="mt-6">
            <FaqAccordion faqs={collection.faqs} />
          </div>
        </Section>
      )}

      <QuoteCtaSection />
    </>
  );
}
