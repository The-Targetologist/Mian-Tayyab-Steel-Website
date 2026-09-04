import "server-only";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { MediaAsset, Partner } from "@/types/content";

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

export interface PartnerRow {
  id: string;
  name: string;
  description: string | null;
  website_url: string | null;
  relationship_label: string | null;
  status: "draft" | "published" | "archived";
  sort_order: number;
  logo: MediaAssetRow | null;
}

export const PARTNER_SELECT = `
  *,
  logo:media_assets!logo_media_id(*)
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

export function mapPartner(row: PartnerRow): Partner {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    logo: mapMediaAsset(row.logo),
    websiteUrl: row.website_url,
    relationshipLabel: row.relationship_label,
    status: row.status,
    sortOrder: row.sort_order,
  };
}

// No public page renders partners yet — the wireframe's H07 "distributor/
// certification proof" homepage section is deliberately deferred until real
// partner data exists (docs/PROJECT_STATE.md Phase 3: "do not fabricate
// equivalent certification badges"). This function exists so that decision
// is ready to consume the moment real data and a build-it decision both
// exist, same as getPublishedLocations() existed before Phase 10's admin UI.
export async function getPublishedPartners(): Promise<Partner[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("partners")
    .select(PARTNER_SELECT)
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`getPublishedPartners: ${error.message}`);
  }

  return (data as unknown as PartnerRow[]).map(mapPartner);
}
