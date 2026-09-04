import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DeleteEntityButton } from "@/components/admin/DeleteEntityButton";
import { getAdminPartners } from "@/lib/queries/admin/partners";
import { getAdminCertifications } from "@/lib/queries/admin/certifications";
import { deletePartner } from "@/lib/actions/admin/partners";
import { deleteCertification } from "@/lib/actions/admin/certifications";

export const metadata: Metadata = {
  title: "Partners & Certifications | MTS Admin",
  robots: { index: false },
};

// One nav item, two entities (docs/10-admin-panel.md groups them together;
// AdminSidebar links both to /admin/partners) — a single screen with two
// sections rather than forcing an artificial shared schema between two
// genuinely different content shapes (partner relationship data vs.
// certificate/issuer data).
export default async function AdminPartnersPage() {
  const [partners, certifications] = await Promise.all([
    getAdminPartners(),
    getAdminCertifications(),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-h2 font-bold text-neutral-950">Partners</h1>
          <Button href="/admin/partners/new" variant="primary">
            New partner
          </Button>
        </div>

        {partners.length === 0 ? (
          <p className="text-body text-neutral-500">
            No partners yet. Create your first one to get started.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-neutral-100 bg-white">
            <table className="w-full min-w-[640px] text-body-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-left">
                  <th className="px-4 py-3 font-semibold text-neutral-700">Name</th>
                  <th className="px-4 py-3 font-semibold text-neutral-700">Relationship</th>
                  <th className="px-4 py-3 font-semibold text-neutral-700">Status</th>
                  <th className="px-4 py-3 font-semibold text-neutral-700">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => (
                  <tr key={partner.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-neutral-950">{partner.name}</td>
                    <td className="px-4 py-3 text-neutral-700">{partner.relationshipLabel ?? "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={partner.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-4">
                        <Link
                          href={`/admin/partners/${partner.id}/edit`}
                          className="text-body-sm font-medium text-brand-600 hover:underline"
                        >
                          Edit
                        </Link>
                        <DeleteEntityButton
                          entityId={partner.id}
                          entityName={partner.name}
                          deleteAction={deletePartner}
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

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-h2 font-bold text-neutral-950">Certifications</h1>
          <Button href="/admin/partners/certifications/new" variant="primary">
            New certification
          </Button>
        </div>

        {certifications.length === 0 ? (
          <p className="text-body text-neutral-500">
            No certifications yet. Create your first one to get started.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-neutral-100 bg-white">
            <table className="w-full min-w-[640px] text-body-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-left">
                  <th className="px-4 py-3 font-semibold text-neutral-700">Name</th>
                  <th className="px-4 py-3 font-semibold text-neutral-700">Issuer</th>
                  <th className="px-4 py-3 font-semibold text-neutral-700">Status</th>
                  <th className="px-4 py-3 font-semibold text-neutral-700">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {certifications.map((certification) => (
                  <tr key={certification.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-neutral-950">{certification.name}</td>
                    <td className="px-4 py-3 text-neutral-700">{certification.issuer ?? "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={certification.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-4">
                        <Link
                          href={`/admin/partners/certifications/${certification.id}/edit`}
                          className="text-body-sm font-medium text-brand-600 hover:underline"
                        >
                          Edit
                        </Link>
                        <DeleteEntityButton
                          entityId={certification.id}
                          entityName={certification.name}
                          deleteAction={deleteCertification}
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
    </div>
  );
}
