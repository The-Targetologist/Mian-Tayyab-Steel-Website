"use client";

import { useActionState } from "react";
import { NameAndSlugFields } from "./NameAndSlugFields";
import { ImageUploader } from "./ImageUploader";
import { RelationCheckboxList } from "./RelationCheckboxList";
import { FaqPicker } from "./FaqPicker";
import { ContentBlockEditor } from "./ContentBlockEditor";
import { FormField, formInputClasses } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import {
  initialCollectionFormState,
  type CollectionFormState,
} from "@/lib/validation/admin/collection";
import type { ProductOption } from "@/lib/queries/admin/collections";
import type { FaqOption } from "@/lib/queries/admin/faqs";
import type { AdminCollection } from "@/lib/queries/admin/collections";

interface CollectionFormProps {
  action: (state: CollectionFormState, formData: FormData) => Promise<CollectionFormState>;
  collection?: AdminCollection;
  productOptions: ProductOption[];
  faqOptions: FaqOption[];
  selectedProductIds: string[];
  selectedFaqIds: string[];
}

export function CollectionForm({
  action,
  collection,
  productOptions,
  faqOptions,
  selectedProductIds,
  selectedFaqIds,
}: CollectionFormProps) {
  const [state, formAction, pending] = useActionState(action, initialCollectionFormState);

  return (
    <form action={formAction} className="flex flex-col gap-10">
      <section className="flex flex-col gap-5">
        <h2 className="text-h4 font-semibold text-neutral-950">Basics</h2>

        <NameAndSlugFields
          defaultName={collection?.name}
          defaultSlug={collection?.slug}
          nameError={state.fieldErrors?.name?.[0]}
          slugError={state.fieldErrors?.slug?.[0]}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="Kicker" htmlFor="kicker" error={state.fieldErrors?.kicker?.[0]}>
            <input
              id="kicker"
              name="kicker"
              type="text"
              placeholder="e.g. Application"
              defaultValue={collection?.kicker ?? ""}
              className={formInputClasses}
            />
          </FormField>
          <FormField label="H1" htmlFor="h1" required error={state.fieldErrors?.h1?.[0]}>
            <input
              id="h1"
              name="h1"
              type="text"
              required
              defaultValue={collection?.h1 ?? ""}
              className={formInputClasses}
            />
          </FormField>
        </div>

        <FormField label="Short description" htmlFor="shortDescription" error={state.fieldErrors?.shortDescription?.[0]}>
          <textarea
            id="shortDescription"
            name="shortDescription"
            rows={2}
            defaultValue={collection?.shortDescription ?? ""}
            className={formInputClasses}
          />
        </FormField>

        <FormField label="Intro" htmlFor="introRichtext" error={state.fieldErrors?.introRichtext?.[0]}>
          <textarea
            id="introRichtext"
            name="introRichtext"
            rows={4}
            defaultValue={collection?.introRichtext ?? ""}
            className={formInputClasses}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="Status" htmlFor="status" required>
            <select id="status" name="status" defaultValue={collection?.status ?? "draft"} className={formInputClasses}>
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
              defaultValue={collection?.sortOrder ?? 0}
              className={formInputClasses}
            />
          </FormField>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h4 font-semibold text-neutral-950">Media</h2>
        <ImageUploader
          label="Hero image"
          hiddenInputName="heroImageId"
          folder="collections"
          initialAsset={collection?.heroImage}
        />
        <ImageUploader
          label="Brochure (PDF)"
          hiddenInputName="brochureMediaId"
          folder="collections"
          initialAsset={collection?.brochure}
        />
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h4 font-semibold text-neutral-950">Content blocks</h2>
        <ContentBlockEditor hiddenInputName="contentBlocks" initialBlocks={collection?.contentBlocks} />
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h4 font-semibold text-neutral-950">Relationships</h2>
        <RelationCheckboxList
          label="Products"
          name="productIds"
          options={productOptions}
          selectedIds={selectedProductIds}
          emptyMessage="No products exist yet."
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
            defaultValue={collection?.seoTitle ?? ""}
            className={formInputClasses}
          />
        </FormField>
        <FormField label="Meta description" htmlFor="seoDescription" error={state.fieldErrors?.seoDescription?.[0]}>
          <textarea
            id="seoDescription"
            name="seoDescription"
            rows={2}
            defaultValue={collection?.seoDescription ?? ""}
            className={formInputClasses}
          />
        </FormField>
        <FormField label="Canonical URL" htmlFor="canonicalUrl" error={state.fieldErrors?.canonicalUrl?.[0]}>
          <input
            id="canonicalUrl"
            name="canonicalUrl"
            type="text"
            defaultValue={collection?.canonicalUrl ?? ""}
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
          {pending ? "Saving..." : collection ? "Save changes" : "Create collection"}
        </Button>
      </div>
    </form>
  );
}
