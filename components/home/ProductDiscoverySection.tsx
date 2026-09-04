import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { ProductGrid } from "@/components/products/ProductGrid";
import type { Product } from "@/types/content";

// Wireframe H03. Only rendered when there's at least one featured published
// product — docs/home/CatalogueSection.tsx is the honest fallback when
// there's none yet.
export function ProductDiscoverySection({ products }: { products: Product[] }) {
  return (
    <Section background="white">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium tracking-wide text-brand-600 uppercase">Products</p>
            <h2 className="mt-2 text-h2 font-bold text-neutral-950 lg:text-h2-lg">
              Featured products
            </h2>
          </div>
          <Button href="/products" variant="text">
            View all products →
          </Button>
        </div>
        <ProductGrid products={products} />
      </div>
    </Section>
  );
}
