"use client";

import { useId, useState } from "react";
import { formInputClasses } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export interface RepeaterFieldDef {
  key: string;
  label: string;
  required?: boolean;
}

interface RepeaterFieldProps {
  label: string;
  hiddenInputName: string;
  fields: RepeaterFieldDef[];
  initialItems?: Record<string, string>[];
  addLabel?: string;
}

// Generic repeater backing product specifications/features/applications
// (and reusable later for service capabilities/requirements — same
// label/value or title/description shapes). Serializes to a hidden JSON
// input on every change since these are structured arrays FormData can't
// represent natively.
export function RepeaterField({
  label,
  hiddenInputName,
  fields,
  initialItems = [],
  addLabel = "Add row",
}: RepeaterFieldProps) {
  const [items, setItems] = useState<Record<string, string>[]>(
    initialItems.length > 0 ? initialItems : [],
  );
  const baseId = useId();

  function updateItem(index: number, key: string, value: string) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  }

  function addItem() {
    setItems((prev) => [...prev, Object.fromEntries(fields.map((f) => [f.key, ""]))]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-body-sm font-medium text-neutral-900">{label}</p>
        <Button type="button" variant="text" onClick={addItem}>
          {addLabel}
        </Button>
      </div>

      <input type="hidden" name={hiddenInputName} value={JSON.stringify(items)} />

      {items.length === 0 && <p className="text-body-sm text-neutral-500">No rows yet.</p>}

      <div className="flex flex-col gap-3">
        {items.map((item, index) => (
          <div
            key={`${baseId}-${index}`}
            className="flex flex-col gap-2 rounded-md border border-neutral-100 p-3 sm:flex-row sm:items-start"
          >
            <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
              {fields.map((field) => (
                <input
                  key={field.key}
                  type="text"
                  placeholder={field.label}
                  required={field.required}
                  value={item[field.key] ?? ""}
                  onChange={(event) => updateItem(index, field.key, event.target.value)}
                  className={formInputClasses}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="shrink-0 text-body-sm font-medium text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
