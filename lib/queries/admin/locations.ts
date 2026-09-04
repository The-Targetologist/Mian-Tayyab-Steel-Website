import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { mapLocation, type LocationRow } from "@/lib/queries/locations";
import type { Location } from "@/types/content";

// Admin-facing location queries — all statuses, not just published. Uses
// the privileged client since RLS only exposes published rows. Same pattern
// as every other lib/queries/admin/*.ts file.
export async function getAdminLocations(): Promise<Location[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`getAdminLocations: ${error.message}`);
  }

  return (data as LocationRow[]).map(mapLocation);
}

export async function getAdminLocationById(id: string): Promise<Location | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("locations").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw new Error(`getAdminLocationById: ${error.message}`);
  }

  return data ? mapLocation(data as LocationRow) : null;
}
