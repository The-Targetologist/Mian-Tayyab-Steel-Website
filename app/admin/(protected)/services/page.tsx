import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DeleteEntityButton } from "@/components/admin/DeleteEntityButton";
import { getAdminServices } from "@/lib/queries/admin/services";
import { deleteService } from "@/lib/actions/admin/services";

export const metadata: Metadata = {
  title: "Services | MTS Admin",
  robots: { index: false },
};

export default async function AdminServicesPage() {
  const services = await getAdminServices();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h2 font-bold text-neutral-950">Services</h1>
        <Button href="/admin/services/new" variant="primary">
          New service
        </Button>
      </div>

      {services.length === 0 ? (
        <p className="text-body text-neutral-500">
          No services yet. Create your first one to get started.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-neutral-100 bg-white">
          <table className="w-full min-w-[640px] text-body-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left">
                <th className="px-4 py-3 font-semibold text-neutral-700">Name</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">Status</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">Featured</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">Updated</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-950">{service.name}</p>
                    <p className="text-caption text-neutral-500">/{service.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={service.status} />
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {service.isFeatured ? "Yes" : "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {new Date(service.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/services/${service.id}/edit`}
                        className="text-body-sm font-medium text-brand-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteEntityButton entityId={service.id} entityName={service.name} deleteAction={deleteService} />
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
