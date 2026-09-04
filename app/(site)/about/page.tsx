import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/about",
  title: "About | Mian Tayyab Steel",
  description: "About Mian Tayyab Steel — an industrial steel supplier built for contractors, fabricators and industrial buyers.",
});

const whyChooseUs = [
  {
    title: "Certified & Traceable Material",
    description: "Every batch is traceable to its source mill, with mill test certificates available on request.",
  },
  {
    title: "Broad Product Range",
    description: "Coil, sheet, structural sections, and rebar sourced under one roof, so you're not managing multiple suppliers.",
  },
  {
    title: "In-House Processing",
    description: "Cutting, shearing, plasma cutting, and slitting services to reduce your downstream fabrication work.",
  },
  {
    title: "Reliable Delivery",
    description: "Direct delivery to project sites, warehouses, and fabrication shops across major cities.",
  },
  {
    title: "Transparent Pricing & Terms",
    description: "Clear quotations with no hidden costs, and flexible terms for established customers.",
  },
  {
    title: "Responsive Support",
    description: "A team that answers quickly and helps you specify the right material the first time.",
  },
];

// Content sourced only from docs/01-project-brief.md "Target Brand
// Positioning" and "Primary Audience" — approved planning content. The
// generational/founder-story treatment from docs/06-wireframe-spec.md's
// About wireframe is deliberately not built here: MTS has no confirmed
// company history yet (docs/PROJECT_STATE.md "Pending Brand Inputs"), and
// a fabricated timeline would misrepresent the business. This section
// returns once real history is supplied.
//
// Vision/Mission/Why-Choose-Us copy below and the company profile PDF are
// realistic placeholder content, not confirmed MTS positioning — same
// "clearly marked demo, not fabricated fact" treatment as the seeded demo
// catalogue data. Reviewed against the reference site's About page
// structure/order (hero → vision → mission → why-choose-us → company
// profile, immediately before the footer) per the user's explicit request,
// skipping only the founder/generations sections for the reason above.
export default function AboutPage() {
  return (
    <>
      <Section background="white">
        <div className="flex flex-col gap-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />

          <div className="max-w-2xl">
            <p className="text-sm font-medium tracking-wide text-brand-600 uppercase">About</p>
            <h1 className="mt-2 text-h1 font-bold text-neutral-950 lg:text-h1-lg">
              Mian Tayyab Steel
            </h1>
            <p className="mt-4 text-body-lg text-neutral-700">
              An industrial steel supplier built for contractors, fabricators and industrial
              buyers who need steel they can rely on.
            </p>
          </div>
        </div>
      </Section>

      <Section background="off-white">
        <div className="max-w-(--container-md) flex flex-col gap-6">
          <h2 className="text-h2 font-bold text-neutral-950 lg:text-h2-lg">Who we work with</h2>
          <p className="text-body-lg text-neutral-700">
            Mian Tayyab Steel works with construction companies, contractors, architects,
            fabricators, engineering firms, manufacturers, steel traders, industrial buyers,
            procurement teams and infrastructure-related businesses — anyone who needs steel
            sourced, quoted and supplied without friction.
          </p>
        </div>
      </Section>

      <Section background="white">
        <div className="max-w-(--container-md) flex flex-col gap-6">
          <div>
            <p className="text-sm font-medium tracking-wide text-brand-600 uppercase">Our Vision</p>
            <h2 className="mt-2 text-h2 font-bold text-neutral-950 lg:text-h2-lg">
              Shaping the Future of Steel in Pakistan
            </h2>
          </div>
          <p className="text-body-lg text-neutral-700">
            As Pakistan&apos;s construction and industrial sectors continue to grow, we&apos;re
            working to become one of the country&apos;s most dependable steel suppliers —
            expanding our product range, strengthening our supply chain, and investing in the
            processing capabilities our customers need to build with confidence. Our vision is a
            future where sourcing steel is simple, transparent, and reliable, whether
            you&apos;re placing a single order or managing a large-scale project.
          </p>
        </div>
      </Section>

      <Section background="off-white">
        <div className="max-w-(--container-md) flex flex-col gap-6">
          <div>
            <p className="text-sm font-medium tracking-wide text-brand-600 uppercase">Our Mission</p>
            <h2 className="mt-2 text-h2 font-bold text-neutral-950 lg:text-h2-lg">
              Delivering Quality Built on Trust
            </h2>
          </div>
          <p className="text-body-lg text-neutral-700">
            Our mission is to supply steel our customers can depend on, every time. That means
            sourcing from verified mills, standing behind the specifications we quote, and being
            straightforward about lead times, pricing, and availability. We measure our success
            not by a single transaction, but by the long-term relationships we build with
            contractors, fabricators, and industrial buyers who return to us because we do what
            we say we will.
          </p>
        </div>
      </Section>

      <Section background="white">
        <div className="flex flex-col gap-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium tracking-wide text-brand-600 uppercase">
              Why Choose Us
            </p>
            <h2 className="mt-2 text-h2 font-bold text-neutral-950 lg:text-h2-lg">
              Why Choose Mian Tayyab Steel
            </h2>
          </div>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {whyChooseUs.map((item) => (
              <li key={item.title} className="rounded-md border border-neutral-100 p-5 text-body-sm">
                <p className="font-semibold text-neutral-950">{item.title}</p>
                <p className="mt-1 text-neutral-600">{item.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section background="off-white">
        <div className="max-w-(--container-md) flex flex-col gap-5">
          <div>
            <p className="text-sm font-medium tracking-wide text-brand-600 uppercase">
              Company Profile
            </p>
            <h2 className="mt-2 text-h2 font-bold text-neutral-950 lg:text-h2-lg">
              Learn More About Mian Tayyab Steel
            </h2>
          </div>
          <p className="text-body-lg text-neutral-700">
            Download our company profile for a complete overview of our product range, services,
            and capabilities.
          </p>
          <div>
            <Button href="/documents/mian-tayyab-steel-company-profile-draft.pdf" variant="primary">
              View Profile
            </Button>
            <p className="mt-2 text-caption text-neutral-500">
              Draft placeholder document — the final company profile will be added here once
              available.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
