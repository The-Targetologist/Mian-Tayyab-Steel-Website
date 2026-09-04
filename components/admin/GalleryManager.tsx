"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { uploadMedia, deleteMedia } from "@/lib/actions/admin/media";
import type { MediaAsset } from "@/types/content";

interface GalleryManagerProps {
  label: string;
  hiddenInputName: string;
  folder: string;
  initialAssets?: MediaAsset[];
}

export function GalleryManager({ label, hiddenInputName, folder, initialAssets = [] }: GalleryManagerProps) {
  const [assets, setAssets] = useState<MediaAsset[]>(initialAssets);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setError(null);
    event.target.value = "";

    startTransition(async () => {
      for (const file of files) {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("folder", folder);

        const result = await uploadMedia(formData);
        if (result.status === "error") {
          setError(result.message ?? "Upload failed.");
          continue;
        }
        if (result.asset) {
          setAssets((prev) => [...prev, result.asset!]);
        }
      }
    });
  }

  function handleRemove(assetId: string) {
    setAssets((prev) => prev.filter((asset) => asset.id !== assetId));
    startTransition(async () => {
      await deleteMedia(assetId);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-body-sm font-medium text-neutral-900">{label}</p>
        <label className="cursor-pointer text-body-sm font-medium text-brand-600 hover:underline">
          Add images
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFileChange}
            disabled={pending}
            className="hidden"
          />
        </label>
      </div>

      {assets.map((asset) => (
        <input key={asset.id} type="hidden" name={hiddenInputName} value={asset.id} />
      ))}

      {pending && <p className="text-body-sm text-neutral-500">Uploading...</p>}
      {error && (
        <p role="alert" className="text-body-sm text-red-600">
          {error}
        </p>
      )}

      {assets.length === 0 ? (
        <p className="text-body-sm text-neutral-500">No gallery images yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {assets.map((asset) => (
            <div key={asset.id} className="relative aspect-square overflow-hidden rounded-md border border-neutral-100 bg-brand-50">
              <Image src={asset.publicUrl} alt={asset.altText ?? ""} fill sizes="120px" className="object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(asset.id)}
                className="absolute top-1 right-1 rounded-sm bg-white/90 px-1.5 py-0.5 text-caption font-medium text-red-600 hover:bg-white"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
