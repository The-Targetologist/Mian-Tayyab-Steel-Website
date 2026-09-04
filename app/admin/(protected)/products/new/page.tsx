import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProduct } from "@/lib/actions/admin/products";
import { getAllCollectionOptions, getAllProductOptions } from "@/lib/queries/admin/products";
import { getAllFaqOptions } from "@/lib/queries/admin/faqs";

export const metadata: Metadata = {
  title: "New Product | MTS Admin",
  robots: { index: false },
};

export default async function NewProductPage() {
  const [collectionOptions, productOptions, faqOptions] = await Promise.all([
    getAllCollectionOptions(),
    getAllProductOptions(),
    getAllFaqOptions(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h2 font-bold text-neutral-950">New product</h1>
      <div className="max-w-(--container-md)">
        <ProductForm
          action={createProduct}
          collectionOptions={collectionOptions}
          productOptions={productOptions}
          faqOptions={faqOptions}
          selectedCollectionIds={[]}
          selectedRelatedProductIds={[]}
          selectedFaqIds={[]}
        />
      </div>
    </div>
  );
}
