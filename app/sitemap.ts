import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/metadata";
import { getPublishedProducts } from "@/lib/queries/products";
import { getPublishedCollections } from "@/lib/queries/collections";
import { getPublishedServices } from "@/lib/queries/services";
import { getPublishedPosts } from "@/lib/queries/posts";

// docs/12-seo-and-url-strategy.md "Sitemap": generate dynamically from
// published content only. Include pages/products/collections/services/
// posts; exclude admin, drafts, and search result pages.
const STATIC_ROUTES = ["/", "/about", "/products", "/collections", "/services", "/blog", "/faq", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections, services, posts] = await Promise.all([
    getPublishedProducts(),
    getPublishedCollections(),
    getPublishedServices(),
    getPublishedPosts(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/products/${product.slug}`,
    lastModified: product.updatedAt,
  }));

  const collectionEntries: MetadataRoute.Sitemap = collections.map((collection) => ({
    url: `${SITE_URL}/collections/${collection.slug}`,
    lastModified: collection.updatedAt,
  }));

  const serviceEntries: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${SITE_URL}/services/${service.slug}`,
    lastModified: service.updatedAt,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt,
  }));

  return [...staticEntries, ...productEntries, ...collectionEntries, ...serviceEntries, ...postEntries];
}
