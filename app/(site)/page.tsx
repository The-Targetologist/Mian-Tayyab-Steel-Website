import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { CatalogueSection } from "@/components/home/CatalogueSection";
import { ProductDiscoverySection } from "@/components/home/ProductDiscoverySection";
import { CollectionDiscoverySection } from "@/components/home/CollectionDiscoverySection";
import { TrustSection } from "@/components/home/TrustSection";
import { DistributorsSection } from "@/components/home/DistributorsSection";
import { QuoteCtaSection } from "@/components/layout/QuoteCtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildOrganizationSchema } from "@/lib/seo/schema";
import { getFeaturedProducts } from "@/lib/queries/products";
import { getPublishedCollections } from "@/lib/queries/collections";
import { getPublishedPartners } from "@/lib/queries/partners";
import { getSiteSettings } from "@/lib/queries/settings";

export const metadata: Metadata = buildPageMetadata({
  path: "/",
  title: "Mian Tayyab Steel | Industrial Steel Supplier",
  description:
    "Mian Tayyab Steel supplies steel for contractors, fabricators and industrial projects. Request a quote and get direct access to our team.",
});

export default async function Home() {
  const [products, collections, partners, settings] = await Promise.all([
    getFeaturedProducts(6),
    getPublishedCollections(),
    getPublishedPartners(),
    getSiteSettings(),
  ]);
  const featuredCollections = collections.slice(0, 6);

  return (
    <>
      {/* Organization schema on the homepage only — the entity representing
          the whole site, not repeated on every page (docs/12-seo-and-url-strategy.md
          "Structured data"). Uses whatever real settings exist (Phase 10);
          falls back to just name+url when Settings is still empty, never
          fabricated address/contact facts. */}
      <JsonLd data={buildOrganizationSchema(settings)} />
      <HeroSection />
      {products.length === 0 && featuredCollections.length === 0 && <CatalogueSection />}
      {products.length > 0 && <ProductDiscoverySection products={products} />}
      {featuredCollections.length > 0 && (
        <CollectionDiscoverySection collections={featuredCollections} />
      )}
      <TrustSection />
      <DistributorsSection partners={partners} />
      <QuoteCtaSection />
    </>
  );
}
