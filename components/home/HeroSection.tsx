import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { HeroVisual } from "./HeroVisual";

// Copy sourced from docs/01-project-brief.md (Primary Objective, Primary
// Audience) — approved planning content, not an invented tagline. No
// unconfirmed specifics (founding date, catalogue, certifications) are
// asserted here.
export function HeroSection() {
  return (
    <Section background="white">
      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div className="flex flex-col items-start gap-6">
          <p className="text-sm font-medium tracking-wide text-brand-600 uppercase">
            Industrial Steel Supplier
          </p>
          <h1 className="text-h1 font-bold text-neutral-950 lg:text-h1-lg">
            Steel supply built for contractors, fabricators and industrial
            projects
          </h1>
          <p className="max-w-xl text-body-lg text-neutral-700">
            Mian Tayyab Steel works with contractors, fabricators and
            industrial buyers to get the right steel to the right project —
            with straightforward quotes and direct access to our team.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href="/products" variant="primary">
              Explore Products
            </Button>
          </div>
        </div>
        <div className="aspect-square w-full overflow-hidden rounded-lg">
          <HeroVisual />
        </div>
      </div>
    </Section>
  );
}
