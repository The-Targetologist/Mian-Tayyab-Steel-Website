import "server-only";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type {
  Faq,
  MediaAsset,
  Product,
  ProductApplication,
  ProductFeature,
  ProductSpecification,
} from "@/types/content";

// Central typed query layer for products — docs/11-technical-architecture.md
// "Do not scatter raw Supabase queries throughout presentational components."
// PRODUCT_SELECT/mapProduct are exported for reuse by lib/queries/collections.ts
// (a collection embeds full Product objects via collection_products).

interface MediaAssetRow {
  id: string;
  bucket: string;
  path: string;
  public_url: string;
  alt_text: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  mime_type: string;
  size_bytes: number;
}

interface ProductSpecificationRow {
  id: string;
  product_id: string;
  label: string;
  value: string;
  unit: string | null;
  sort_order: number;
}

interface ProductFeatureRow {
  id: string;
  product_id: string;
  title: string | null;
  description: string;
  sort_order: number;
}

interface ProductApplicationRow {
  id: string;
  product_id: string;
  title: string;
  description: string | null;
  sort_order: number;
}

interface ProductMediaRow {
  role: "gallery" | "featured" | "diagram" | "document";
  sort_order: number;
  media: MediaAssetRow;
}

interface FaqRow {
  id: string;
  question: string;
  answer_richtext: string;
  status: "draft" | "published" | "archived";
  sort_order: number;
}

interface ProductFaqRow {
  sort_order: number;
  faq: FaqRow | null;
}

export interface ProductRow {
  id: string;
  name: string;
  slug: string;
  short_name: string | null;
  short_description: string | null;
  intro_richtext: string | null;
  body_richtext: string | null;
  origin: string | null;
  status: "draft" | "published" | "archived";
  sort_order: number;
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  featured_image: MediaAssetRow | null;
  og_image: MediaAssetRow | null;
  product_specifications: ProductSpecificationRow[];
  product_features: ProductFeatureRow[];
  product_applications: ProductApplicationRow[];
  product_media: ProductMediaRow[];
  product_faqs: ProductFaqRow[];
}

export const PRODUCT_SELECT = `
  *,
  featured_image:media_assets!featured_image_id(*),
  og_image:media_assets!og_image_id(*),
  product_specifications(*),
  product_features(*),
  product_applications(*),
  product_media(role, sort_order, media:media_assets(*)),
  product_faqs(sort_order, faq:faqs(*))
`;

function mapMediaAsset(row: MediaAssetRow | null): MediaAsset | null {
  if (!row) return null;
  return {
    id: row.id,
    bucket: row.bucket,
    path: row.path,
    publicUrl: row.public_url,
    altText: row.alt_text,
    caption: row.caption,
    width: row.width,
    height: row.height,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
  };
}

function mapSpecification(row: ProductSpecificationRow): ProductSpecification {
  return {
    id: row.id,
    productId: row.product_id,
    label: row.label,
    value: row.value,
    unit: row.unit,
    sortOrder: row.sort_order,
  };
}

function mapFeature(row: ProductFeatureRow): ProductFeature {
  return {
    id: row.id,
    productId: row.product_id,
    title: row.title,
    description: row.description,
    sortOrder: row.sort_order,
  };
}

function mapApplication(row: ProductApplicationRow): ProductApplication {
  return {
    id: row.id,
    productId: row.product_id,
    title: row.title,
    description: row.description,
    sortOrder: row.sort_order,
  };
}

function mapFaq(row: FaqRow): Faq {
  return {
    id: row.id,
    question: row.question,
    answerRichtext: row.answer_richtext,
    status: row.status,
    sortOrder: row.sort_order,
  };
}

function bySortOrder<T extends { sortOrder: number }>(a: T, b: T) {
  return a.sortOrder - b.sortOrder;
}

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    shortName: row.short_name,
    shortDescription: row.short_description,
    introRichtext: row.intro_richtext,
    bodyRichtext: row.body_richtext,
    featuredImage: mapMediaAsset(row.featured_image),
    gallery: (row.product_media ?? [])
      .filter((item) => item.role === "gallery")
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => mapMediaAsset(item.media))
      .filter((asset): asset is MediaAsset => asset !== null),
    origin: row.origin,
    status: row.status,
    sortOrder: row.sort_order,
    isFeatured: row.is_featured,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    canonicalUrl: row.canonical_url,
    ogImage: mapMediaAsset(row.og_image),
    specifications: (row.product_specifications ?? []).map(mapSpecification).sort(bySortOrder),
    features: (row.product_features ?? []).map(mapFeature).sort(bySortOrder),
    applications: (row.product_applications ?? []).map(mapApplication).sort(bySortOrder),
    faqs: (row.product_faqs ?? [])
      .filter((item): item is ProductFaqRow & { faq: FaqRow } => item.faq !== null)
      .map((item) => mapFaq(item.faq))
      .sort(bySortOrder),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
  };
}

export async function getPublishedProducts(): Promise<Product[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`getPublishedProducts: ${error.message}`);
  }

  return (data as unknown as ProductRow[]).map(mapProduct);
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`getFeaturedProducts: ${error.message}`);
  }

  return (data as unknown as ProductRow[]).map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`getProductBySlug: ${error.message}`);
  }

  return data ? mapProduct(data as unknown as ProductRow) : null;
}

export async function getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("related_products")
    .select(`sort_order, product:products!related_product_id(${PRODUCT_SELECT})`)
    .eq("product_id", productId)
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`getRelatedProducts: ${error.message}`);
  }

  return (data as unknown as { product: ProductRow }[])
    .map((row) => row.product)
    .filter((row): row is ProductRow => row !== null)
    .map(mapProduct);
}
