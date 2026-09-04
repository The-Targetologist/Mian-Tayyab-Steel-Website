import type { Metadata } from "next";
import { PartnerForm } from "@/components/admin/PartnerForm";
import { createPartner } from "@/lib/actions/admin/partners";

export const metadata: Metadata = {
  title: "New Partner | MTS Admin",
  robots: { index: false },
};

export default function NewPartnerPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h2 font-bold text-neutral-950">New partner</h1>
      <div className="max-w-(--container-md)">
        <PartnerForm action={createPartner} />
      </div>
    </div>
  );
}
