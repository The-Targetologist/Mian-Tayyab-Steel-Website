import type { Metadata } from "next";
import { CertificationForm } from "@/components/admin/CertificationForm";
import { createCertification } from "@/lib/actions/admin/certifications";

export const metadata: Metadata = {
  title: "New Certification | MTS Admin",
  robots: { index: false },
};

export default function NewCertificationPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h2 font-bold text-neutral-950">New certification</h1>
      <div className="max-w-(--container-md)">
        <CertificationForm action={createCertification} />
      </div>
    </div>
  );
}
