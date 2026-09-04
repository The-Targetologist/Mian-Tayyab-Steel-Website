import type { Metadata } from "next";
import { FaqForm } from "@/components/admin/FaqForm";
import { createFaq } from "@/lib/actions/admin/faqs";

export const metadata: Metadata = {
  title: "New FAQ | MTS Admin",
  robots: { index: false },
};

export default function NewFaqPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h2 font-bold text-neutral-950">New FAQ</h1>
      <div className="max-w-(--container-md)">
        <FaqForm action={createFaq} isGlobal={false} />
      </div>
    </div>
  );
}
