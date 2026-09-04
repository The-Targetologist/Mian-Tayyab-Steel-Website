import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { SERVICE_SELECT, mapService, type ServiceRow } from "@/lib/queries/services";
import type { Service } from "@/types/content";

// Admin-facing service queries — all statuses, not just published. Uses the
// privileged client since RLS only exposes published rows. Only ever called
// from within app/admin/(protected)/*, which is already gated by
// lib/auth/admin.ts before these run. Same pattern as
// lib/queries/admin/products.ts and lib/queries/admin/collections.ts.
export async function getAdminServices(): Promise<Service[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("services")
    .select(SERVICE_SELECT)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`getAdminServices: ${error.message}`);
  }

  return (data as unknown as ServiceRow[]).map(mapService);
}

export async function getAdminServiceById(id: string): Promise<Service | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("services")
    .select(SERVICE_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`getAdminServiceById: ${error.message}`);
  }

  return data ? mapService(data as unknown as ServiceRow) : null;
}

// Admin editing needs to see relation links regardless of either side's
// status — getRelatedServicesForProduct() only returns published relations
// via RLS, which would hide a draft link from the admin editing it.
export async function getProductIdsForService(serviceId: string): Promise<string[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("product_services")
    .select("product_id")
    .eq("service_id", serviceId);

  if (error) {
    throw new Error(`getProductIdsForService: ${error.message}`);
  }

  return data.map((row) => row.product_id);
}
