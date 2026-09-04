import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CERTIFICATION_SELECT, mapCertification, type CertificationRow } from "@/lib/queries/certifications";
import type { Certification } from "@/types/content";

// Admin-facing certification queries — all statuses, not just published.
// Uses the privileged client since RLS only exposes published rows.
export async function getAdminCertifications(): Promise<Certification[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("certifications")
    .select(CERTIFICATION_SELECT)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`getAdminCertifications: ${error.message}`);
  }

  return (data as unknown as CertificationRow[]).map(mapCertification);
}

export async function getAdminCertificationById(id: string): Promise<Certification | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("certifications")
    .select(CERTIFICATION_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`getAdminCertificationById: ${error.message}`);
  }

  return data ? mapCertification(data as unknown as CertificationRow) : null;
}
