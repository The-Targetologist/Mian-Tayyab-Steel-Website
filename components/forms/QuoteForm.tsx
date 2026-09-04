"use client";

import { useActionState } from "react";
import { usePathname } from "next/navigation";
import { submitQuoteRequest } from "@/lib/actions/quote-request";
import { initialQuoteRequestFormState } from "@/lib/validation/quote-request";
import { FormField, formInputClasses } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/icons";
import { FileDropzone } from "./FileDropzone";

export function QuoteForm() {
  const pathname = usePathname();
  const [state, formAction, pending] = useActionState(
    submitQuoteRequest,
    initialQuoteRequestFormState,
  );

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-4 rounded-md border border-neutral-100 bg-white p-10 text-center"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <CheckIcon width={28} height={28} strokeWidth={2} />
        </div>
        <h3 className="text-h4 font-semibold text-neutral-950">Inquiry sent</h3>
        <p className="max-w-sm text-body text-neutral-600">{state.message}</p>
        <Button href="/" variant="secondary" className="mt-2">
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="sourcePage" value={pathname} />
      {/* Honeypot — hidden from real users via CSS, not display:none, so screen readers/autofill still treat it as decoy */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Name" htmlFor="name" required error={state.fieldErrors?.name?.[0]}>
          <input id="name" name="name" type="text" required className={formInputClasses} />
        </FormField>
        <FormField label="Company" htmlFor="company" error={state.fieldErrors?.company?.[0]}>
          <input id="company" name="company" type="text" className={formInputClasses} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Email" htmlFor="email" required error={state.fieldErrors?.email?.[0]}>
          <input id="email" name="email" type="email" autoComplete="email" required className={formInputClasses} />
        </FormField>
        <FormField label="Phone" htmlFor="phone" required error={state.fieldErrors?.phone?.[0]}>
          <input id="phone" name="phone" type="tel" autoComplete="tel" required className={formInputClasses} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Delivery city" htmlFor="city" error={state.fieldErrors?.city?.[0]}>
          <input id="city" name="city" type="text" className={formInputClasses} />
        </FormField>
        <FormField label="Quantity" htmlFor="quantityText" error={state.fieldErrors?.quantityText?.[0]}>
          <input id="quantityText" name="quantityText" type="text" placeholder="e.g. 5 tons" className={formInputClasses} />
        </FormField>
      </div>

      <FormField label="Specification / dimensions" htmlFor="specificationText" error={state.fieldErrors?.specificationText?.[0]}>
        <textarea id="specificationText" name="specificationText" rows={3} className={formInputClasses} />
      </FormField>

      <FormField label="Message" htmlFor="message" error={state.fieldErrors?.message?.[0]}>
        <textarea id="message" name="message" rows={4} className={formInputClasses} />
      </FormField>

      <FormField label="Attachment (optional)" htmlFor="attachment">
        <FileDropzone
          id="attachment"
          name="attachment"
          accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
          hint="Image or PDF, up to 10MB — drawings or specs."
          error={state.fieldErrors?.attachment?.[0]}
        />
      </FormField>

      {state.status === "error" && (
        <p role="alert" className="text-body-sm text-red-600">
          {state.message}
        </p>
      )}

      <Button type="submit" variant="primary" disabled={pending} className="w-fit">
        {pending ? "Sending..." : "Send Inquiry"}
      </Button>
    </form>
  );
}
