"use server";

import { getCurrentAdminUser } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getMediaAssetUsage } from "@/lib/queries/admin/media";
import type { MediaAsset } from "@/types/content";

const BUCKET = "media";
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB — matches the bucket's own limit (defense in depth)

export interface UploadMediaResult {
  status: "success" | "error";
  message?: string;
  asset?: MediaAsset;
}

// Called directly from client components (ImageUploader/GalleryManager) as
// soon as a file is selected — not bundled into the surrounding entity
// form's submission. Standard CMS pattern: upload completes immediately
// with its own feedback, decoupled from the parent form's "Save".
export async function uploadMedia(formData: FormData): Promise<UploadMediaResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return { status: "error", message: "Not authorized." };
  }

  const file = formData.get("file");
  const folder = formData.get("folder")?.toString() || "uploads";
  const altText = formData.get("altText")?.toString() || null;

  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "No file selected." };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { status: "error", message: "Unsupported file type." };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return { status: "error", message: "File is too large (10MB limit)." };
  }

  const supabase = createSupabaseAdminClient();

  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
  const path = `${folder}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    return { status: "error", message: "Upload failed. Please try again." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { data: assetRow, error: insertError } = await supabase
    .from("media_assets")
    .insert({
      bucket: BUCKET,
      path,
      public_url: publicUrl,
      alt_text: altText,
      mime_type: file.type,
      size_bytes: file.size,
    })
    .select("*")
    .single();

  if (insertError || !assetRow) {
    // Clean up the orphaned storage object if the metadata insert failed.
    await supabase.storage.from(BUCKET).remove([path]);
    return { status: "error", message: "Upload failed while saving metadata." };
  }

  return {
    status: "success",
    asset: {
      id: assetRow.id,
      bucket: assetRow.bucket,
      path: assetRow.path,
      publicUrl: assetRow.public_url,
      altText: assetRow.alt_text,
      caption: assetRow.caption,
      width: assetRow.width,
      height: assetRow.height,
      mimeType: assetRow.mime_type,
      sizeBytes: assetRow.size_bytes,
    },
  };
}

// Called from ImageUploader/GalleryManager's own "Remove" button — an
// unconditional delete, unchanged. That interaction is "remove this from the
// field I'm editing," in a context (Products/Collections/Services/etc. forms)
// where the asset was almost always just uploaded specifically for this one
// field. The Media Library screen (below) is the tool actually responsible
// for docs/10-admin-panel.md's "remove unused asset safely" — it checks
// usage first and refuses to delete a genuinely shared asset.
export async function deleteMedia(mediaId: string): Promise<void> {
  const admin = await getCurrentAdminUser();
  if (!admin) return;

  const supabase = createSupabaseAdminClient();
  const { data: asset } = await supabase
    .from("media_assets")
    .select("bucket, path")
    .eq("id", mediaId)
    .maybeSingle();

  if (!asset) return;

  await supabase.storage.from(asset.bucket).remove([asset.path]);
  await supabase.from("media_assets").delete().eq("id", mediaId);
}

export interface UpdateAltTextResult {
  status: "success" | "error";
  message?: string;
}

export async function updateMediaAltText(
  mediaId: string,
  altText: string,
): Promise<UpdateAltTextResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return { status: "error", message: "Not authorized." };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("media_assets")
    .update({ alt_text: altText.trim() || null })
    .eq("id", mediaId);

  if (error) {
    return { status: "error", message: "Something went wrong saving alt text." };
  }

  return { status: "success" };
}

export interface DeleteMediaSafelyResult {
  status: "success" | "error";
  message?: string;
}

// The Media Library's own delete — refuses when the asset is referenced
// anywhere (docs/10-admin-panel.md "remove unused asset safely"), listing
// what's using it rather than silently failing.
export async function deleteMediaAssetSafely(mediaId: string): Promise<DeleteMediaSafelyResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return { status: "error", message: "Not authorized." };
  }

  const usage = await getMediaAssetUsage(mediaId);
  if (usage.length > 0) {
    return {
      status: "error",
      message: `Still used by: ${usage.join(", ")}. Remove those references first.`,
    };
  }

  const supabase = createSupabaseAdminClient();
  const { data: asset } = await supabase
    .from("media_assets")
    .select("bucket, path")
    .eq("id", mediaId)
    .maybeSingle();

  if (!asset) {
    return { status: "error", message: "Asset not found." };
  }

  await supabase.storage.from(asset.bucket).remove([asset.path]);
  await supabase.from("media_assets").delete().eq("id", mediaId);

  return { status: "success" };
}
