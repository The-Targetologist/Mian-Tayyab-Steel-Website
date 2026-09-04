"use client";

import { useActionState } from "react";
import { NameAndSlugFields } from "./NameAndSlugFields";
import { RepeaterField } from "./RepeaterField";
import { RelationCheckboxList } from "./RelationCheckboxList";
import { ImageUploader } from "./ImageUploader";
import { GalleryManager } from "./GalleryManager";
import { FaqPicker } from "./FaqPicker";
import { FormField, formInputClasses } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { initialProductFormState, type ProductFormState } from "@/lib/validation/admin/product";
import type { CollectionOption, ProductOption } from "@/lib/queries/admin/products";
import type { FaqOption } from "@/lib/queries/admin/faqs";
import type { Product } from "@/types/content";

interface ProductFormProps {
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  product?: Product;
  collectionOptions: CollectionOption[];
  productOptions: ProductOption[];
  faqOptions: FaqOption[];
  selectedCollectionIds: string[];
  selectedRelatedProductIds: string[];
  selectedFaqIds: string[];
}

export function ProductForm({
  action,
  product,
  collectionOptions,
  productOptions,
  faqOptions,
  selectedCollectionIds,
  selectedRelatedProductIds,
  selectedFaqIds,
}: ProductFormProps) {
  const [state, formAction, pending] = useActionState(action, initialProductFormState);

  return (
    <form action={formAction} className="flex flex-col gap-10">
      <section className="flex flex-col gap-5">
        <h2 className="text-h4 font-semibold text-neutral-950">Basics</h2>

        <NameAndSlugFields
          defaultName={product?.name}
          defaultSlug={product?.slug}
          nameError={state.fieldErrors?.name?.[0]}
          slugError={state.fieldErrors?.slug?.[0]}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="Short name" htmlFor="shortName" error={state.fieldErrors?.shortName?.[0]}>
            <input
              id="shortName"
              name="shortName"
              type="text"
              defaultValue={product?.shortName ?? ""}
              className={formInputClasses}
            />
          </FormField>
          <FormField label="Origin" htmlFor="origin" error={state.fieldErrors?.origin?.[0]}>
            <input
              id="origin"
              name="origin"
              type="text"
              defaultValue={product?.origin ?? ""}
              className={formInputClasses}
            />
          </FormField>
        </div>

        <FormField label="Short description" htmlFor="shortDescription" error={state.fieldErrors?.shortDescription?.[0]}>
          <textarea
            id="shortDescription"
            name="shortDescription"
            rows={2}
            defaultValue={product?.shortDescription ?? ""}
            className={formInputClasses}
          />
        </FormField>

        <FormField label="Overview" htmlFor="introRichtext" error={state.fieldErrors?.introRichtext?.[0]}>
          <textarea
            id="introRichtext"
            name="introRichtext"
            rows={4}
            defaultValue={product?.introRichtext ?? ""}
            className={formInputClasses}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <FormField label="Status" htmlFor="status" required>
            <select
              id="status"
              name="status"
              defaultValue={product?.status ?? "draft"}
              className={formInputClasses}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </FormField>
          <FormField label="Sort order" htmlFor="sortOrder">
            <input
              id="sortOrder"
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={product?.sortOrder ?? 0}
              className={formInputClasses}
            />
          </FormField>
          <div className="flex items-end pb-2.5">
            <label className="flex items-center gap-2 text-body-sm font-medium text-neutral-900">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={product?.isFeatured ?? false}
                className="rounded-sm border-neutral-300 text-brand-600 focus:ring-brand-600"
              />
              Featured
            </label>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h4 font-semibold text-neutral-950">Media</h2>

        <ImageUploader
          label="Featured image"
          hiddenInputName="featuredImageId"
          folder="products"
          initialAsset={product?.featuredImage}
        />

        <GalleryManager
          label="Gallery"
          hiddenInputName="galleryMediaIds"
          folder="products"
          initialAssets={product?.gallery}
        />
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h4 font-semibold text-neutral-950">Technical information</h2>

        <RepeaterField
          label="Specifications"
          hiddenInputName="specifications"
          fields={[
            { key: "label", label: "Label", required: true },
            { key: "value", label: "Value", required: true },
            { key: "unit", label: "Unit (optional)" },
          ]}
          initialItems={product?.specifications.map((s) => ({
            label: s.label,
            value: s.value,
            unit: s.unit ?? "",
          }))}
          addLabel="Add specification"
        />

        <RepeaterField
          label="Features"
          hiddenInputName="features"
          fields={[
            { key: "title", label: "Title (optional)" },
            { key: "description", label: "Description", required: true },
          ]}
          initialItems={product?.features.map((f) => ({
            title: f.title ?? "",
            description: f.description,
          }))}
          addLabel="Add feature"
        />

        <RepeaterField
          label="Applications"
          hiddenInputName="applications"
          fields={[
            { key: "title", label: "Title", required: true },
            { key: "description", label: "Description (optional)" },
          ]}
          initialItems={product?.applications.map((a) => ({
            title: a.title,
            description: a.description ?? "",
          }))}
          addLabel="Add application"
        />
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h4 font-semibold text-neutral-950">Relationships</h2>

        <RelationCheckboxList
          label="Collections"
          name="collectionIds"
          options={collectionOptions}
          selectedIds={selectedCollectionIds}
          emptyMessage="No collections exist yet."
        />

        <RelationCheckboxList
          label="Related products"
          name="relatedProductIds"
          options={productOptions}
          selectedIds={selectedRelatedProductIds}
          emptyMessage="No other products exist yet."
        />
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h4 font-semibold text-neutral-950">FAQs</h2>
        <FaqPicker hiddenInputName="faqIds" options={faqOptions} selectedIds={selectedFaqIds} />
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h4 font-semibold text-neutral-950">SEO</h2>

        <FormField label="SEO title" htmlFor="seoTitle" error={state.fieldErrors?.seoTitle?.[0]}>
          <input
            id="seoTitle"
            name="seoTitle"
            type="text"
            defaultValue={product?.seoTitle ?? ""}
            className={formInputClasses}
          />
        </FormField>
        <FormField label="Meta description" htmlFor="seoDescription" error={state.fieldErrors?.seoDescription?.[0]}>
          <textarea
            id="seoDescription"
            name="seoDescription"
            rows={2}
            defaultValue={product?.seoDescription ?? ""}
            className={formInputClasses}
          />
        </FormField>
        <FormField label="Canonical URL" htmlFor="canonicalUrl" error={state.fieldErrors?.canonicalUrl?.[0]}>
          <input
            id="canonicalUrl"
            name="canonicalUrl"
            type="text"
            defaultValue={product?.canonicalUrl ?? ""}
            className={formInputClasses}
          />
        </FormField>
      </section>

      {state.status === "error" && (
        <p role="alert" className="text-body-sm text-red-600">
          {state.message}
        </p>
      )}

      <div>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving..." : product ? "Save changes" : "Create product"}
        </Button>
      </div>
    </form>
  );
}
