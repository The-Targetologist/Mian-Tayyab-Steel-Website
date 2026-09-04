import "server-only";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { Location, LocationType } from "@/types/content";

export interface LocationRow {
  id: string;
  name: string;
  location_type: LocationType;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  province: string | null;
  postal_code: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  map_url: string | null;
  map_embed_url: string | null;
  is_primary: boolean;
  sort_order: number;
  status: "draft" | "published" | "archived";
}

export function mapLocation(row: LocationRow): Location {
  return {
    id: row.id,
    name: row.name,
    locationType: row.location_type,
    addressLine1: row.address_line_1,
    addressLine2: row.address_line_2,
    city: row.city,
    province: row.province,
    postalCode: row.postal_code,
    country: row.country,
    phone: row.phone,
    email: row.email,
    mapUrl: row.map_url,
    mapEmbedUrl: row.map_embed_url,
    isPrimary: row.is_primary,
    sortOrder: row.sort_order,
    status: row.status,
  };
}

export async function getPublishedLocations(): Promise<Location[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`getPublishedLocations: ${error.message}`);
  }

  return (data as LocationRow[]).map(mapLocation);
}
