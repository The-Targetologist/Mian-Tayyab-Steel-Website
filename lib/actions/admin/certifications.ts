"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentAdminUser } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { certificationFormSchema, type CertificationFormState } from "@/lib/validation/admin/certification";

function parseCertificationFormData(formData: FormData) {
  return {
    name: formData.get("name")?.toString() ?? "",
    issuer: formData.get("issuer")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
    certificateUrl: formData.get("certificateUrl")?.toString() ?? "",
    status: formData.get("status")?.toString() ?? "draft",
    sortOrder: formData.get("sortOrder")?.toString() ?? "0",
    mediaId: formData.get("mediaId")?.toString() ?? "",
  };
}

export async function createCertification(
  _prevState: CertificationFormState,
  formData: FormData,
): Promise<CertificationFormState> {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = certificationFormSchema.safeParse(parseCertificationFormData(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the form for errors.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("certifications").insert({
    name: input.name,
    issuer: input.issuer || null,
    description: input.description || null,
    certificate_url: input.certificateUrl || null,
    status: input.status,
    sort_order: input.sortOrder,
    media_id: input.mediaId || null,
  });

  if (error) {
    return { status: "error", message: "Something went wrong creating the certification." };
  }

  // No public page consumes certifications yet — same H07 deferral as
  // lib/actions/admin/partners.ts.
  revalidatePath("/admin/partners");
  redirect("/admin/partners");
}

export async function updateCertification(
  certificationId: string,
  _prevState: CertificationFormState,
  formData: FormData,
): Promise<CertificationFormState> {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = certificationFormSchema.safeParse(parseCertificationFormData(formData));

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
    .from("certifications")
    .update({
      name: input.name,
      issuer: input.issuer || null,
      description: input.description || null,
      certificate_url: input.certificateUrl || null,
      status: input.status,
      sort_order: input.sortOrder,
      media_id: input.mediaId || null,
    })
    .eq("id", certificationId);

  if (error) {
    return { status: "error", message: "Something went wrong updating the certification." };
  }

  revalidatePath("/admin/partners");
  redirect("/admin/partners");
}

export async function deleteCertification(certificationId: string): Promise<void> {
  const admin = await getCurrentAdminUser();
  if (!admin) return;

  const supabase = createSupabaseAdminClient();
  await supabase.from("certifications").delete().eq("id", certificationId);

  revalidatePath("/admin/partners");
}
