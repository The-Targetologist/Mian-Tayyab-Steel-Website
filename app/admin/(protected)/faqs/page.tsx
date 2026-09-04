import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DeleteEntityButton } from "@/components/admin/DeleteEntityButton";
import { getAdminFaqs, type FaqUsage } from "@/lib/queries/admin/faqs";
import { deleteFaq } from "@/lib/actions/admin/faqs";

export const metadata: Metadata = {
  title: "FAQs | MTS Admin",
  robots: { index: false },
};

function usageLabel(usage: FaqUsage): string {
  const parts: string[] = [];
  if (usage.products > 0) parts.push(`${usage.products} product${usage.products === 1 ? "" : "s"}`);
  if (usage.services > 0) parts.push(`${usage.services} service${usage.services === 1 ? "" : "s"}`);
  if (usage.collections > 0) {
    parts.push(`${usage.collections} collection${usage.collections === 1 ? "" : "s"}`);
  }
  if (usage.isGlobal) parts.push("Global /faq page");
  return parts.length > 0 ? parts.join(", ") : "Not used anywhere yet";
}

export default async function AdminFaqsPage() {
  const faqs = await getAdminFaqs();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h2 font-bold text-neutral-950">FAQs</h1>
        <Button href="/admin/faqs/new" variant="primary">
          New FAQ
        </Button>
      </div>

      {faqs.length === 0 ? (
        <p className="text-body text-neutral-500">No FAQs yet. Create your first one to get started.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-neutral-100 bg-white">
          <table className="w-full min-w-[720px] text-body-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left">
                <th className="px-4 py-3 font-semibold text-neutral-700">Question</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">Status</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">Used in</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((faq) => (
                <tr key={faq.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="max-w-md font-medium text-neutral-950">{faq.question}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={faq.status} />
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{usageLabel(faq.usage)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/faqs/${faq.id}/edit`}
                        className="text-body-sm font-medium text-brand-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteEntityButton entityId={faq.id} entityName={faq.question} deleteAction={deleteFaq} />
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
