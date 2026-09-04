import type { Metadata } from "next";
import Link from "next/link";
import { QuoteStatusSelect } from "@/components/admin/QuoteStatusSelect";
import { getAdminQuoteRequests } from "@/lib/queries/admin/inquiries";

export const metadata: Metadata = {
  title: "Inquiries | MTS Admin",
  robots: { index: false },
};

export default async function AdminInquiriesPage() {
  const inquiries = await getAdminQuoteRequests();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h2 font-bold text-neutral-950">Inquiries</h1>

      {inquiries.length === 0 ? (
        <p className="text-body text-neutral-500">No quote requests yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-neutral-100 bg-white">
          <table className="w-full min-w-[900px] text-body-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left">
                <th className="px-4 py-3 font-semibold text-neutral-700">Date</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">Name / Company</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">Phone / Email</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">Product / Service</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">Source page</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">Status</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => {
                const isNew = inquiry.status === "new";
                return (
                <tr
                  key={inquiry.id}
                  className={`border-b border-neutral-100 last:border-0 ${isNew ? "bg-brand-50/40" : ""}`}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-neutral-700">
                    {new Date(inquiry.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-neutral-950">{inquiry.name}</p>
                      {isNew && (
                        <span className="inline-flex rounded-sm bg-brand-600 px-1.5 py-0.5 text-caption font-semibold tracking-wide text-white uppercase">
                          New
                        </span>
                      )}
                    </div>
                    {inquiry.company && <p className="text-caption text-neutral-500">{inquiry.company}</p>}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    <p>{inquiry.phone}</p>
                    <p className="text-caption text-neutral-500">{inquiry.email}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {inquiry.productName ?? inquiry.serviceName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{inquiry.sourcePage ?? "—"}</td>
                  <td className="px-4 py-3">
                    <QuoteStatusSelect quoteRequestId={inquiry.id} status={inquiry.status} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/inquiries/${inquiry.id}`}
                      className="text-body-sm font-medium text-brand-600 hover:underline"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
