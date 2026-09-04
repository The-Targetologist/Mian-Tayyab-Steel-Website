"use client";

import { useActionState } from "react";
import { ImageUploader } from "./ImageUploader";
import { FormField, formInputClasses } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import {
  initialCertificationFormState,
  type CertificationFormState,
} from "@/lib/validation/admin/certification";
import type { Certification } from "@/types/content";

interface CertificationFormProps {
  action: (state: CertificationFormState, formData: FormData) => Promise<CertificationFormState>;
  certification?: Certification;
}

export function CertificationForm({ action, certification }: CertificationFormProps) {
  const [state, formAction, pending] = useActionState(action, initialCertificationFormState);

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
            defaultValue={certification?.name ?? ""}
            className={formInputClasses}
          />
        </FormField>

        <FormField label="Issuer" htmlFor="issuer" error={state.fieldErrors?.issuer?.[0]}>
          <input
            id="issuer"
            name="issuer"
            type="text"
            defaultValue={certification?.issuer ?? ""}
            className={formInputClasses}
          />
        </FormField>

        <FormField label="Description" htmlFor="description" error={state.fieldErrors?.description?.[0]}>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={certification?.description ?? ""}
            className={formInputClasses}
          />
        </FormField>

        <FormField label="Certificate URL" htmlFor="certificateUrl" error={state.fieldErrors?.certificateUrl?.[0]}>
          <input
            id="certificateUrl"
            name="certificateUrl"
            type="text"
            defaultValue={certification?.certificateUrl ?? ""}
            className={formInputClasses}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="Status" htmlFor="status" required>
            <select
              id="status"
              name="status"
              defaultValue={certification?.status ?? "draft"}
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
              defaultValue={certification?.sortOrder ?? 0}
              className={formInputClasses}
            />
          </FormField>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h4 font-semibold text-neutral-950">Badge image</h2>
        <ImageUploader
          label="Badge image"
          hiddenInputName="mediaId"
          folder="certifications"
          initialAsset={certification?.media}
        />
      </section>

      {state.status === "error" && (
        <p role="alert" className="text-body-sm text-red-600">
          {state.message}
        </p>
      )}

      <div>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving..." : certification ? "Save changes" : "Create certification"}
        </Button>
      </div>
    </form>
  );
}
