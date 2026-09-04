import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { updateProduct } from "@/lib/actions/admin/products";
import {
  getAdminProductById,
  getAllCollectionOptions,
  getAllProductOptions,
  getCollectionIdsForProduct,
  getRelatedProductIds,
} from "@/lib/queries/admin/products";
import { getAllFaqOptions, getFaqIdsForProduct } from "@/lib/queries/admin/faqs";

export const metadata: Metadata = {
  title: "Edit Product | MTS Admin",
  robots: { index: false },
};

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  const product = await getAdminProductById(id);
  if (!product) {
    notFound();
  }

  const [
    collectionOptions,
    productOptions,
    faqOptions,
    selectedCollectionIds,
    selectedRelatedProductIds,
    selectedFaqIds,
  ] = await Promise.all([
    getAllCollectionOptions(),
    getAllProductOptions(id),
    getAllFaqOptions(),
    getCollectionIdsForProduct(id),
    getRelatedProductIds(id),
    getFaqIdsForProduct(id),
  ]);

  const boundUpdateProduct = updateProduct.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h2 font-bold text-neutral-950">Edit product</h1>
      <div className="max-w-(--container-md)">
        <ProductForm
          action={boundUpdateProduct}
          product={product}
          collectionOptions={collectionOptions}
          productOptions={productOptions}
          faqOptions={faqOptions}
          selectedCollectionIds={selectedCollectionIds}
          selectedRelatedProductIds={selectedRelatedProductIds}
          selectedFaqIds={selectedFaqIds}
        />
      </div>
    </div>
  );
}
