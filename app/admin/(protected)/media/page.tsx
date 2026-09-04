import type { Metadata } from "next";
import { MediaLibraryGrid } from "@/components/admin/MediaLibraryGrid";
import { getAdminMediaAssets } from "@/lib/queries/admin/media";

export const metadata: Metadata = {
  title: "Media | MTS Admin",
  robots: { index: false },
};

export default async function AdminMediaPage() {
  const assets = await getAdminMediaAssets();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h2 font-bold text-neutral-950">Media</h1>
        <p className="text-body-sm text-neutral-500">
          {assets.length} file{assets.length === 1 ? "" : "s"}
        </p>
      </div>

      <p className="text-body-sm text-neutral-500">
        Uploads happen from each product, collection, service, and other editor&apos;s own Media
        section. This library is for browsing everything uploaded so far, setting alt text, and
        safely removing files that are no longer used anywhere.
      </p>

      <MediaLibraryGrid assets={assets} />
    </div>
  );
}
