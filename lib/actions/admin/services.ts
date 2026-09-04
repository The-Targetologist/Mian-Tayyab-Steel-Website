"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentAdminUser } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { serviceFormSchema, type ServiceFormState } from "@/lib/validation/admin/service";

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

function parseServiceFormData(formData: FormData) {
  return {
    name: formData.get("name")?.toString() ?? "",
    slug: formData.get("slug")?.toString() ?? "",
    shortDescription: formData.get("shortDescription")?.toString() ?? "",
    introRichtext: formData.get("introRichtext")?.toString() ?? "",
    bodyRichtext: formData.get("bodyRichtext")?.toString() ?? "",
    serviceArea: formData.get("serviceArea")?.toString() ?? "",
    status: formData.get("status")?.toString() ?? "draft",
    isFeatured: formData.get("isFeatured") === "on",
    sortOrder: formData.get("sortOrder")?.toString() ?? "0",
    seoTitle: formData.get("seoTitle")?.toString() ?? "",
    seoDescription: formData.get("seoDescription")?.toString() ?? "",
    canonicalUrl: formData.get("canonicalUrl")?.toString() ?? "",
    capabilities: parseJsonArray(formData, "capabilities"),
    requirements: parseJsonArray(formData, "requirements"),
    relatedProductIds: formData.getAll("relatedProductIds").map(String),
    featuredImageId: formData.get("featuredImageId")?.toString() ?? "",
    galleryMediaIds: formData.getAll("galleryMediaIds").map(String),
    faqIds: formData.getAll("faqIds").map(String),
  };
}

function revalidateServicePaths(slug: string, previousSlug?: string) {
  revalidatePath("/services");
  revalidatePath(`/services/${slug}`);
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/services/${previousSlug}`);
  }
  // A service's related products render a "Related services" section on the
  // product detail page — cheap to always revalidate rather than track which
  // specific product pages are affected.
  revalidatePath("/products");
  revalidatePath("/");
}

async function writeServiceRelations(
  serviceId: string,
  input: {
    capabilities: { label: string; value: string; unit?: string }[];
    requirements: { title: string; description?: string }[];
    relatedProductIds: string[];
    galleryMediaIds: string[];
    faqIds: string[];
  },
) {
  const supabase = createSupabaseAdminClient();

  // Delete-then-reinsert — same simplest-correct sync as products/collections
  // for repeater/relation data edited as a whole set in the form.
  await Promise.all([
    supabase.from("service_capabilities").delete().eq("service_id", serviceId),
    supabase.from("service_requirements").delete().eq("service_id", serviceId),
    supabase.from("product_services").delete().eq("service_id", serviceId),
    supabase.from("service_media").delete().eq("service_id", serviceId).eq("role", "gallery"),
    supabase.from("service_faqs").delete().eq("service_id", serviceId),
  ]);

  const inserts: PromiseLike<unknown>[] = [];

  if (input.capabilities.length > 0) {
    inserts.push(
      supabase.from("service_capabilities").insert(
        input.capabilities.map((capability, index) => ({
          service_id: serviceId,
          label: capability.label,
          value: capability.value,
          unit: capability.unit || null,
          sort_order: index,
        })),
      ),
    );
  }

  if (input.requirements.length > 0) {
    inserts.push(
      supabase.from("service_requirements").insert(
        input.requirements.map((requirement, index) => ({
          service_id: serviceId,
          title: requirement.title,
          description: requirement.description || null,
          sort_order: index,
        })),
      ),
    );
  }

  if (input.relatedProductIds.length > 0) {
    inserts.push(
      supabase.from("product_services").insert(
        input.relatedProductIds.map((productId, index) => ({
          product_id: productId,
          service_id: serviceId,
          sort_order: index,
        })),
      ),
    );
  }

  if (input.galleryMediaIds.length > 0) {
    inserts.push(
      supabase.from("service_media").insert(
        input.galleryMediaIds.map((mediaId, index) => ({
          service_id: serviceId,
          media_id: mediaId,
          role: "gallery",
          sort_order: index,
        })),
      ),
    );
  }

  if (input.faqIds.length > 0) {
    inserts.push(
      supabase.from("service_faqs").insert(
        input.faqIds.map((faqId, index) => ({
          service_id: serviceId,
          faq_id: faqId,
          sort_order: index,
        })),
      ),
    );
  }

  await Promise.all(inserts);
}

export async function createService(
  _prevState: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = serviceFormSchema.safeParse(parseServiceFormData(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the form for errors.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;
  const supabase = createSupabaseAdminClient();

  const { data: service, error } = await supabase
    .from("services")
    .insert({
      name: input.name,
      slug: input.slug,
      short_description: input.shortDescription || null,
      intro_richtext: input.introRichtext || null,
      body_richtext: input.bodyRichtext || null,
      service_area: input.serviceArea || null,
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

  if (error || !service) {
    if (error?.code === "23505") {
      return {
        status: "error",
        message: "That slug is already in use by another service.",
        fieldErrors: { slug: ["Slug must be unique"] },
      };
    }
    return { status: "error", message: "Something went wrong creating the service." };
  }

  await writeServiceRelations(service.id, input);
  revalidateServicePaths(input.slug);
  redirect("/admin/services");
}

export async function updateService(
  serviceId: string,
  _prevState: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = serviceFormSchema.safeParse(parseServiceFormData(formData));

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
    .from("services")
    .select("slug, status, published_at")
    .eq("id", serviceId)
    .maybeSingle();

  const becomingPublished = input.status === "published" && existing?.status !== "published";

  const { error } = await supabase
    .from("services")
    .update({
      name: input.name,
      slug: input.slug,
      short_description: input.shortDescription || null,
      intro_richtext: input.introRichtext || null,
      body_richtext: input.bodyRichtext || null,
      service_area: input.serviceArea || null,
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
    .eq("id", serviceId);

  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        message: "That slug is already in use by another service.",
        fieldErrors: { slug: ["Slug must be unique"] },
      };
    }
    return { status: "error", message: "Something went wrong updating the service." };
  }

  await writeServiceRelations(serviceId, input);
  revalidateServicePaths(input.slug, existing?.slug);
  redirect("/admin/services");
}

export async function deleteService(serviceId: string): Promise<void> {
  const admin = await getCurrentAdminUser();
  if (!admin) return;

  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase
    .from("services")
    .select("slug")
    .eq("id", serviceId)
    .maybeSingle();

  await supabase.from("services").delete().eq("id", serviceId);

  if (existing) {
    revalidateServicePaths(existing.slug);
  }
  revalidatePath("/admin/services");
}
