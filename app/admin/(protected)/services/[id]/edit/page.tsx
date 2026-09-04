import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { updateService } from "@/lib/actions/admin/services";
import { getAdminServiceById, getProductIdsForService } from "@/lib/queries/admin/services";
import { getAllProductOptions } from "@/lib/queries/admin/products";
import { getAllFaqOptions, getFaqIdsForService } from "@/lib/queries/admin/faqs";

export const metadata: Metadata = {
  title: "Edit Service | MTS Admin",
  robots: { index: false },
};

interface EditServicePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const { id } = await params;

  const service = await getAdminServiceById(id);
  if (!service) {
    notFound();
  }

  const [productOptions, faqOptions, selectedProductIds, selectedFaqIds] = await Promise.all([
    getAllProductOptions(),
    getAllFaqOptions(),
    getProductIdsForService(id),
    getFaqIdsForService(id),
  ]);

  const boundUpdateService = updateService.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h2 font-bold text-neutral-950">Edit service</h1>
      <div className="max-w-(--container-md)">
        <ServiceForm
          action={boundUpdateService}
          service={service}
          productOptions={productOptions}
          faqOptions={faqOptions}
          selectedProductIds={selectedProductIds}
          selectedFaqIds={selectedFaqIds}
        />
      </div>
    </div>
  );
}
