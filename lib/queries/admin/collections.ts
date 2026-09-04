import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Collection, CollectionBlock, MediaAsset } from "@/types/content";

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
}

const ADMIN_COLLECTION_SELECT = `
  *,
  hero_image:media_assets!hero_image_id(*),
  og_image:media_assets!og_image_id(*),
  brochure:media_assets!brochure_media_id(*)
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

// Same defensive parse as the public query layer (lib/queries/collections.ts)
function parseContentBlocks(raw: unknown): CollectionBlock[] {
  return Array.isArray(raw) ? (raw as CollectionBlock[]) : [];
}

// Admin mapping intentionally omits products/faqs (fetched separately via
// getProductIdsForCollection/getFaqIdsForCollection as plain id lists — the
// form only needs ids to pre-check boxes, not full nested Product/Faq
// objects the public detail page needs).
function mapAdminCollection(row: CollectionRow): Omit<Collection, "products" | "faqs"> {
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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
  };
}

export type AdminCollection = Omit<Collection, "products" | "faqs">;

export async function getAdminCollections(): Promise<AdminCollection[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("collections")
    .select(ADMIN_COLLECTION_SELECT)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`getAdminCollections: ${error.message}`);
  }

  return (data as unknown as CollectionRow[]).map(mapAdminCollection);
}

export async function getAdminCollectionById(id: string): Promise<AdminCollection | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("collections")
    .select(ADMIN_COLLECTION_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`getAdminCollectionById: ${error.message}`);
  }

  return data ? mapAdminCollection(data as unknown as CollectionRow) : null;
}

export interface ProductOption {
  id: string;
  name: string;
}

export async function getAllProductOptionsForCollections(): Promise<ProductOption[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("products").select("id, name").order("name", { ascending: true });

  if (error) {
    throw new Error(`getAllProductOptionsForCollections: ${error.message}`);
  }

  return data;
}

export async function getProductIdsForCollection(collectionId: string): Promise<string[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("collection_products")
    .select("product_id")
    .eq("collection_id", collectionId);

  if (error) {
    throw new Error(`getProductIdsForCollection: ${error.message}`);
  }

  return data.map((row) => row.product_id);
}

export async function getFaqIdsForCollection(collectionId: string): Promise<string[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("collection_faqs")
    .select("faq_id")
    .eq("collection_id", collectionId);

  if (error) {
    throw new Error(`getFaqIdsForCollection: ${error.message}`);
  }

  return data.map((row) => row.faq_id);
}
