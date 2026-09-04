"use client";

import { useState, useTransition } from "react";
import { createQuickFaq } from "@/lib/actions/admin/faqs";
import { formInputClasses } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { FaqOption } from "@/lib/queries/admin/faqs";

interface FaqPickerProps {
  hiddenInputName: string;
  options: FaqOption[];
  selectedIds: string[];
}

// "Select existing or create contextual FAQs" — docs/10-admin-panel.md.
// Reuses the same checkbox-with-hidden-inputs pattern as
// RelationCheckboxList, but needs local state (not a plain Server
// Component) since a newly-created FAQ must appear as a checked option
// immediately, without a full page reload.
export function FaqPicker({ hiddenInputName, options, selectedIds }: FaqPickerProps) {
  const [allOptions, setAllOptions] = useState(options);
  const [checked, setChecked] = useState(new Set(selectedIds));
  const [adding, setAdding] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleAddFaq() {
    setError(null);
    startTransition(async () => {
      const result = await createQuickFaq(question, answer);
      if (result.status === "error") {
        setError(result.message ?? "Could not create FAQ.");
        return;
      }
      if (result.faq) {
        setAllOptions((prev) => [...prev, result.faq!]);
        setChecked((prev) => new Set(prev).add(result.faq!.id));
        setQuestion("");
        setAnswer("");
        setAdding(false);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-body-sm font-medium text-neutral-900">FAQs</p>
        <button
          type="button"
          onClick={() => setAdding((prev) => !prev)}
          className="text-body-sm font-medium text-brand-600 hover:underline"
        >
          {adding ? "Cancel" : "Create new FAQ"}
        </button>
      </div>

      {adding && (
        <div className="flex flex-col gap-2 rounded-md border border-neutral-100 p-3">
          <input
            type="text"
            placeholder="Question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            className={formInputClasses}
          />
          <textarea
            placeholder="Answer"
            rows={2}
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            className={formInputClasses}
          />
          {error && (
            <p role="alert" className="text-body-sm text-red-600">
              {error}
            </p>
          )}
          <Button type="button" variant="secondary" onClick={handleAddFaq} disabled={pending} className="w-fit">
            {pending ? "Adding..." : "Add FAQ"}
          </Button>
          <p className="text-caption text-neutral-500">
            New FAQs are saved as drafts and won&apos;t appear publicly until published.
          </p>
        </div>
      )}

      {allOptions.map((option) =>
        checked.has(option.id) ? (
          <input key={option.id} type="hidden" name={hiddenInputName} value={option.id} />
        ) : null,
      )}

      {allOptions.length === 0 ? (
        <p className="text-body-sm text-neutral-500">No FAQs exist yet.</p>
      ) : (
        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto rounded-md border border-neutral-100 p-3">
          {allOptions.map((option) => (
            <label key={option.id} className="flex items-center gap-2 text-body-sm text-neutral-700">
              <input
                type="checkbox"
                checked={checked.has(option.id)}
                onChange={() => toggle(option.id)}
                className="rounded-sm border-neutral-300 text-brand-600 focus:ring-brand-600"
              />
              {option.question}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
