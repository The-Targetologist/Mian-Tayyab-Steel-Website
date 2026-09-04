import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionForm } from "@/components/admin/CollectionForm";
import { updateCollection } from "@/lib/actions/admin/collections";
import {
  getAdminCollectionById,
  getAllProductOptionsForCollections,
  getProductIdsForCollection,
  getFaqIdsForCollection,
} from "@/lib/queries/admin/collections";
import { getAllFaqOptions } from "@/lib/queries/admin/faqs";

export const metadata: Metadata = {
  title: "Edit Collection | MTS Admin",
  robots: { index: false },
};

interface EditCollectionPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCollectionPage({ params }: EditCollectionPageProps) {
  const { id } = await params;

  const collection = await getAdminCollectionById(id);
  if (!collection) {
    notFound();
  }

  const [productOptions, faqOptions, selectedProductIds, selectedFaqIds] = await Promise.all([
    getAllProductOptionsForCollections(),
    getAllFaqOptions(),
    getProductIdsForCollection(id),
    getFaqIdsForCollection(id),
  ]);

  const boundUpdateCollection = updateCollection.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h2 font-bold text-neutral-950">Edit collection</h1>
      <div className="max-w-(--container-md)">
        <CollectionForm
          action={boundUpdateCollection}
          collection={collection}
          productOptions={productOptions}
          faqOptions={faqOptions}
          selectedProductIds={selectedProductIds}
          selectedFaqIds={selectedFaqIds}
        />
      </div>
    </div>
  );
}
