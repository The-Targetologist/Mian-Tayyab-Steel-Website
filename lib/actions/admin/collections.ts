"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentAdminUser } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { collectionFormSchema, type CollectionFormState } from "@/lib/validation/admin/collection";

function parseJsonArray(formData: FormData, key: string): unknown[] {
  const raw = formData.get(key)?.toString();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseCollectionFormData(formData: FormData) {
  return {
    name: formData.get("name")?.toString() ?? "",
    slug: formData.get("slug")?.toString() ?? "",
    kicker: formData.get("kicker")?.toString() ?? "",
    h1: formData.get("h1")?.toString() ?? "",
    shortDescription: formData.get("shortDescription")?.toString() ?? "",
    introRichtext: formData.get("introRichtext")?.toString() ?? "",
    status: formData.get("status")?.toString() ?? "draft",
    sortOrder: formData.get("sortOrder")?.toString() ?? "0",
    seoTitle: formData.get("seoTitle")?.toString() ?? "",
    seoDescription: formData.get("seoDescription")?.toString() ?? "",
    canonicalUrl: formData.get("canonicalUrl")?.toString() ?? "",
    heroImageId: formData.get("heroImageId")?.toString() ?? "",
    brochureMediaId: formData.get("brochureMediaId")?.toString() ?? "",
    contentBlocks: parseJsonArray(formData, "contentBlocks"),
    productIds: formData.getAll("productIds").map(String),
    faqIds: formData.getAll("faqIds").map(String),
  };
}

function revalidateCollectionPaths(slug: string, previousSlug?: string) {
  revalidatePath("/collections");
  revalidatePath(`/collections/${slug}`);
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/collections/${previousSlug}`);
  }
  revalidatePath("/");
}

async function writeCollectionRelations(
  collectionId: string,
  input: { productIds: string[]; faqIds: string[] },
) {
  const supabase = createSupabaseAdminClient();

  await Promise.all([
    supabase.from("collection_products").delete().eq("collection_id", collectionId),
    supabase.from("collection_faqs").delete().eq("collection_id", collectionId),
  ]);

  const inserts: PromiseLike<unknown>[] = [];

  if (input.productIds.length > 0) {
    inserts.push(
      supabase.from("collection_products").insert(
        input.productIds.map((productId, index) => ({
          collection_id: collectionId,
          product_id: productId,
          sort_order: index,
        })),
      ),
    );
  }

  if (input.faqIds.length > 0) {
    inserts.push(
      supabase.from("collection_faqs").insert(
        input.faqIds.map((faqId, index) => ({
          collection_id: collectionId,
          faq_id: faqId,
          sort_order: index,
        })),
      ),
    );
  }

  await Promise.all(inserts);
}

export async function createCollection(
  _prevState: CollectionFormState,
  formData: FormData,
): Promise<CollectionFormState> {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = collectionFormSchema.safeParse(parseCollectionFormData(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the form for errors.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;
  const supabase = createSupabaseAdminClient();

  const { data: collection, error } = await supabase
    .from("collections")
    .insert({
      name: input.name,
      slug: input.slug,
      kicker: input.kicker || null,
      h1: input.h1,
      short_description: input.shortDescription || null,
      intro_richtext: input.introRichtext || null,
      content_blocks: input.contentBlocks,
      hero_image_id: input.heroImageId || null,
      brochure_media_id: input.brochureMediaId || null,
      status: input.status,
      sort_order: input.sortOrder,
      seo_title: input.seoTitle || null,
      seo_description: input.seoDescription || null,
      canonical_url: input.canonicalUrl || null,
      published_at: input.status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error || !collection) {
    if (error?.code === "23505") {
      return {
        status: "error",
        message: "That slug is already in use by another collection.",
        fieldErrors: { slug: ["Slug must be unique"] },
      };
    }
    return { status: "error", message: "Something went wrong creating the collection." };
  }

  await writeCollectionRelations(collection.id, input);
  revalidateCollectionPaths(input.slug);
  redirect("/admin/collections");
}

export async function updateCollection(
  collectionId: string,
  _prevState: CollectionFormState,
  formData: FormData,
): Promise<CollectionFormState> {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = collectionFormSchema.safeParse(parseCollectionFormData(formData));

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
    .from("collections")
    .select("slug, status, published_at")
    .eq("id", collectionId)
    .maybeSingle();

  const becomingPublished = input.status === "published" && existing?.status !== "published";

  const { error } = await supabase
    .from("collections")
    .update({
      name: input.name,
      slug: input.slug,
      kicker: input.kicker || null,
      h1: input.h1,
      short_description: input.shortDescription || null,
      intro_richtext: input.introRichtext || null,
      content_blocks: input.contentBlocks,
      hero_image_id: input.heroImageId || null,
      brochure_media_id: input.brochureMediaId || null,
      status: input.status,
      sort_order: input.sortOrder,
      seo_title: input.seoTitle || null,
      seo_description: input.seoDescription || null,
      canonical_url: input.canonicalUrl || null,
      published_at: becomingPublished
        ? new Date().toISOString()
        : (existing?.published_at ?? null),
    })
    .eq("id", collectionId);

  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        message: "That slug is already in use by another collection.",
        fieldErrors: { slug: ["Slug must be unique"] },
      };
    }
    return { status: "error", message: "Something went wrong updating the collection." };
  }

  await writeCollectionRelations(collectionId, input);
  revalidateCollectionPaths(input.slug, existing?.slug);
  redirect("/admin/collections");
}

export async function deleteCollection(collectionId: string): Promise<void> {
  const admin = await getCurrentAdminUser();
  if (!admin) return;

  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase
    .from("collections")
    .select("slug")
    .eq("id", collectionId)
    .maybeSingle();

  await supabase.from("collections").delete().eq("id", collectionId);

  if (existing) {
    revalidateCollectionPaths(existing.slug);
  }
  revalidatePath("/admin/collections");
}
