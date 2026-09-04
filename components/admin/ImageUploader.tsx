"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { uploadMedia, deleteMedia } from "@/lib/actions/admin/media";
import type { MediaAsset } from "@/types/content";

interface ImageUploaderProps {
  label: string;
  hiddenInputName: string;
  folder: string;
  initialAsset?: MediaAsset | null;
}

// Uploads immediately on file selection (not bundled into the parent
// entity form's submit) — see lib/actions/admin/media.ts. The hidden input
// holds the resulting media_assets.id and submits naturally as part of
// whatever <form> this component is rendered inside.
//
// Despite the name, this also backs "Brochure (PDF)"-type fields (Collections,
// now Settings) — the storage bucket itself allows images + PDF (see
// docs/PROJECT_STATE.md's Phase 10 media notes), so the file picker and
// preview here need to handle both, not just images.
export function ImageUploader({ label, hiddenInputName, folder, initialAsset }: ImageUploaderProps) {
  const [asset, setAsset] = useState<MediaAsset | null | undefined>(initialAsset);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

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
      setAsset(result.asset ?? null);
    });
  }

  function handleRemove() {
    if (!asset) return;
    const assetId = asset.id;
    setAsset(null);
    startTransition(async () => {
      await deleteMedia(assetId);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-body-sm font-medium text-neutral-900">{label}</p>
      <input type="hidden" name={hiddenInputName} value={asset?.id ?? ""} />

      {asset ? (
        <div className="flex items-center gap-4">
          {asset.mimeType.startsWith("image/") ? (
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border border-neutral-100 bg-brand-50">
              <Image src={asset.publicUrl} alt={asset.altText ?? ""} fill sizes="96px" className="object-cover" />
            </div>
          ) : (
            <a
              href={asset.publicUrl}
              target="_blank"
              rel="noreferrer"
              className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-md border border-neutral-100 bg-brand-50 text-center text-caption font-medium text-brand-700 hover:bg-brand-100"
            >
              <span>View file</span>
            </a>
          )}
          <button
            type="button"
            onClick={handleRemove}
            disabled={pending}
            className="text-body-sm font-medium text-red-600 hover:underline disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
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
