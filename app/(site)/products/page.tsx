import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductGrid } from "@/components/products/ProductGrid";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getPublishedProducts } from "@/lib/queries/products";

export const metadata: Metadata = buildPageMetadata({
  path: "/products",
  title: "Products | Mian Tayyab Steel",
  description: "Browse the Mian Tayyab Steel product catalogue.",
});

export default async function ProductsPage() {
  const products = await getPublishedProducts();

  return (
    <Section background="white">
      <div className="flex flex-col gap-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products" }]} />

        <div className="max-w-2xl">
          <p className="text-sm font-medium tracking-wide text-brand-600 uppercase">
            Products
          </p>
          <h1 className="mt-2 text-h1 font-bold text-neutral-950 lg:text-h1-lg">
            Our product catalogue
          </h1>
          <p className="mt-4 text-body-lg text-neutral-700">
            {products.length > 0
              ? "Browse our range of steel products, or get in touch if you need help finding the right one."
              : "We're finalizing our full product catalogue for this site. Tell us what you need and our team will help directly."}
          </p>
        </div>

        <ProductGrid
          products={products}
          emptyMessage="No products are published yet — check back soon, or get in touch."
        />
      </div>
    </Section>
  );
}
