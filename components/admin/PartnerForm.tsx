"use client";

import { useActionState } from "react";
import { ImageUploader } from "./ImageUploader";
import { FormField, formInputClasses } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { initialPartnerFormState, type PartnerFormState } from "@/lib/validation/admin/partner";
import type { Partner } from "@/types/content";

interface PartnerFormProps {
  action: (state: PartnerFormState, formData: FormData) => Promise<PartnerFormState>;
  partner?: Partner;
}

export function PartnerForm({ action, partner }: PartnerFormProps) {
  const [state, formAction, pending] = useActionState(action, initialPartnerFormState);

  return (
    <form action={formAction} className="flex flex-col gap-10">
      <section className="flex flex-col gap-5">
        <h2 className="text-h4 font-semibold text-neutral-950">Basics</h2>

        <FormField label="Name" htmlFor="name" required error={state.fieldErrors?.name?.[0]}>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={partner?.name ?? ""}
            className={formInputClasses}
          />
        </FormField>

        <FormField label="Relationship label" htmlFor="relationshipLabel" error={state.fieldErrors?.relationshipLabel?.[0]}>
          <input
            id="relationshipLabel"
            name="relationshipLabel"
            type="text"
            placeholder="e.g. Authorized Distributor"
            defaultValue={partner?.relationshipLabel ?? ""}
            className={formInputClasses}
          />
        </FormField>

        <FormField label="Description" htmlFor="description" error={state.fieldErrors?.description?.[0]}>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={partner?.description ?? ""}
            className={formInputClasses}
          />
        </FormField>

        <FormField label="Website URL" htmlFor="websiteUrl" error={state.fieldErrors?.websiteUrl?.[0]}>
          <input
            id="websiteUrl"
            name="websiteUrl"
            type="text"
            defaultValue={partner?.websiteUrl ?? ""}
            className={formInputClasses}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="Status" htmlFor="status" required>
            <select id="status" name="status" defaultValue={partner?.status ?? "draft"} className={formInputClasses}>
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
              defaultValue={partner?.sortOrder ?? 0}
              className={formInputClasses}
            />
          </FormField>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h4 font-semibold text-neutral-950">Logo</h2>
        <ImageUploader
          label="Logo"
          hiddenInputName="logoMediaId"
          folder="partners"
          initialAsset={partner?.logo}
        />
      </section>

      {state.status === "error" && (
        <p role="alert" className="text-body-sm text-red-600">
          {state.message}
        </p>
      )}

      <div>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving..." : partner ? "Save changes" : "Create partner"}
        </Button>
      </div>
    </form>
  );
}
