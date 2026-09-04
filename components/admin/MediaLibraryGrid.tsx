"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { updateMediaAltText, deleteMediaAssetSafely } from "@/lib/actions/admin/media";
import { formInputClasses } from "@/components/ui/FormField";
import type { AdminMediaAsset } from "@/lib/queries/admin/media";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AssetCard({ asset }: { asset: AdminMediaAsset }) {
  const [altText, setAltText] = useState(asset.altText ?? "");
  const [altStatus, setAltStatus] = useState<"idle" | "saved" | "error">("idle");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);
  const [pending, startTransition] = useTransition();

  function saveAltText() {
    startTransition(async () => {
      const result = await updateMediaAltText(asset.id, altText);
      setAltStatus(result.status === "success" ? "saved" : "error");
    });
  }

  function handleDelete() {
    if (!confirm("Delete this file permanently? This cannot be undone.")) return;
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteMediaAssetSafely(asset.id);
      if (result.status === "error") {
        setDeleteError(result.message ?? "Could not delete.");
        return;
      }
      setDeleted(true);
    });
  }

  if (deleted) return null;

  const inUse = asset.usage.length > 0;

  return (
    <div className="flex flex-col gap-3 rounded-md border border-neutral-100 bg-white p-4">
      {asset.mimeType.startsWith("image/") ? (
        <div className="relative aspect-square overflow-hidden rounded-md bg-brand-50">
          <Image src={asset.publicUrl} alt={asset.altText ?? ""} fill sizes="240px" className="object-cover" />
        </div>
      ) : (
        <a
          href={asset.publicUrl}
          target="_blank"
          rel="noreferrer"
          className="flex aspect-square items-center justify-center rounded-md bg-brand-50 text-body-sm font-medium text-brand-700 hover:bg-brand-100"
        >
          View file
        </a>
      )}

      <div className="flex flex-col gap-0.5 text-caption text-neutral-500">
        <p className="truncate font-medium text-neutral-900">{asset.path.split("/").pop()}</p>
        <p>
          {asset.mimeType} · {formatBytes(asset.sizeBytes)}
        </p>
        <p>
          {new Date(asset.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-caption font-medium text-neutral-700">Alt text</label>
        <input
          type="text"
          value={altText}
          onChange={(event) => {
            setAltText(event.target.value);
            setAltStatus("idle");
          }}
          onBlur={saveAltText}
          className={formInputClasses}
        />
        {altStatus === "saved" && <p className="text-caption text-brand-700">Saved</p>}
        {altStatus === "error" && <p className="text-caption text-red-600">Could not save</p>}
      </div>

      <p className="text-caption text-neutral-500">
        {inUse ? `Used by: ${asset.usage.join(", ")}` : "Not used anywhere"}
      </p>

      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending || inUse}
          title={inUse ? "In use — remove those references first" : undefined}
          className="w-fit text-body-sm font-medium text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-neutral-300 disabled:no-underline"
        >
          {pending ? "Working..." : "Delete"}
        </button>
        {deleteError && (
          <p role="alert" className="text-caption text-red-600">
            {deleteError}
          </p>
        )}
      </div>
    </div>
  );
}

// docs/10-admin-panel.md "Media": "upload, select, preview, set alt text,
// remove unused asset safely." Upload/select already happen inline per
// entity via ImageUploader/GalleryManager — this screen is for the rest:
// browsing everything that's been uploaded, editing alt text (previously
// nowhere in the admin UI at all — uploadMedia() accepted it but nothing
// ever passed one in), and safe deletion.
export function MediaLibraryGrid({ assets }: { assets: AdminMediaAsset[] }) {
  if (assets.length === 0) {
    return <p className="text-body text-neutral-500">No media uploaded yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {assets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </div>
  );
}
