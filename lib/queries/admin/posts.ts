import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { POST_SELECT, mapPost, type PostRow } from "@/lib/queries/posts";
import type { Post } from "@/types/content";

// Admin-facing post queries — all statuses, not just published. Uses the
// privileged client since RLS only exposes published rows. Same pattern as
// lib/queries/admin/products.ts, /collections.ts, /services.ts.
export async function getAdminPosts(): Promise<Post[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`getAdminPosts: ${error.message}`);
  }

  return (data as unknown as PostRow[]).map(mapPost);
}

export async function getAdminPostById(id: string): Promise<Post | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`getAdminPostById: ${error.message}`);
  }

  return data ? mapPost(data as unknown as PostRow) : null;
}

// Shaped as {id, name} (not {id, title}) so this reuses RelationCheckboxList
// as-is, the same generic component every other relationship picker uses.
export interface PostOption {
  id: string;
  name: string;
}

export async function getAllPostOptions(excludeId?: string): Promise<PostOption[]> {
  const supabase = createSupabaseAdminClient();
  let query = supabase.from("posts").select("id, title").order("title", { ascending: true });

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`getAllPostOptions: ${error.message}`);
  }

  return data.map((row) => ({ id: row.id, name: row.title }));
}

// Admin editing needs to see relation links regardless of either side's
// status — getRelatedPosts() in lib/queries/posts.ts only returns published
// relations via RLS, which would hide a draft link from the admin editing it.
export async function getRelatedPostIds(postId: string): Promise<string[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("related_posts")
    .select("related_post_id")
    .eq("post_id", postId);

  if (error) {
    throw new Error(`getRelatedPostIds: ${error.message}`);
  }

  return data.map((row) => row.related_post_id);
}
