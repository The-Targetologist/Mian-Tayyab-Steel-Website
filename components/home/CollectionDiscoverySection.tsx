import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { CollectionGrid } from "@/components/collections/CollectionGrid";
import type { Collection } from "@/types/content";

// Wireframe H04. Distinct background from ProductDiscoverySection and
// CollectionCard's own wider aspect ratio give it a different visual
// hierarchy from the product grid, per the wireframe's requirement. Only
// rendered when at least one collection is published.
export function CollectionDiscoverySection({ collections }: { collections: Collection[] }) {
  return (
    <Section background="off-white">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium tracking-wide text-brand-600 uppercase">
              Applications
            </p>
            <h2 className="mt-2 text-h2 font-bold text-neutral-950 lg:text-h2-lg">
              Browse by application
            </h2>
          </div>
          <Button href="/collections" variant="text">
            View all collections →
          </Button>
        </div>
        <CollectionGrid collections={collections} />
      </div>
    </Section>
  );
}
