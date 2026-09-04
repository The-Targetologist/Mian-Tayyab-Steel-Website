import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ServiceGrid } from "@/components/services/ServiceGrid";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getPublishedServices } from "@/lib/queries/services";

export const metadata: Metadata = buildPageMetadata({
  path: "/services",
  title: "Services | Mian Tayyab Steel",
  description: "Steel processing and logistics services from Mian Tayyab Steel.",
});

export default async function ServicesPage() {
  const services = await getPublishedServices();

  return (
    <Section background="white">
      <div className="flex flex-col gap-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Services" }]} />

        <div className="max-w-2xl">
          <p className="text-sm font-medium tracking-wide text-brand-600 uppercase">Services</p>
          <h1 className="mt-2 text-h1 font-bold text-neutral-950 lg:text-h1-lg">
            Processing and logistics services
          </h1>
          <p className="mt-4 text-body-lg text-neutral-700">
            {services.length > 0
              ? "Browse our processing and logistics services, or get in touch to discuss your project."
              : "We're finalizing our service capability pages for this site. Tell us what you need and our team will help directly."}
          </p>
        </div>

        <ServiceGrid
          services={services}
          emptyMessage="No services are published yet — check back soon, or get in touch."
        />
      </div>
    </Section>
  );
}
