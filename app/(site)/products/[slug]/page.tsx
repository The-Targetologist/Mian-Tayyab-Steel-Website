import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/components/layout/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { QuoteCtaSection } from "@/components/layout/QuoteCtaSection";
import { MediaGallery } from "@/components/ui/MediaGallery";
import { KeyValueList } from "@/components/ui/KeyValueList";
import { TitleDescriptionList } from "@/components/ui/TitleDescriptionList";
import { RelatedProducts } from "@/components/products/RelatedProducts";
import { ServiceGrid } from "@/components/services/ServiceGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildProductSchema } from "@/lib/seo/schema";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries/products";
import { getRelatedServicesForProduct } from "@/lib/queries/services";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found | Mian Tayyab Steel" };
  }

  return buildPageMetadata({
    path: `/products/${product.slug}`,
    title: product.seoTitle ?? `${product.name} | Mian Tayyab Steel`,
    description: product.seoDescription ?? product.shortDescription,
    canonicalUrl: product.canonicalUrl,
    ogImage: product.ogImage ?? product.featuredImage,
  });
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [relatedProducts, relatedServices] = await Promise.all([
    getRelatedProducts(product.id),
    getRelatedServicesForProduct(product.id),
  ]);
  const galleryImages = product.featuredImage
    ? [product.featuredImage, ...product.gallery]
    : product.gallery;

  return (
    <>
      <JsonLd data={buildProductSchema(product)} />
      <Section background="white">
        <div className="flex flex-col gap-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Products", href: "/products" },
              { label: product.name },
            ]}
          />

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <MediaGallery images={galleryImages} label={product.name} />

            <div className="flex flex-col items-start gap-4">
              {product.shortName && (
                <p className="text-sm font-medium tracking-wide text-brand-600 uppercase">
                  {product.shortName}
                </p>
              )}
              <h1 className="text-h1 font-bold text-neutral-950 lg:text-h1-lg">
                {product.name}
              </h1>
              {product.shortDescription && (
                <p className="text-body-lg text-neutral-700">{product.shortDescription}</p>
              )}
              <Button href="/contact" variant="primary">
                Request a Quote
              </Button>

              {product.specifications.length > 0 && (
                <div className="w-full pt-4">
                  <KeyValueList items={product.specifications} />
                </div>
              )}
            </div>
          </div>
        </div>
      </Section>

      {product.introRichtext && (
        <Section background="off-white">
          <div className="max-w-(--container-md)">
            <h2 className="text-h2 font-bold text-neutral-950 lg:text-h2-lg">Overview</h2>
            <p className="mt-4 text-body-lg text-neutral-700">{product.introRichtext}</p>
          </div>
        </Section>
      )}

      {product.applications.length > 0 && (
        <Section background="white">
          <h2 className="text-h2 font-bold text-neutral-950 lg:text-h2-lg">Applications</h2>
          <div className="mt-6">
            <TitleDescriptionList items={product.applications} />
          </div>
        </Section>
      )}

      {relatedServices.length > 0 && (
        <Section background="off-white">
          <h2 className="text-h2 font-bold text-neutral-950 lg:text-h2-lg">Related services</h2>
          <div className="mt-6">
            <ServiceGrid services={relatedServices} />
          </div>
        </Section>
      )}

      {product.faqs.length > 0 && (
        <Section background="white">
          <h2 className="text-h2 font-bold text-neutral-950 lg:text-h2-lg">
            Frequently asked questions
          </h2>
          <div className="mt-6">
            <FaqAccordion faqs={product.faqs} />
          </div>
        </Section>
      )}

      {relatedProducts.length > 0 && (
        <Section background="white">
          <h2 className="text-h2 font-bold text-neutral-950 lg:text-h2-lg">Related products</h2>
          <div className="mt-6">
            <RelatedProducts products={relatedProducts} />
          </div>
        </Section>
      )}

      <QuoteCtaSection />
    </>
  );
}
