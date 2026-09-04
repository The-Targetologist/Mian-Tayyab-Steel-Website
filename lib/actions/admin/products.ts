"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentAdminUser } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { productFormSchema, type ProductFormState } from "@/lib/validation/admin/product";

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

function parseProductFormData(formData: FormData) {
  return {
    name: formData.get("name")?.toString() ?? "",
    slug: formData.get("slug")?.toString() ?? "",
    shortName: formData.get("shortName")?.toString() ?? "",
    shortDescription: formData.get("shortDescription")?.toString() ?? "",
    introRichtext: formData.get("introRichtext")?.toString() ?? "",
    origin: formData.get("origin")?.toString() ?? "",
    status: formData.get("status")?.toString() ?? "draft",
    isFeatured: formData.get("isFeatured") === "on",
    sortOrder: formData.get("sortOrder")?.toString() ?? "0",
    seoTitle: formData.get("seoTitle")?.toString() ?? "",
    seoDescription: formData.get("seoDescription")?.toString() ?? "",
    canonicalUrl: formData.get("canonicalUrl")?.toString() ?? "",
    specifications: parseJsonArray(formData, "specifications"),
    features: parseJsonArray(formData, "features"),
    applications: parseJsonArray(formData, "applications"),
    collectionIds: formData.getAll("collectionIds").map(String),
    relatedProductIds: formData.getAll("relatedProductIds").map(String),
    featuredImageId: formData.get("featuredImageId")?.toString() ?? "",
    galleryMediaIds: formData.getAll("galleryMediaIds").map(String),
    faqIds: formData.getAll("faqIds").map(String),
  };
}

function revalidateProductPaths(slug: string, previousSlug?: string) {
  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/products/${previousSlug}`);
  }
  // Featured-status changes can affect the homepage's product discovery
  // section — cheap to always revalidate rather than track precisely.
  revalidatePath("/");
}

async function writeProductRelations(
  productId: string,
  input: {
    specifications: { label: string; value: string; unit?: string }[];
    features: { title?: string; description: string }[];
    applications: { title: string; description?: string }[];
    collectionIds: string[];
    relatedProductIds: string[];
    galleryMediaIds: string[];
    faqIds: string[];
  },
) {
  const supabase = createSupabaseAdminClient();

  // Delete-then-reinsert — simplest correct sync for repeater/relation data
  // edited as a whole set in the form, not worth diffing individual rows.
  await Promise.all([
    supabase.from("product_specifications").delete().eq("product_id", productId),
    supabase.from("product_features").delete().eq("product_id", productId),
    supabase.from("product_applications").delete().eq("product_id", productId),
    supabase.from("collection_products").delete().eq("product_id", productId),
    supabase.from("related_products").delete().eq("product_id", productId),
    supabase.from("product_media").delete().eq("product_id", productId).eq("role", "gallery"),
    supabase.from("product_faqs").delete().eq("product_id", productId),
  ]);

  const inserts: PromiseLike<unknown>[] = [];

  if (input.specifications.length > 0) {
    inserts.push(
      supabase.from("product_specifications").insert(
        input.specifications.map((spec, index) => ({
          product_id: productId,
          label: spec.label,
          value: spec.value,
          unit: spec.unit || null,
          sort_order: index,
        })),
      ),
    );
  }

  if (input.features.length > 0) {
    inserts.push(
      supabase.from("product_features").insert(
        input.features.map((feature, index) => ({
          product_id: productId,
          title: feature.title || null,
          description: feature.description,
          sort_order: index,
        })),
      ),
    );
  }

  if (input.applications.length > 0) {
    inserts.push(
      supabase.from("product_applications").insert(
        input.applications.map((app, index) => ({
          product_id: productId,
          title: app.title,
          description: app.description || null,
          sort_order: index,
        })),
      ),
    );
  }

  if (input.collectionIds.length > 0) {
    inserts.push(
      supabase.from("collection_products").insert(
        input.collectionIds.map((collectionId, index) => ({
          collection_id: collectionId,
          product_id: productId,
          sort_order: index,
        })),
      ),
    );
  }

  if (input.relatedProductIds.length > 0) {
    inserts.push(
      supabase.from("related_products").insert(
        input.relatedProductIds.map((relatedProductId, index) => ({
          product_id: productId,
          related_product_id: relatedProductId,
          sort_order: index,
        })),
      ),
    );
  }

  if (input.galleryMediaIds.length > 0) {
    inserts.push(
      supabase.from("product_media").insert(
        input.galleryMediaIds.map((mediaId, index) => ({
          product_id: productId,
          media_id: mediaId,
          role: "gallery",
          sort_order: index,
        })),
      ),
    );
  }

  if (input.faqIds.length > 0) {
    inserts.push(
      supabase.from("product_faqs").insert(
        input.faqIds.map((faqId, index) => ({
          product_id: productId,
          faq_id: faqId,
          sort_order: index,
        })),
      ),
    );
  }

  await Promise.all(inserts);
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = productFormSchema.safeParse(parseProductFormData(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the form for errors.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;
  const supabase = createSupabaseAdminClient();

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name: input.name,
      slug: input.slug,
      short_name: input.shortName || null,
      short_description: input.shortDescription || null,
      intro_richtext: input.introRichtext || null,
      origin: input.origin || null,
      status: input.status,
      is_featured: input.isFeatured,
      sort_order: input.sortOrder,
      seo_title: input.seoTitle || null,
      seo_description: input.seoDescription || null,
      canonical_url: input.canonicalUrl || null,
      featured_image_id: input.featuredImageId || null,
      published_at: input.status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error || !product) {
    if (error?.code === "23505") {
      return {
        status: "error",
        message: "That slug is already in use by another product.",
        fieldErrors: { slug: ["Slug must be unique"] },
      };
    }
    return { status: "error", message: "Something went wrong creating the product." };
  }

  await writeProductRelations(product.id, input);
  revalidateProductPaths(input.slug);
  redirect("/admin/products");
}

export async function updateProduct(
  productId: string,
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = productFormSchema.safeParse(parseProductFormData(formData));

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
    .from("products")
    .select("slug, status, published_at")
    .eq("id", productId)
    .maybeSingle();

  const becomingPublished = input.status === "published" && existing?.status !== "published";

  const { error } = await supabase
    .from("products")
    .update({
      name: input.name,
      slug: input.slug,
      short_name: input.shortName || null,
      short_description: input.shortDescription || null,
      intro_richtext: input.introRichtext || null,
      origin: input.origin || null,
      status: input.status,
      is_featured: input.isFeatured,
      sort_order: input.sortOrder,
      seo_title: input.seoTitle || null,
      seo_description: input.seoDescription || null,
      canonical_url: input.canonicalUrl || null,
      featured_image_id: input.featuredImageId || null,
      published_at: becomingPublished
        ? new Date().toISOString()
        : (existing?.published_at ?? null),
    })
    .eq("id", productId);

  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        message: "That slug is already in use by another product.",
        fieldErrors: { slug: ["Slug must be unique"] },
      };
    }
    return { status: "error", message: "Something went wrong updating the product." };
  }

  await writeProductRelations(productId, input);
  revalidateProductPaths(input.slug, existing?.slug);
  redirect("/admin/products");
}

export async function deleteProduct(productId: string): Promise<void> {
  const admin = await getCurrentAdminUser();
  if (!admin) return;

  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase
    .from("products")
    .select("slug")
    .eq("id", productId)
    .maybeSingle();

  await supabase.from("products").delete().eq("id", productId);

  if (existing) {
    revalidateProductPaths(existing.slug);
  }
  revalidatePath("/admin/products");
}
