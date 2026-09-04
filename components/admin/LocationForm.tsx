"use client";

import { useActionState } from "react";
import { FormField, formInputClasses } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { initialLocationFormState, type LocationFormState } from "@/lib/validation/admin/location";
import type { Location } from "@/types/content";

interface LocationFormProps {
  action: (state: LocationFormState, formData: FormData) => Promise<LocationFormState>;
  location?: Location;
}

export function LocationForm({ action, location }: LocationFormProps) {
  const [state, formAction, pending] = useActionState(action, initialLocationFormState);

  return (
    <form action={formAction} className="flex flex-col gap-10">
      <section className="flex flex-col gap-5">
        <h2 className="text-h4 font-semibold text-neutral-950">Basics</h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="Name" htmlFor="name" required error={state.fieldErrors?.name?.[0]}>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={location?.name ?? ""}
              className={formInputClasses}
            />
          </FormField>
          <FormField label="Type" htmlFor="locationType" required>
            <select
              id="locationType"
              name="locationType"
              defaultValue={location?.locationType ?? "office"}
              className={formInputClasses}
            >
              <option value="office">Office</option>
              <option value="warehouse">Warehouse</option>
              <option value="yard">Yard</option>
              <option value="facility">Facility</option>
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <FormField label="Status" htmlFor="status" required>
            <select id="status" name="status" defaultValue={location?.status ?? "draft"} className={formInputClasses}>
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
              defaultValue={location?.sortOrder ?? 0}
              className={formInputClasses}
            />
          </FormField>
          <div className="flex items-end pb-2.5">
            <label className="flex items-center gap-2 text-body-sm font-medium text-neutral-900">
              <input
                type="checkbox"
                name="isPrimary"
                defaultChecked={location?.isPrimary ?? false}
                className="rounded-sm border-neutral-300 text-brand-600 focus:ring-brand-600"
              />
              Primary location
            </label>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h4 font-semibold text-neutral-950">Address</h2>

        <FormField label="Address line 1" htmlFor="addressLine1" required error={state.fieldErrors?.addressLine1?.[0]}>
          <input
            id="addressLine1"
            name="addressLine1"
            type="text"
            required
            defaultValue={location?.addressLine1 ?? ""}
            className={formInputClasses}
          />
        </FormField>
        <FormField label="Address line 2" htmlFor="addressLine2" error={state.fieldErrors?.addressLine2?.[0]}>
          <input
            id="addressLine2"
            name="addressLine2"
            type="text"
            defaultValue={location?.addressLine2 ?? ""}
            className={formInputClasses}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="City" htmlFor="city" required error={state.fieldErrors?.city?.[0]}>
            <input
              id="city"
              name="city"
              type="text"
              required
              defaultValue={location?.city ?? ""}
              className={formInputClasses}
            />
          </FormField>
          <FormField label="Province" htmlFor="province" error={state.fieldErrors?.province?.[0]}>
            <input
              id="province"
              name="province"
              type="text"
              defaultValue={location?.province ?? ""}
              className={formInputClasses}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="Postal code" htmlFor="postalCode" error={state.fieldErrors?.postalCode?.[0]}>
            <input
              id="postalCode"
              name="postalCode"
              type="text"
              defaultValue={location?.postalCode ?? ""}
              className={formInputClasses}
            />
          </FormField>
          <FormField label="Country" htmlFor="country" required error={state.fieldErrors?.country?.[0]}>
            <input
              id="country"
              name="country"
              type="text"
              required
              defaultValue={location?.country ?? "Pakistan"}
              className={formInputClasses}
            />
          </FormField>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h4 font-semibold text-neutral-950">Contact &amp; maps</h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="Phone" htmlFor="phone" error={state.fieldErrors?.phone?.[0]}>
            <input
              id="phone"
              name="phone"
              type="text"
              defaultValue={location?.phone ?? ""}
              className={formInputClasses}
            />
          </FormField>
          <FormField label="Email" htmlFor="email" error={state.fieldErrors?.email?.[0]}>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={location?.email ?? ""}
              className={formInputClasses}
            />
          </FormField>
        </div>

        <FormField label="Map URL" htmlFor="mapUrl" error={state.fieldErrors?.mapUrl?.[0]}>
          <input
            id="mapUrl"
            name="mapUrl"
            type="text"
            placeholder="https://maps.google.com/..."
            defaultValue={location?.mapUrl ?? ""}
            className={formInputClasses}
          />
        </FormField>
        <FormField label="Map embed URL" htmlFor="mapEmbedUrl" error={state.fieldErrors?.mapEmbedUrl?.[0]}>
          <input
            id="mapEmbedUrl"
            name="mapEmbedUrl"
            type="text"
            placeholder="https://www.google.com/maps/embed?..."
            defaultValue={location?.mapEmbedUrl ?? ""}
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
          {pending ? "Saving..." : location ? "Save changes" : "Create location"}
        </Button>
      </div>
    </form>
  );
}
