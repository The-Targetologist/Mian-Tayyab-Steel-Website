import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getGlobalFaqs } from "@/lib/queries/faqs";

export const metadata: Metadata = buildPageMetadata({
  path: "/faq",
  title: "FAQ | Mian Tayyab Steel",
  description: "Frequently asked questions about Mian Tayyab Steel products and services.",
});

export default async function FaqPage() {
  const faqs = await getGlobalFaqs();

  return (
    <Section background="white">
      <div className="flex flex-col gap-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />

        <div className="max-w-2xl">
          <p className="text-sm font-medium tracking-wide text-brand-600 uppercase">FAQ</p>
          <h1 className="mt-2 text-h1 font-bold text-neutral-950 lg:text-h1-lg">
            Frequently asked questions
          </h1>
        </div>

        {faqs.length > 0 ? (
          <div className="max-w-(--container-md)">
            <FaqAccordion faqs={faqs} />
          </div>
        ) : (
          <p className="text-body-lg text-neutral-700">
            We&apos;re building out our FAQ library. In the meantime, get in touch and we&apos;ll
            answer your questions directly.
          </p>
        )}
      </div>
    </Section>
  );
}
