import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";

// Combines wireframe H03 (product discovery) and H04 (application/
// collection discovery) into one honest "in progress" state — no product
// or collection names are invented here. Splits into the two dedicated
// sections once real data lands via the product/collection system
// (docs/13-implementation-roadmap.md Phase 4-5) and each can be driven by
// `types/content.ts` Product[]/Collection[] data instead of static copy.
export function CatalogueSection() {
  return (
    <Section background="off-white">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <p className="text-sm font-medium tracking-wide text-brand-600 uppercase">
          Products &amp; Applications
        </p>
        <h2 className="text-h2 font-bold text-neutral-950 lg:text-h2-lg">
          Our catalogue is being finalized
        </h2>
        <p className="text-body-lg text-neutral-700">
          We&apos;re building out full product and application pages for this
          site. In the meantime, tell us what you need and our team will help
          directly.
        </p>
        <Button href="/contact" variant="primary" className="mt-2">
          Get in touch
        </Button>
      </div>
    </Section>
  );
}
