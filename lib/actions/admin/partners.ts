"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentAdminUser } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { partnerFormSchema, type PartnerFormState } from "@/lib/validation/admin/partner";

function parsePartnerFormData(formData: FormData) {
  return {
    name: formData.get("name")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
    websiteUrl: formData.get("websiteUrl")?.toString() ?? "",
    relationshipLabel: formData.get("relationshipLabel")?.toString() ?? "",
    status: formData.get("status")?.toString() ?? "draft",
    sortOrder: formData.get("sortOrder")?.toString() ?? "0",
    logoMediaId: formData.get("logoMediaId")?.toString() ?? "",
  };
}

export async function createPartner(
  _prevState: PartnerFormState,
  formData: FormData,
): Promise<PartnerFormState> {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = partnerFormSchema.safeParse(parsePartnerFormData(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the form for errors.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("partners").insert({
    name: input.name,
    description: input.description || null,
    website_url: input.websiteUrl || null,
    relationship_label: input.relationshipLabel || null,
    status: input.status,
    sort_order: input.sortOrder,
    logo_media_id: input.logoMediaId || null,
  });

  if (error) {
    return { status: "error", message: "Something went wrong creating the partner." };
  }

  // No public page consumes partners yet (H07's homepage section is
  // deferred until real partner data exists — see lib/queries/partners.ts).
  revalidatePath("/admin/partners");
  redirect("/admin/partners");
}

export async function updatePartner(
  partnerId: string,
  _prevState: PartnerFormState,
  formData: FormData,
): Promise<PartnerFormState> {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = partnerFormSchema.safeParse(parsePartnerFormData(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the form for errors.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("partners")
    .update({
      name: input.name,
      description: input.description || null,
      website_url: input.websiteUrl || null,
      relationship_label: input.relationshipLabel || null,
      status: input.status,
      sort_order: input.sortOrder,
      logo_media_id: input.logoMediaId || null,
    })
    .eq("id", partnerId);

  if (error) {
    return { status: "error", message: "Something went wrong updating the partner." };
  }

  revalidatePath("/admin/partners");
  redirect("/admin/partners");
}

export async function deletePartner(partnerId: string): Promise<void> {
  const admin = await getCurrentAdminUser();
  if (!admin) return;

  const supabase = createSupabaseAdminClient();
  await supabase.from("partners").delete().eq("id", partnerId);

  revalidatePath("/admin/partners");
}
