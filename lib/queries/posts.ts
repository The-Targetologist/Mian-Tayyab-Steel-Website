import "server-only";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { MediaAsset, Post } from "@/types/content";

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

export interface PostRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  status: "draft" | "published" | "archived";
  author_name: string | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  featured_image: MediaAssetRow | null;
  og_image: MediaAssetRow | null;
}

export const POST_SELECT = `
  *,
  featured_image:media_assets!featured_image_id(*),
  og_image:media_assets!og_image_id(*)
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

export function mapPost(row: PostRow): Post {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    body: row.body,
    featuredImage: mapMediaAsset(row.featured_image),
    status: row.status,
    authorName: row.author_name,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    canonicalUrl: row.canonical_url,
    ogImage: mapMediaAsset(row.og_image),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
  };
}

export async function getPublishedPosts(): Promise<Post[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(`getPublishedPosts: ${error.message}`);
  }

  return (data as unknown as PostRow[]).map(mapPost);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`getPostBySlug: ${error.message}`);
  }

  return data ? mapPost(data as unknown as PostRow) : null;
}

export async function getRelatedPosts(postId: string, limit = 3): Promise<Post[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("related_posts")
    .select(`sort_order, post:posts!related_post_id(${POST_SELECT})`)
    .eq("post_id", postId)
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`getRelatedPosts: ${error.message}`);
  }

  return (data as unknown as { post: PostRow | null }[])
    .filter((row): row is { post: PostRow } => row.post !== null)
    .map((row) => mapPost(row.post));
}
