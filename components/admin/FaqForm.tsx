"use client";

import { useActionState } from "react";
import { FormField, formInputClasses } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { initialFaqFormState, type FaqFormState } from "@/lib/validation/admin/faq";
import type { Faq } from "@/types/content";

interface FaqFormProps {
  action: (state: FaqFormState, formData: FormData) => Promise<FaqFormState>;
  faq?: Faq;
  isGlobal: boolean;
}

// Product/service/collection links are deliberately not editable here —
// those stay managed from each entity's own FaqPicker (docs/09 §12's
// product_faqs/service_faqs/collection_faqs), which is where an admin is
// already looking when contextually linking a FAQ. This form only owns the
// FAQ's own content plus `global_faqs`, the one link with no other surface.
export function FaqForm({ action, faq, isGlobal }: FaqFormProps) {
  const [state, formAction, pending] = useActionState(action, initialFaqFormState);

  return (
    <form action={formAction} className="flex flex-col gap-10">
      <section className="flex flex-col gap-5">
        <h2 className="text-h4 font-semibold text-neutral-950">Basics</h2>

        <FormField label="Question" htmlFor="question" required error={state.fieldErrors?.question?.[0]}>
          <input
            id="question"
            name="question"
            type="text"
            required
            defaultValue={faq?.question ?? ""}
            className={formInputClasses}
          />
        </FormField>

        <FormField label="Answer" htmlFor="answerRichtext" required error={state.fieldErrors?.answerRichtext?.[0]}>
          <textarea
            id="answerRichtext"
            name="answerRichtext"
            rows={5}
            required
            defaultValue={faq?.answerRichtext ?? ""}
            className={formInputClasses}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="Status" htmlFor="status" required>
            <select id="status" name="status" defaultValue={faq?.status ?? "draft"} className={formInputClasses}>
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
              defaultValue={faq?.sortOrder ?? 0}
              className={formInputClasses}
            />
          </FormField>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-h4 font-semibold text-neutral-950">Visibility</h2>
        <label className="flex items-center gap-2 text-body-sm font-medium text-neutral-900">
          <input
            type="checkbox"
            name="isGlobal"
            defaultChecked={isGlobal}
            className="rounded-sm border-neutral-300 text-brand-600 focus:ring-brand-600"
          />
          Show on the site-wide /faq page
        </label>
        <p className="text-body-sm text-neutral-500">
          Product, service, and collection links are managed from each item&apos;s own editor.
        </p>
      </section>

      {state.status === "error" && (
        <p role="alert" className="text-body-sm text-red-600">
          {state.message}
        </p>
      )}

      <div>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving..." : faq ? "Save changes" : "Create FAQ"}
        </Button>
      </div>
    </form>
  );
}
