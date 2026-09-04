"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdminUser } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { siteSettingsFormSchema, type SiteSettingsFormState } from "@/lib/validation/admin/settings";

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

function parseSettingsFormData(formData: FormData) {
  return {
    companyLegalName: formData.get("companyLegalName")?.toString() ?? "",
    primaryPhone: formData.get("primaryPhone")?.toString() ?? "",
    whatsapp: formData.get("whatsapp")?.toString() ?? "",
    primaryEmail: formData.get("primaryEmail")?.toString() ?? "",
    socialLinks: parseJsonArray(formData, "socialLinks"),
    defaultSeoTitle: formData.get("defaultSeoTitle")?.toString() ?? "",
    defaultSeoDescription: formData.get("defaultSeoDescription")?.toString() ?? "",
    defaultOgImageId: formData.get("defaultOgImageId")?.toString() ?? "",
    footerDescription: formData.get("footerDescription")?.toString() ?? "",
    brochureMediaId: formData.get("brochureMediaId")?.toString() ?? "",
  };
}

// Singleton row (id=1) — update only, no create/delete. Stays on the same
// page after saving (no list to redirect back to), so the form state itself
// carries a "success" status to show a confirmation message.
export async function updateSiteSettings(
  _prevState: SiteSettingsFormState,
  formData: FormData,
): Promise<SiteSettingsFormState> {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = siteSettingsFormSchema.safeParse(parseSettingsFormData(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the form for errors.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;
  const socialUrls = Object.fromEntries(
    input.socialLinks
      .filter((link) => link.platform && link.url)
      .map((link) => [link.platform, link.url]),
  );

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      company_legal_name: input.companyLegalName || null,
      primary_phone: input.primaryPhone || null,
      whatsapp: input.whatsapp || null,
      primary_email: input.primaryEmail || null,
      social_urls: socialUrls,
      default_seo_title: input.defaultSeoTitle || null,
      default_seo_description: input.defaultSeoDescription || null,
      default_og_image_id: input.defaultOgImageId || null,
      footer_description: input.footerDescription || null,
      brochure_media_id: input.brochureMediaId || null,
    })
    .eq("id", 1);

  if (error) {
    return { status: "error", message: "Something went wrong saving settings." };
  }

  // The footer (and, once wired, default SEO metadata) renders from this
  // data on every public page under app/(site)/layout.tsx — revalidate the
  // whole site rather than tracking individual pages.
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { status: "success", message: "Settings saved." };
}
