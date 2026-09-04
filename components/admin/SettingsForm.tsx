"use client";

import { useActionState } from "react";
import { RepeaterField } from "./RepeaterField";
import { ImageUploader } from "./ImageUploader";
import { FormField, formInputClasses } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import {
  initialSiteSettingsFormState,
  type SiteSettingsFormState,
} from "@/lib/validation/admin/settings";
import type { SiteSettings } from "@/types/content";

interface SettingsFormProps {
  action: (state: SiteSettingsFormState, formData: FormData) => Promise<SiteSettingsFormState>;
  settings: SiteSettings;
}

export function SettingsForm({ action, settings }: SettingsFormProps) {
  const [state, formAction, pending] = useActionState(action, initialSiteSettingsFormState);

  const socialLinkItems = Object.entries(settings.socialUrls).map(([platform, url]) => ({
    platform,
    url,
  }));

  return (
    <form action={formAction} className="flex flex-col gap-10">
      <section className="flex flex-col gap-5">
        <h2 className="text-h4 font-semibold text-neutral-950">Contact details</h2>

        <FormField label="Company legal name" htmlFor="companyLegalName" error={state.fieldErrors?.companyLegalName?.[0]}>
          <input
            id="companyLegalName"
            name="companyLegalName"
            type="text"
            defaultValue={settings.companyLegalName ?? ""}
            className={formInputClasses}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <FormField label="Primary phone" htmlFor="primaryPhone" error={state.fieldErrors?.primaryPhone?.[0]}>
            <input
              id="primaryPhone"
              name="primaryPhone"
              type="text"
              defaultValue={settings.primaryPhone ?? ""}
              className={formInputClasses}
            />
          </FormField>
          <FormField label="WhatsApp" htmlFor="whatsapp" error={state.fieldErrors?.whatsapp?.[0]}>
            <input
              id="whatsapp"
              name="whatsapp"
              type="text"
              defaultValue={settings.whatsapp ?? ""}
              className={formInputClasses}
            />
          </FormField>
          <FormField label="Primary email" htmlFor="primaryEmail" error={state.fieldErrors?.primaryEmail?.[0]}>
            <input
              id="primaryEmail"
              name="primaryEmail"
              type="email"
              defaultValue={settings.primaryEmail ?? ""}
              className={formInputClasses}
            />
          </FormField>
        </div>

        <RepeaterField
          label="Social links"
          hiddenInputName="socialLinks"
          fields={[
            { key: "platform", label: "Platform (e.g. facebook)", required: true },
            { key: "url", label: "URL", required: true },
          ]}
          initialItems={socialLinkItems}
          addLabel="Add social link"
        />
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h4 font-semibold text-neutral-950">Footer</h2>
        <FormField label="Footer description" htmlFor="footerDescription" error={state.fieldErrors?.footerDescription?.[0]}>
          <textarea
            id="footerDescription"
            name="footerDescription"
            rows={2}
            defaultValue={settings.footerDescription ?? ""}
            className={formInputClasses}
          />
        </FormField>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h4 font-semibold text-neutral-950">Default SEO</h2>

        <FormField label="Default SEO title" htmlFor="defaultSeoTitle" error={state.fieldErrors?.defaultSeoTitle?.[0]}>
          <input
            id="defaultSeoTitle"
            name="defaultSeoTitle"
            type="text"
            defaultValue={settings.defaultSeoTitle ?? ""}
            className={formInputClasses}
          />
        </FormField>
        <FormField label="Default meta description" htmlFor="defaultSeoDescription" error={state.fieldErrors?.defaultSeoDescription?.[0]}>
          <textarea
            id="defaultSeoDescription"
            name="defaultSeoDescription"
            rows={2}
            defaultValue={settings.defaultSeoDescription ?? ""}
            className={formInputClasses}
          />
        </FormField>
        <ImageUploader
          label="Default social share image"
          hiddenInputName="defaultOgImageId"
          folder="settings"
          initialAsset={settings.defaultOgImage}
        />
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h4 font-semibold text-neutral-950">Brochure</h2>
        <ImageUploader
          label="Company brochure (PDF)"
          hiddenInputName="brochureMediaId"
          folder="settings"
          initialAsset={settings.brochure}
        />
      </section>

      {state.status === "error" && (
        <p role="alert" className="text-body-sm text-red-600">
          {state.message}
        </p>
      )}
      {state.status === "success" && (
        <p role="status" className="text-body-sm text-brand-700">
          {state.message}
        </p>
      )}

      <div>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving..." : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
