import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DeleteEntityButton } from "@/components/admin/DeleteEntityButton";
import { getAdminCollections } from "@/lib/queries/admin/collections";
import { deleteCollection } from "@/lib/actions/admin/collections";

export const metadata: Metadata = {
  title: "Collections | MTS Admin",
  robots: { index: false },
};

export default async function AdminCollectionsPage() {
  const collections = await getAdminCollections();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h2 font-bold text-neutral-950">Collections</h1>
        <Button href="/admin/collections/new" variant="primary">
          New collection
        </Button>
      </div>

      {collections.length === 0 ? (
        <p className="text-body text-neutral-500">
          No collections yet. Create your first one to get started.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-neutral-100 bg-white">
          <table className="w-full min-w-[560px] text-body-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left">
                <th className="px-4 py-3 font-semibold text-neutral-700">Name</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">Status</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">Updated</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {collections.map((collection) => (
                <tr key={collection.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-950">{collection.name}</p>
                    <p className="text-caption text-neutral-500">/{collection.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={collection.status} />
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {new Date(collection.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/collections/${collection.id}/edit`}
                        className="text-body-sm font-medium text-brand-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteEntityButton
                        entityId={collection.id}
                        entityName={collection.name}
                        deleteAction={deleteCollection}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
