"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateQuoteRequestStatus } from "@/lib/actions/admin/inquiries";
import { formInputClasses } from "@/components/ui/FormField";
import type { QuoteRequestStatus } from "@/types/content";

const STATUS_OPTIONS: { value: QuoteRequestStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "quoted", label: "Quoted" },
  { value: "closed", label: "Closed" },
  { value: "spam", label: "Spam" },
];

interface QuoteStatusSelectProps {
  quoteRequestId: string;
  status: QuoteRequestStatus;
}

// Plain onClick-equivalent (select + useTransition + router.refresh) rather
// than a <form action>, same reasoning as DeleteEntityButton — this is a
// single-field, save-immediately control, not a multi-field form.
export function QuoteStatusSelect({ quoteRequestId, status }: QuoteStatusSelectProps) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as QuoteRequestStatus;
    const previous = value;
    setValue(next);
    setError(null);

    startTransition(async () => {
      const result = await updateQuoteRequestStatus(quoteRequestId, next);
      if (result.status === "error") {
        setError(result.message ?? "Could not update status.");
        setValue(previous);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={value}
        onChange={handleChange}
        disabled={pending}
        className={`${formInputClasses} w-auto`}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p role="alert" className="text-caption text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
