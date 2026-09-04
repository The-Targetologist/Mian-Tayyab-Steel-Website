import "server-only";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { PRODUCT_SELECT, mapProduct, type ProductRow } from "./products";
import type {
  Faq,
  MediaAsset,
  Service,
  ServiceCapability,
  ServiceRequirement,
} from "@/types/content";

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

interface ServiceMediaRow {
  role: "gallery" | "featured" | "diagram" | "document";
  sort_order: number;
  media: MediaAssetRow;
}

interface ServiceCapabilityRow {
  id: string;
  service_id: string;
  label: string;
  value: string;
  unit: string | null;
  sort_order: number;
}

interface ServiceRequirementRow {
  id: string;
  service_id: string;
  title: string;
  description: string | null;
  sort_order: number;
}

interface FaqRow {
  id: string;
  question: string;
  answer_richtext: string;
  status: "draft" | "published" | "archived";
  sort_order: number;
}

interface ServiceFaqRow {
  sort_order: number;
  faq: FaqRow | null;
}

interface ProductServiceRow {
  sort_order: number;
  product: ProductRow | null;
}

export interface ServiceRow {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  intro_richtext: string | null;
  body_richtext: string | null;
  service_area: string | null;
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
  service_media: ServiceMediaRow[];
  service_capabilities: ServiceCapabilityRow[];
  service_requirements: ServiceRequirementRow[];
  service_faqs: ServiceFaqRow[];
  product_services: ProductServiceRow[];
}

export const SERVICE_SELECT = `
  *,
  featured_image:media_assets!featured_image_id(*),
  og_image:media_assets!og_image_id(*),
  service_media(role, sort_order, media:media_assets(*)),
  service_capabilities(*),
  service_requirements(*),
  service_faqs(sort_order, faq:faqs(*)),
  product_services(sort_order, product:products(${PRODUCT_SELECT}))
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

function mapCapability(row: ServiceCapabilityRow): ServiceCapability {
  return {
    id: row.id,
    serviceId: row.service_id,
    label: row.label,
    value: row.value,
    unit: row.unit,
    sortOrder: row.sort_order,
  };
}

function mapRequirement(row: ServiceRequirementRow): ServiceRequirement {
  return {
    id: row.id,
    serviceId: row.service_id,
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

function byRawSortOrder<T extends { sort_order: number }>(a: T, b: T) {
  return a.sort_order - b.sort_order;
}

function bySortOrder<T extends { sortOrder: number }>(a: T, b: T) {
  return a.sortOrder - b.sortOrder;
}

export function mapService(row: ServiceRow): Service {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    shortDescription: row.short_description,
    introRichtext: row.intro_richtext,
    bodyRichtext: row.body_richtext,
    featuredImage: mapMediaAsset(row.featured_image),
    gallery: (row.service_media ?? [])
      .filter((item) => item.role === "gallery")
      .sort(byRawSortOrder)
      .map((item) => mapMediaAsset(item.media))
      .filter((asset): asset is MediaAsset => asset !== null),
    serviceArea: row.service_area,
    status: row.status,
    sortOrder: row.sort_order,
    isFeatured: row.is_featured,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    canonicalUrl: row.canonical_url,
    ogImage: mapMediaAsset(row.og_image),
    capabilities: (row.service_capabilities ?? []).map(mapCapability).sort(bySortOrder),
    requirements: (row.service_requirements ?? []).map(mapRequirement).sort(bySortOrder),
    relatedProducts: (row.product_services ?? [])
      .filter((item): item is ProductServiceRow & { product: ProductRow } => item.product !== null)
      .sort(byRawSortOrder)
      .map((item) => mapProduct(item.product)),
    faqs: (row.service_faqs ?? [])
      .filter((item): item is ServiceFaqRow & { faq: FaqRow } => item.faq !== null)
      .sort(byRawSortOrder)
      .map((item) => mapFaq(item.faq)),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
  };
}

export async function getPublishedServices(): Promise<Service[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("services")
    .select(SERVICE_SELECT)
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`getPublishedServices: ${error.message}`);
  }

  return (data as unknown as ServiceRow[]).map(mapService);
}

// Queried from the services side (not embedded in PRODUCT_SELECT) to avoid
// a circular import with products.ts and to avoid over-fetching a full
// Service graph (capabilities/requirements/gallery/faqs) just to render a
// product's "Related services" card list.
export async function getRelatedServicesForProduct(productId: string): Promise<Service[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("product_services")
    .select(`sort_order, service:services(${SERVICE_SELECT})`)
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`getRelatedServicesForProduct: ${error.message}`);
  }

  return (data as unknown as { service: ServiceRow | null }[])
    .filter((row): row is { service: ServiceRow } => row.service !== null)
    .map((row) => mapService(row.service));
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("services")
    .select(SERVICE_SELECT)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`getServiceBySlug: ${error.message}`);
  }

  return data ? mapService(data as unknown as ServiceRow) : null;
}
