import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaqForm } from "@/components/admin/FaqForm";
import { updateFaq } from "@/lib/actions/admin/faqs";
import { getAdminFaqById, isFaqGlobal } from "@/lib/queries/admin/faqs";

export const metadata: Metadata = {
  title: "Edit FAQ | MTS Admin",
  robots: { index: false },
};

interface EditFaqPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFaqPage({ params }: EditFaqPageProps) {
  const { id } = await params;

  const faq = await getAdminFaqById(id);
  if (!faq) {
    notFound();
  }

  const isGlobal = await isFaqGlobal(id);
  const boundUpdateFaq = updateFaq.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h2 font-bold text-neutral-950">Edit FAQ</h1>
      <div className="max-w-(--container-md)">
        <FaqForm action={boundUpdateFaq} faq={faq} isGlobal={isGlobal} />
      </div>
    </div>
  );
}
