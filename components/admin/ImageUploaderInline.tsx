"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { uploadMedia } from "@/lib/actions/admin/media";
import type { MediaAsset } from "@/types/content";

interface ImageUploaderInlineProps {
  label: string;
  folder: string;
  asset: MediaAsset | null;
  onChange: (asset: MediaAsset | null) => void;
}

// Controlled variant of ImageUploader — hands the full MediaAsset back via
// onChange instead of holding its own hidden input. Needed by
// ContentBlockEditor, which stores the resolved asset inline in a JSON
// block rather than as a separate form field (see
// lib/validation/admin/collection.ts for why). Doesn't delete the media_assets
// row on remove, unlike ImageUploader/GalleryManager — the image may still
// be referenced by other blocks or entities, so only the reference is
// cleared here, not the asset itself.
export function ImageUploaderInline({ label, folder, asset, onChange }: ImageUploaderInlineProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", folder);

    startTransition(async () => {
      const result = await uploadMedia(formData);
      if (result.status === "error") {
        setError(result.message ?? "Upload failed.");
        return;
      }
      onChange(result.asset ?? null);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-caption font-medium text-neutral-600 uppercase">{label}</p>
      {asset ? (
        <div className="flex items-center gap-3">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-neutral-100 bg-brand-50">
            <Image src={asset.publicUrl} alt={asset.altText ?? ""} fill sizes="64px" className="object-cover" />
          </div>
          <button type="button" onClick={() => onChange(null)} className="text-body-sm font-medium text-red-600 hover:underline">
            Remove
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            disabled={pending}
            className="text-body-sm text-neutral-700"
          />
          {pending && <span className="text-body-sm text-neutral-500">Uploading...</span>}
        </div>
      )}
      {error && (
        <p role="alert" className="text-body-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
