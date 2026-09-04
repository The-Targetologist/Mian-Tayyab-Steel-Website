import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { CollectionBlock, MediaAsset } from "@/types/content";

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
  created_at: string;
}

function mapMediaAsset(row: MediaAssetRow): MediaAsset {
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

export interface AdminMediaAsset extends MediaAsset {
  createdAt: string;
  usage: string[];
}

// Every place a media_assets row can be referenced from — 13 foreign-key
// columns across 9 tables, plus Collections' `image_text` content blocks,
// which embed a full MediaAsset object directly in JSONB rather than a
// foreign key (docs/PROJECT_STATE.md's Collections increment notes: "no
// resolution/join step" for content_blocks). Computed once and shared by
// both the library listing (usage indicators) and the safe-delete check
// (docs/10-admin-panel.md "remove unused asset safely") so the two can never
// disagree about what counts as "in use."
async function computeUsageMap(): Promise<Map<string, string[]>> {
  const supabase = createSupabaseAdminClient();

  const [
    { data: products },
    { data: productMedia },
    { data: collections },
    { data: services },
    { data: serviceMedia },
    { data: posts },
    { data: partners },
    { data: certifications },
    { data: settings },
  ] = await Promise.all([
    supabase.from("products").select("name, featured_image_id, og_image_id"),
    supabase.from("product_media").select("media_id"),
    supabase.from("collections").select("name, hero_image_id, brochure_media_id, og_image_id, content_blocks"),
    supabase.from("services").select("name, featured_image_id, og_image_id"),
    supabase.from("service_media").select("media_id"),
    supabase.from("posts").select("title, featured_image_id, og_image_id"),
    supabase.from("partners").select("name, logo_media_id"),
    supabase.from("certifications").select("name, media_id"),
    supabase.from("site_settings").select("default_og_image_id, brochure_media_id").eq("id", 1).maybeSingle(),
  ]);

  const usage = new Map<string, string[]>();
  function addUsage(mediaId: string | null | undefined, label: string) {
    if (!mediaId) return;
    const list = usage.get(mediaId) ?? [];
    list.push(label);
    usage.set(mediaId, list);
  }

  for (const p of products ?? []) {
    addUsage(p.featured_image_id, `Product "${p.name}" (featured image)`);
    addUsage(p.og_image_id, `Product "${p.name}" (OG image)`);
  }
  for (const row of productMedia ?? []) {
    addUsage(row.media_id, "a product gallery");
  }
  for (const c of collections ?? []) {
    addUsage(c.hero_image_id, `Collection "${c.name}" (hero image)`);
    addUsage(c.brochure_media_id, `Collection "${c.name}" (brochure)`);
    addUsage(c.og_image_id, `Collection "${c.name}" (OG image)`);
    const blocks: unknown[] = Array.isArray(c.content_blocks) ? c.content_blocks : [];
    for (const raw of blocks) {
      if (raw && typeof raw === "object" && "type" in raw && (raw as { type: unknown }).type === "image_text") {
        const block = raw as Extract<CollectionBlock, { type: "image_text" }>;
        if (block.image?.id) {
          addUsage(block.image.id, `Collection "${c.name}" (content block)`);
        }
      }
    }
  }
  for (const s of services ?? []) {
    addUsage(s.featured_image_id, `Service "${s.name}" (featured image)`);
    addUsage(s.og_image_id, `Service "${s.name}" (OG image)`);
  }
  for (const row of serviceMedia ?? []) {
    addUsage(row.media_id, "a service gallery");
  }
  for (const post of posts ?? []) {
    addUsage(post.featured_image_id, `Post "${post.title}" (featured image)`);
    addUsage(post.og_image_id, `Post "${post.title}" (OG image)`);
  }
  for (const partner of partners ?? []) {
    addUsage(partner.logo_media_id, `Partner "${partner.name}" (logo)`);
  }
  for (const cert of certifications ?? []) {
    addUsage(cert.media_id, `Certification "${cert.name}" (badge image)`);
  }
  if (settings) {
    addUsage(settings.default_og_image_id, "Site Settings (default social image)");
    addUsage(settings.brochure_media_id, "Site Settings (brochure)");
  }

  return usage;
}

export async function getAdminMediaAssets(): Promise<AdminMediaAsset[]> {
  const supabase = createSupabaseAdminClient();
  const [{ data: assets, error }, usage] = await Promise.all([
    supabase.from("media_assets").select("*").order("created_at", { ascending: false }),
    computeUsageMap(),
  ]);

  if (error) {
    throw new Error(`getAdminMediaAssets: ${error.message}`);
  }

  return (assets as MediaAssetRow[]).map((row) => ({
    ...mapMediaAsset(row),
    createdAt: row.created_at,
    usage: usage.get(row.id) ?? [],
  }));
}

export async function getMediaAssetUsage(mediaId: string): Promise<string[]> {
  const usage = await computeUsageMap();
  return usage.get(mediaId) ?? [];
}
