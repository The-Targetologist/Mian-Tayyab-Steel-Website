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
import { ProductGrid } from "@/components/products/ProductGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildServiceSchema } from "@/lib/seo/schema";
import { getServiceBySlug } from "@/lib/queries/services";

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    return { title: "Service not found | Mian Tayyab Steel" };
  }

  return buildPageMetadata({
    path: `/services/${service.slug}`,
    title: service.seoTitle ?? `${service.name} | Mian Tayyab Steel`,
    description: service.seoDescription ?? service.shortDescription,
    canonicalUrl: service.canonicalUrl,
    ogImage: service.ogImage ?? service.featuredImage,
  });
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const galleryImages = service.featuredImage
    ? [service.featuredImage, ...service.gallery]
    : service.gallery;

  return (
    <>
      <JsonLd data={buildServiceSchema(service)} />
      <Section background="white">
        <div className="flex flex-col gap-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Services", href: "/services" },
              { label: service.name },
            ]}
          />

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <MediaGallery images={galleryImages} label={service.name} />

            <div className="flex flex-col items-start gap-4">
              <h1 className="text-h1 font-bold text-neutral-950 lg:text-h1-lg">
                {service.name}
              </h1>
              {service.shortDescription && (
                <p className="text-body-lg text-neutral-700">{service.shortDescription}</p>
              )}
              {service.serviceArea && (
                <p className="text-body-sm text-neutral-500">Service area: {service.serviceArea}</p>
              )}
              <Button href="/contact" variant="primary">
                Request a Quote
              </Button>

              {service.capabilities.length > 0 && (
                <div className="w-full pt-4">
                  <KeyValueList items={service.capabilities} />
                </div>
              )}
            </div>
          </div>
        </div>
      </Section>

      {service.introRichtext && (
        <Section background="off-white">
          <div className="max-w-(--container-md)">
            <h2 className="text-h2 font-bold text-neutral-950 lg:text-h2-lg">Overview</h2>
            <p className="mt-4 text-body-lg text-neutral-700">{service.introRichtext}</p>
          </div>
        </Section>
      )}

      {service.requirements.length > 0 && (
        <Section background="white">
          <h2 className="text-h2 font-bold text-neutral-950 lg:text-h2-lg">
            Project requirements
          </h2>
          <div className="mt-6">
            <TitleDescriptionList items={service.requirements} />
          </div>
        </Section>
      )}

      {service.relatedProducts.length > 0 && (
        <Section background="off-white">
          <h2 className="text-h2 font-bold text-neutral-950 lg:text-h2-lg">Related products</h2>
          <div className="mt-6">
            <ProductGrid products={service.relatedProducts} />
          </div>
        </Section>
      )}

      {service.faqs.length > 0 && (
        <Section background="white">
          <h2 className="text-h2 font-bold text-neutral-950 lg:text-h2-lg">
            Frequently asked questions
          </h2>
          <div className="mt-6">
            <FaqAccordion faqs={service.faqs} />
          </div>
        </Section>
      )}

      <QuoteCtaSection />
    </>
  );
}
