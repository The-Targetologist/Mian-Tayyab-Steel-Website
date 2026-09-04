import "server-only";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { PRODUCT_SELECT, mapProduct, type ProductRow } from "./products";
import type { Collection, CollectionBlock, Faq, MediaAsset } from "@/types/content";

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

interface FaqRow {
  id: string;
  question: string;
  answer_richtext: string;
  status: "draft" | "published" | "archived";
  sort_order: number;
}

interface CollectionProductRow {
  sort_order: number;
  product: ProductRow | null;
}

interface CollectionFaqRow {
  sort_order: number;
  faq: FaqRow | null;
}

interface CollectionRow {
  id: string;
  name: string;
  slug: string;
  kicker: string | null;
  h1: string;
  short_description: string | null;
  intro_richtext: string | null;
  content_blocks: unknown;
  status: "draft" | "published" | "archived";
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  hero_image: MediaAssetRow | null;
  og_image: MediaAssetRow | null;
  brochure: MediaAssetRow | null;
  collection_products: CollectionProductRow[];
  collection_faqs: CollectionFaqRow[];
}

const COLLECTION_SELECT = `
  *,
  hero_image:media_assets!hero_image_id(*),
  og_image:media_assets!og_image_id(*),
  brochure:media_assets!brochure_media_id(*),
  collection_products(sort_order, product:products(${PRODUCT_SELECT})),
  collection_faqs(sort_order, faq:faqs(*))
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

function mapFaq(row: FaqRow): Faq {
  return {
    id: row.id,
    question: row.question,
    answerRichtext: row.answer_richtext,
    status: row.status,
    sortOrder: row.sort_order,
  };
}

function byRawSortOrder<T extends { sort_order: number }>(a: T, b: T) {
  return a.sort_order - b.sort_order;
}

const KNOWN_BLOCK_TYPES = new Set([
  "rich_text",
  "image_text",
  "feature_list",
  "solution_cards",
  "application_grid",
  "industry_list",
  "comparison_table",
  "selection_guide",
  "cta",
]);

// Defensive parse — content_blocks is JSONB with no DB-level shape
// guarantee. Silently drops anything that doesn't match a known block type
// rather than crashing the page render.
function parseContentBlocks(raw: unknown): CollectionBlock[] {
  if (!Array.isArray(raw)) return [];

  return raw.filter(
    (block): block is CollectionBlock =>
      typeof block === "object" &&
      block !== null &&
      "type" in block &&
      typeof (block as { type: unknown }).type === "string" &&
      KNOWN_BLOCK_TYPES.has((block as { type: string }).type),
  );
}

function mapCollection(row: CollectionRow): Collection {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    kicker: row.kicker,
    h1: row.h1,
    shortDescription: row.short_description,
    heroImage: mapMediaAsset(row.hero_image),
    introRichtext: row.intro_richtext,
    contentBlocks: parseContentBlocks(row.content_blocks),
    brochure: mapMediaAsset(row.brochure),
    status: row.status,
    sortOrder: row.sort_order,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    canonicalUrl: row.canonical_url,
    ogImage: mapMediaAsset(row.og_image),
    products: (row.collection_products ?? [])
      .filter((item): item is CollectionProductRow & { product: ProductRow } => item.product !== null)
      .sort(byRawSortOrder)
      .map((item) => mapProduct(item.product)),
    faqs: (row.collection_faqs ?? [])
      .filter((item): item is CollectionFaqRow & { faq: FaqRow } => item.faq !== null)
      .sort(byRawSortOrder)
      .map((item) => mapFaq(item.faq)),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
  };
}

export async function getPublishedCollections(): Promise<Collection[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("collections")
    .select(COLLECTION_SELECT)
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`getPublishedCollections: ${error.message}`);
  }

  return (data as unknown as CollectionRow[]).map(mapCollection);
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("collections")
    .select(COLLECTION_SELECT)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`getCollectionBySlug: ${error.message}`);
  }

  return data ? mapCollection(data as unknown as CollectionRow) : null;
}
