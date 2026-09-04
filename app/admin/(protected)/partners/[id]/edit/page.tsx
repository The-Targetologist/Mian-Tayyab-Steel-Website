import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PartnerForm } from "@/components/admin/PartnerForm";
import { updatePartner } from "@/lib/actions/admin/partners";
import { getAdminPartnerById } from "@/lib/queries/admin/partners";

export const metadata: Metadata = {
  title: "Edit Partner | MTS Admin",
  robots: { index: false },
};

interface EditPartnerPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPartnerPage({ params }: EditPartnerPageProps) {
  const { id } = await params;

  const partner = await getAdminPartnerById(id);
  if (!partner) {
    notFound();
  }

  const boundUpdatePartner = updatePartner.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h2 font-bold text-neutral-950">Edit partner</h1>
      <div className="max-w-(--container-md)">
        <PartnerForm action={boundUpdatePartner} partner={partner} />
      </div>
    </div>
  );
}
