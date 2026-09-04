import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DeleteEntityButton } from "@/components/admin/DeleteEntityButton";
import { getAdminLocations } from "@/lib/queries/admin/locations";
import { deleteLocation } from "@/lib/actions/admin/locations";

export const metadata: Metadata = {
  title: "Locations | MTS Admin",
  robots: { index: false },
};

const typeLabels: Record<string, string> = {
  office: "Office",
  warehouse: "Warehouse",
  yard: "Yard",
  facility: "Facility",
};

export default async function AdminLocationsPage() {
  const locations = await getAdminLocations();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h2 font-bold text-neutral-950">Locations</h1>
        <Button href="/admin/locations/new" variant="primary">
          New location
        </Button>
      </div>

      {locations.length === 0 ? (
        <p className="text-body text-neutral-500">
          No locations yet. Create your first one to get started.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-neutral-100 bg-white">
          <table className="w-full min-w-[640px] text-body-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left">
                <th className="px-4 py-3 font-semibold text-neutral-700">Name</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">Type</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">City</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">Status</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">Primary</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <tr key={location.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-neutral-950">{location.name}</td>
                  <td className="px-4 py-3 text-neutral-700">{typeLabels[location.locationType]}</td>
                  <td className="px-4 py-3 text-neutral-700">{location.city}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={location.status} />
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{location.isPrimary ? "Yes" : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/locations/${location.id}/edit`}
                        className="text-body-sm font-medium text-brand-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteEntityButton
                        entityId={location.id}
                        entityName={location.name}
                        deleteAction={deleteLocation}
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
