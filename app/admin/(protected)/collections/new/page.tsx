import type { Metadata } from "next";
import { CollectionForm } from "@/components/admin/CollectionForm";
import { createCollection } from "@/lib/actions/admin/collections";
import { getAllProductOptionsForCollections } from "@/lib/queries/admin/collections";
import { getAllFaqOptions } from "@/lib/queries/admin/faqs";

export const metadata: Metadata = {
  title: "New Collection | MTS Admin",
  robots: { index: false },
};

export default async function NewCollectionPage() {
  const [productOptions, faqOptions] = await Promise.all([
    getAllProductOptionsForCollections(),
    getAllFaqOptions(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h2 font-bold text-neutral-950">New collection</h1>
      <div className="max-w-(--container-md)">
        <CollectionForm
          action={createCollection}
          productOptions={productOptions}
          faqOptions={faqOptions}
          selectedProductIds={[]}
          selectedFaqIds={[]}
        />
      </div>
    </div>
  );
}
