import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PARTNER_SELECT, mapPartner, type PartnerRow } from "@/lib/queries/partners";
import type { Partner } from "@/types/content";

// Admin-facing partner queries — all statuses, not just published. Uses the
// privileged client since RLS only exposes published rows.
export async function getAdminPartners(): Promise<Partner[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("partners")
    .select(PARTNER_SELECT)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`getAdminPartners: ${error.message}`);
  }

  return (data as unknown as PartnerRow[]).map(mapPartner);
}

export async function getAdminPartnerById(id: string): Promise<Partner | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("partners")
    .select(PARTNER_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`getAdminPartnerById: ${error.message}`);
  }

  return data ? mapPartner(data as unknown as PartnerRow) : null;
}
