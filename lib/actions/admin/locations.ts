"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentAdminUser } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { locationFormSchema, type LocationFormState } from "@/lib/validation/admin/location";

function parseLocationFormData(formData: FormData) {
  return {
    name: formData.get("name")?.toString() ?? "",
    locationType: formData.get("locationType")?.toString() ?? "office",
    addressLine1: formData.get("addressLine1")?.toString() ?? "",
    addressLine2: formData.get("addressLine2")?.toString() ?? "",
    city: formData.get("city")?.toString() ?? "",
    province: formData.get("province")?.toString() ?? "",
    postalCode: formData.get("postalCode")?.toString() ?? "",
    country: formData.get("country")?.toString() ?? "Pakistan",
    phone: formData.get("phone")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    mapUrl: formData.get("mapUrl")?.toString() ?? "",
    mapEmbedUrl: formData.get("mapEmbedUrl")?.toString() ?? "",
    isPrimary: formData.get("isPrimary") === "on",
    sortOrder: formData.get("sortOrder")?.toString() ?? "0",
    status: formData.get("status")?.toString() ?? "draft",
  };
}

export async function createLocation(
  _prevState: LocationFormState,
  formData: FormData,
): Promise<LocationFormState> {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = locationFormSchema.safeParse(parseLocationFormData(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the form for errors.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("locations").insert({
    name: input.name,
    location_type: input.locationType,
    address_line_1: input.addressLine1,
    address_line_2: input.addressLine2 || null,
    city: input.city,
    province: input.province || null,
    postal_code: input.postalCode || null,
    country: input.country,
    phone: input.phone || null,
    email: input.email || null,
    map_url: input.mapUrl || null,
    map_embed_url: input.mapEmbedUrl || null,
    is_primary: input.isPrimary,
    sort_order: input.sortOrder,
    status: input.status,
  });

  if (error) {
    return { status: "error", message: "Something went wrong creating the location." };
  }

  revalidatePath("/contact");
  redirect("/admin/locations");
}

export async function updateLocation(
  locationId: string,
  _prevState: LocationFormState,
  formData: FormData,
): Promise<LocationFormState> {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = locationFormSchema.safeParse(parseLocationFormData(formData));

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
    .from("locations")
    .update({
      name: input.name,
      location_type: input.locationType,
      address_line_1: input.addressLine1,
      address_line_2: input.addressLine2 || null,
      city: input.city,
      province: input.province || null,
      postal_code: input.postalCode || null,
      country: input.country,
      phone: input.phone || null,
      email: input.email || null,
      map_url: input.mapUrl || null,
      map_embed_url: input.mapEmbedUrl || null,
      is_primary: input.isPrimary,
      sort_order: input.sortOrder,
      status: input.status,
    })
    .eq("id", locationId);

  if (error) {
    return { status: "error", message: "Something went wrong updating the location." };
  }

  revalidatePath("/contact");
  redirect("/admin/locations");
}

export async function deleteLocation(locationId: string): Promise<void> {
  const admin = await getCurrentAdminUser();
  if (!admin) return;

  const supabase = createSupabaseAdminClient();
  await supabase.from("locations").delete().eq("id", locationId);

  revalidatePath("/contact");
  revalidatePath("/admin/locations");
}
