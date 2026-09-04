import "server-only";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { Certification, MediaAsset } from "@/types/content";

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

export interface CertificationRow {
  id: string;
  name: string;
  issuer: string | null;
  description: string | null;
  certificate_url: string | null;
  status: "draft" | "published" | "archived";
  sort_order: number;
  media: MediaAssetRow | null;
}

export const CERTIFICATION_SELECT = `
  *,
  media:media_assets!media_id(*)
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

export function mapCertification(row: CertificationRow): Certification {
  return {
    id: row.id,
    name: row.name,
    issuer: row.issuer,
    description: row.description,
    media: mapMediaAsset(row.media),
    certificateUrl: row.certificate_url,
    status: row.status,
    sortOrder: row.sort_order,
  };
}

// No public page renders certifications yet — same H07 deferral as
// lib/queries/partners.ts (real certification data doesn't exist yet).
export async function getPublishedCertifications(): Promise<Certification[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("certifications")
    .select(CERTIFICATION_SELECT)
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`getPublishedCertifications: ${error.message}`);
  }

  return (data as unknown as CertificationRow[]).map(mapCertification);
}
