import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PRODUCT_SELECT, mapProduct, type ProductRow } from "@/lib/queries/products";
import type { Product } from "@/types/content";

// Admin-facing product queries — all statuses, not just published. Uses the
// privileged client since RLS only exposes published rows. Only ever called
// from within app/admin/(protected)/*, which is already gated by
// lib/auth/admin.ts before these run.
export async function getAdminProducts(): Promise<Product[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`getAdminProducts: ${error.message}`);
  }

  return (data as unknown as ProductRow[]).map(mapProduct);
}

export async function getAdminProductById(id: string): Promise<Product | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`getAdminProductById: ${error.message}`);
  }

  return data ? mapProduct(data as unknown as ProductRow) : null;
}

export interface CollectionOption {
  id: string;
  name: string;
}

export async function getAllCollectionOptions(): Promise<CollectionOption[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("collections")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`getAllCollectionOptions: ${error.message}`);
  }

  return data;
}

export interface ProductOption {
  id: string;
  name: string;
}

// Admin editing needs to see relation links regardless of either side's
// status — getRelatedProducts() in lib/queries/products.ts only returns
// published relations via RLS, which would hide a draft link from the admin
// editing it.
export async function getRelatedProductIds(productId: string): Promise<string[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("related_products")
    .select("related_product_id")
    .eq("product_id", productId);

  if (error) {
    throw new Error(`getRelatedProductIds: ${error.message}`);
  }

  return data.map((row) => row.related_product_id);
}

export async function getCollectionIdsForProduct(productId: string): Promise<string[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("collection_products")
    .select("collection_id")
    .eq("product_id", productId);

  if (error) {
    throw new Error(`getCollectionIdsForProduct: ${error.message}`);
  }

  return data.map((row) => row.collection_id);
}

export async function getAllProductOptions(excludeId?: string): Promise<ProductOption[]> {
  const supabase = createSupabaseAdminClient();
  let query = supabase.from("products").select("id, name").order("name", { ascending: true });

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`getAllProductOptions: ${error.message}`);
  }

  return data;
}
