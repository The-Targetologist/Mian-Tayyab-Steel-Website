import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface AdminDashboardStats {
  newQuoteRequests: number;
  draftProducts: number;
  draftCollections: number;
  draftServices: number;
  draftPosts: number;
  publishedProducts: number;
  publishedCollections: number;
  publishedServices: number;
  publishedPosts: number;
}

// Uses the privileged client — draft/all-status content is not visible
// through the public-facing RLS-scoped client. Only ever called from within
// the (protected) admin layout's auth gate (docs/10-admin-panel.md
// "Do not fill dashboard with decorative charts if no meaningful data
// exists" — counts only, no fabricated metrics). Published counts sit
// alongside draft counts so the dashboard shows how much content is
// actually live, not just what's waiting on attention.
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = createSupabaseAdminClient();

  const [
    newQuoteRequests,
    draftProducts,
    draftCollections,
    draftServices,
    draftPosts,
    publishedProducts,
    publishedCollections,
    publishedServices,
    publishedPosts,
  ] = await Promise.all([
    supabase.from("quote_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("collections").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("services").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("collections").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("services").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", "published"),
  ]);

  return {
    newQuoteRequests: newQuoteRequests.count ?? 0,
    draftProducts: draftProducts.count ?? 0,
    draftCollections: draftCollections.count ?? 0,
    draftServices: draftServices.count ?? 0,
    draftPosts: draftPosts.count ?? 0,
    publishedProducts: publishedProducts.count ?? 0,
    publishedCollections: publishedCollections.count ?? 0,
    publishedServices: publishedServices.count ?? 0,
    publishedPosts: publishedPosts.count ?? 0,
  };
}
