import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";

// Sourced from docs/01-project-brief.md "Target Brand Positioning" and
// "Primary Audience" — approved planning content, written as prose rather
// than an icon-card grid (docs/16-claude-project-rules.md design rejection
// checklist explicitly flags icon grids substituting for real content). A
// fuller history/legacy section belongs on /about once real company history
// is supplied (docs/PROJECT_STATE.md "Pending Brand Inputs").
export function TrustSection() {
  return (
    <Section background="white">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-6">
        <p className="text-sm font-medium tracking-wide text-brand-600 uppercase">
          Who we work with
        </p>
        <h2 className="text-h2 font-bold text-neutral-950 lg:text-h2-lg">
          Steel supply for contractors, fabricators and industrial projects
        </h2>
        <p className="text-body-lg text-neutral-700">
          Mian Tayyab Steel works with construction companies, contractors,
          architects, fabricators, engineering firms and industrial buyers
          who need steel they can rely on — sourced, quoted and supplied
          without friction. We&apos;re building our operation around being
          established, reliable and easy to reach, with the technical
          competence our customers&apos; projects demand.
        </p>
        <Button href="/about" variant="text">
          Learn more about us →
        </Button>
      </div>
    </Section>
  );
}
