import type { ReactNode } from "react";

export const formInputClasses =
  "w-full rounded-md border border-neutral-200 bg-white px-4 py-2.5 text-body text-neutral-900 placeholder:text-neutral-300 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

// Consistent label/input/error structure — docs/07-design-system.md §14
// Form System.
export function FormField({ label, htmlFor, required, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-body-sm font-medium text-neutral-900">
        {label}
        {required && (
          <span className="text-brand-600" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-body-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
