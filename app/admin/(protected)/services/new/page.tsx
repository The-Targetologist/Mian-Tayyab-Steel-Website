import type { Metadata } from "next";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { createService } from "@/lib/actions/admin/services";
import { getAllProductOptions } from "@/lib/queries/admin/products";
import { getAllFaqOptions } from "@/lib/queries/admin/faqs";

export const metadata: Metadata = {
  title: "New Service | MTS Admin",
  robots: { index: false },
};

export default async function NewServicePage() {
  const [productOptions, faqOptions] = await Promise.all([
    getAllProductOptions(),
    getAllFaqOptions(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h2 font-bold text-neutral-950">New service</h1>
      <div className="max-w-(--container-md)">
        <ServiceForm
          action={createService}
          productOptions={productOptions}
          faqOptions={faqOptions}
          selectedProductIds={[]}
          selectedFaqIds={[]}
        />
      </div>
    </div>
  );
}
