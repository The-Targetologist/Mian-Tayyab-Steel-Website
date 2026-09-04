import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const metadata: Metadata = {
  title: "Privacy Policy | Mian Tayyab Steel",
  robots: { index: false },
};

// Deliberately not a real privacy policy — actual data-handling practices
// (cookies, analytics, third parties, retention) aren't confirmed yet, and
// publishing fabricated legal text would misrepresent the business and
// carries real liability. Route exists and is noindexed until legal
// content is supplied and reviewed.
export default function PrivacyPolicyPage() {
  return (
    <Section background="white">
      <div className="flex flex-col gap-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />

        <div className="max-w-(--container-md)">
          <h1 className="text-h1 font-bold text-neutral-950 lg:text-h1-lg">Privacy Policy</h1>
          <p className="mt-6 text-body-lg text-neutral-700">
            Our privacy policy is being finalized and will be published here once complete. If
            you have questions about how your information is handled, please{" "}
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
