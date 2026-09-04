import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const metadata: Metadata = {
  title: "Terms and Conditions | Mian Tayyab Steel",
  robots: { index: false },
};

// Same caveat as /privacy-policy — not real terms yet, published legal
// text needs actual business/legal review first.
export default function TermsPage() {
  return (
    <Section background="white">
      <div className="flex flex-col gap-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Terms and Conditions" }]} />

        <div className="max-w-(--container-md)">
          <h1 className="text-h1 font-bold text-neutral-950 lg:text-h1-lg">
            Terms and Conditions
          </h1>
          <p className="mt-6 text-body-lg text-neutral-700">
            Our terms and conditions are being finalized and will be published here once
            complete. If you have questions in the meantime, please{" "}
            <a href="/contact" className="text-brand-600 hover:underline">
              get in touch
            </a>
            .
          </p>
        </div>
      </div>
    </Section>
  );
}
