import "server-only";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { MediaAsset, SiteSettings } from "@/types/content";

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

export interface SiteSettingsRow {
  id: number;
  company_legal_name: string | null;
  primary_phone: string | null;
  whatsapp: string | null;
  primary_email: string | null;
  social_urls: Record<string, string>;
  default_seo_title: string | null;
  default_seo_description: string | null;
  footer_description: string | null;
  brochure: MediaAssetRow | null;
  default_og_image: MediaAssetRow | null;
}

export const SITE_SETTINGS_SELECT = `
  *,
  brochure:media_assets!brochure_media_id(*),
  default_og_image:media_assets!default_og_image_id(*)
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

export function mapSiteSettings(row: SiteSettingsRow): SiteSettings {
  return {
    companyLegalName: row.company_legal_name,
    primaryPhone: row.primary_phone,
    whatsapp: row.whatsapp,
    primaryEmail: row.primary_email,
    socialUrls: row.social_urls ?? {},
    defaultSeoTitle: row.default_seo_title,
    defaultSeoDescription: row.default_seo_description,
    defaultOgImage: mapMediaAsset(row.default_og_image),
    footerDescription: row.footer_description,
    brochure: mapMediaAsset(row.brochure),
  };
}

// Singleton row (id=1), seeded by supabase/migrations/0010_site_settings.sql
// — always exists, so a plain .single() is safe here (no null-row branch
// needed anywhere that calls this).
export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select(SITE_SETTINGS_SELECT)
    .eq("id", 1)
    .single();

  if (error) {
    throw new Error(`getSiteSettings: ${error.message}`);
  }

  return mapSiteSettings(data as unknown as SiteSettingsRow);
}
