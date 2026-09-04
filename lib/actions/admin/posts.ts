"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentAdminUser } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { postFormSchema, type PostFormState } from "@/lib/validation/admin/post";

function parsePostFormData(formData: FormData) {
  return {
    title: formData.get("title")?.toString() ?? "",
    slug: formData.get("slug")?.toString() ?? "",
    excerpt: formData.get("excerpt")?.toString() ?? "",
    body: formData.get("body")?.toString() ?? "",
    authorName: formData.get("authorName")?.toString() ?? "",
    status: formData.get("status")?.toString() ?? "draft",
    seoTitle: formData.get("seoTitle")?.toString() ?? "",
    seoDescription: formData.get("seoDescription")?.toString() ?? "",
    canonicalUrl: formData.get("canonicalUrl")?.toString() ?? "",
    relatedPostIds: formData.getAll("relatedPostIds").map(String),
    featuredImageId: formData.get("featuredImageId")?.toString() ?? "",
  };
}

function revalidatePostPaths(slug: string, previousSlug?: string) {
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/blog/${previousSlug}`);
  }
}

async function writePostRelations(
  postId: string,
  input: { relatedPostIds: string[] },
) {
  const supabase = createSupabaseAdminClient();

  // Delete-then-reinsert — same simplest-correct sync as every other
  // repeater/relation field in this project.
  await supabase.from("related_posts").delete().eq("post_id", postId);

  if (input.relatedPostIds.length > 0) {
    await supabase.from("related_posts").insert(
      input.relatedPostIds.map((relatedPostId, index) => ({
        post_id: postId,
        related_post_id: relatedPostId,
        sort_order: index,
      })),
    );
  }
}

export async function createPost(
  _prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = postFormSchema.safeParse(parsePostFormData(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the form for errors.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;
  const supabase = createSupabaseAdminClient();

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt || null,
      body: input.body,
      author_name: input.authorName || null,
      status: input.status,
      seo_title: input.seoTitle || null,
      seo_description: input.seoDescription || null,
      canonical_url: input.canonicalUrl || null,
      featured_image_id: input.featuredImageId || null,
      published_at: input.status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error || !post) {
    if (error?.code === "23505") {
      return {
        status: "error",
        message: "That slug is already in use by another post.",
        fieldErrors: { slug: ["Slug must be unique"] },
      };
    }
    return { status: "error", message: "Something went wrong creating the post." };
  }

  await writePostRelations(post.id, input);
  revalidatePostPaths(input.slug);
  redirect("/admin/posts");
}

export async function updatePost(
  postId: string,
  _prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = postFormSchema.safeParse(parsePostFormData(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the form for errors.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;
  const supabase = createSupabaseAdminClient();

  const { data: existing } = await supabase
    .from("posts")
    .select("slug, status, published_at")
    .eq("id", postId)
    .maybeSingle();

  const becomingPublished = input.status === "published" && existing?.status !== "published";

  const { error } = await supabase
    .from("posts")
    .update({
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt || null,
      body: input.body,
      author_name: input.authorName || null,
      status: input.status,
      seo_title: input.seoTitle || null,
      seo_description: input.seoDescription || null,
      canonical_url: input.canonicalUrl || null,
      featured_image_id: input.featuredImageId || null,
      published_at: becomingPublished
        ? new Date().toISOString()
        : (existing?.published_at ?? null),
    })
    .eq("id", postId);

  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        message: "That slug is already in use by another post.",
        fieldErrors: { slug: ["Slug must be unique"] },
      };
    }
    return { status: "error", message: "Something went wrong updating the post." };
  }

  await writePostRelations(postId, input);
  revalidatePostPaths(input.slug, existing?.slug);
  redirect("/admin/posts");
}

export async function deletePost(postId: string): Promise<void> {
  const admin = await getCurrentAdminUser();
  if (!admin) return;

  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase
    .from("posts")
    .select("slug")
    .eq("id", postId)
    .maybeSingle();

  await supabase.from("posts").delete().eq("id", postId);

  if (existing) {
    revalidatePostPaths(existing.slug);
  }
  revalidatePath("/admin/posts");
}
