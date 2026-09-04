import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CertificationForm } from "@/components/admin/CertificationForm";
import { updateCertification } from "@/lib/actions/admin/certifications";
import { getAdminCertificationById } from "@/lib/queries/admin/certifications";

export const metadata: Metadata = {
  title: "Edit Certification | MTS Admin",
  robots: { index: false },
};

interface EditCertificationPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCertificationPage({ params }: EditCertificationPageProps) {
  const { id } = await params;

  const certification = await getAdminCertificationById(id);
  if (!certification) {
    notFound();
  }

  const boundUpdateCertification = updateCertification.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h2 font-bold text-neutral-950">Edit certification</h1>
      <div className="max-w-(--container-md)">
        <CertificationForm action={boundUpdateCertification} certification={certification} />
      </div>
    </div>
  );
}
