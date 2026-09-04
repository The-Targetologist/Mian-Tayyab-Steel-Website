import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuoteStatusSelect } from "@/components/admin/QuoteStatusSelect";
import { getAdminQuoteRequestById } from "@/lib/queries/admin/inquiries";

export const metadata: Metadata = {
  title: "Inquiry Detail | MTS Admin",
  robots: { index: false },
};

interface InquiryDetailPageProps {
  params: Promise<{ id: string }>;
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1">
      <p className="text-caption font-semibold tracking-wide text-neutral-500 uppercase">{label}</p>
      <p className="text-body-sm whitespace-pre-wrap text-neutral-900">{value}</p>
    </div>
  );
}

export default async function InquiryDetailPage({ params }: InquiryDetailPageProps) {
  const { id } = await params;

  const inquiry = await getAdminQuoteRequestById(id);
  if (!inquiry) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Link href="/admin/inquiries" className="text-body-sm font-medium text-brand-600 hover:underline">
            ← Back to inquiries
          </Link>
          <h1 className="text-h2 font-bold text-neutral-950">{inquiry.name}</h1>
          <p className="text-body-sm text-neutral-500">
            Submitted{" "}
            {new Date(inquiry.createdAt).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <QuoteStatusSelect quoteRequestId={inquiry.id} status={inquiry.status} />
      </div>

      <div className="grid max-w-(--container-md) grid-cols-1 gap-5 rounded-md border border-neutral-100 bg-white p-6 sm:grid-cols-2">
        <DetailRow label="Company" value={inquiry.company} />
        <DetailRow label="City" value={inquiry.city} />
        <DetailRow label="Phone" value={inquiry.phone} />
        <DetailRow label="Email" value={inquiry.email} />
        <DetailRow label="Product" value={inquiry.productName} />
        <DetailRow label="Service" value={inquiry.serviceName} />
        <DetailRow label="Source page" value={inquiry.sourcePage} />
        <div className="sm:col-span-2">
          <DetailRow label="Quantity" value={inquiry.quantityText} />
        </div>
        <div className="sm:col-span-2">
          <DetailRow label="Specification" value={inquiry.specificationText} />
        </div>
        <div className="sm:col-span-2">
          <DetailRow label="Message" value={inquiry.message} />
        </div>
        {inquiry.attachmentUrl && (
          <div className="sm:col-span-2">
            <p className="text-caption font-semibold tracking-wide text-neutral-500 uppercase">Attachment</p>
            <a
              href={inquiry.attachmentUrl}
              target="_blank"
              rel="noreferrer"
              className="text-body-sm font-medium text-brand-600 hover:underline"
            >
              View attachment
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
