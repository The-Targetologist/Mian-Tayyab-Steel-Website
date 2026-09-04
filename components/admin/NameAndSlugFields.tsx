"use client";

import { useState } from "react";
import { FormField, formInputClasses } from "@/components/ui/FormField";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface NameAndSlugFieldsProps {
  nameFieldKey?: string;
  nameLabel?: string;
  defaultName?: string;
  defaultSlug?: string;
  nameError?: string;
  slugError?: string;
}

// Slug auto-generates from name until the user manually edits it — then it
// stops syncing (docs/10-admin-panel.md UX rule 2: "Auto-generate slug from
// title but allow editing"). `nameFieldKey`/`nameLabel` default to
// "name"/"Name" (Products/Collections/Services) but Posts uses "title" per
// its schema column — generalized here rather than duplicating this
// component for one renamed field.
export function NameAndSlugFields({
  nameFieldKey = "name",
  nameLabel = "Name",
  defaultName = "",
  defaultSlug = "",
  nameError,
  slugError,
}: NameAndSlugFieldsProps) {
  const [name, setName] = useState(defaultName);
  const [slug, setSlug] = useState(defaultSlug);
  const [slugEditedManually, setSlugEditedManually] = useState(Boolean(defaultSlug));

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <FormField label={nameLabel} htmlFor={nameFieldKey} required error={nameError}>
        <input
          id={nameFieldKey}
          name={nameFieldKey}
          type="text"
          required
          value={name}
          onChange={(event) => {
            const value = event.target.value;
            setName(value);
            if (!slugEditedManually) {
              setSlug(slugify(value));
            }
          }}
          className={formInputClasses}
        />
      </FormField>
      <FormField label="Slug" htmlFor="slug" required error={slugError}>
        <input
          id="slug"
          name="slug"
          type="text"
          required
          value={slug}
          onChange={(event) => {
            setSlug(event.target.value);
            setSlugEditedManually(true);
          }}
          className={formInputClasses}
        />
      </FormField>
    </div>
  );
}
