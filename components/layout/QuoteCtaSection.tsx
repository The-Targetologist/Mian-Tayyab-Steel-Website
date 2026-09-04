import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";

// Wireframe H08 — strong, simple conversion section.
export function QuoteCtaSection() {
  return (
    <Section background="navy">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <h2 className="text-h2 font-bold text-white lg:text-h2-lg">
          Ready to get a quote?
        </h2>
        <p className="text-body-lg text-brand-100">
          Tell us what you need and our team will get back to you.
        </p>
        <Button href="/contact" variant="primary" className="mt-2">
          Request a Quote
        </Button>
      </div>
    </Section>
  );
}
