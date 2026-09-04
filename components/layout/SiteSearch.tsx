"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, CloseIcon } from "@/components/ui/icons";

// Real search (Phase 12) — submits to /search?q=..., the same combined
// full-text search across products/collections/services/posts/core pages
// used by the standalone /search page (lib/queries/search.ts). Navigating
// there (rather than showing live results inline) keeps this overlay a
// simple, fully keyboard-native form — no debounced-fetch/typeahead
// complexity beyond what docs/11-technical-architecture.md's "Phase 1
// options" call for.
export function SiteSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dialogId = useId();
  const router = useRouter();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    inputRef.current?.focus();
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setOpen(false);
    setQuery("");
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        aria-label="Search"
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-neutral-700 transition-colors duration-fast hover:bg-neutral-50 hover:text-brand-600"
      >
        <SearchIcon />
      </button>

      {open && (
        <div
          id={dialogId}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          className="fixed inset-0 z-50 flex items-start justify-center bg-neutral-950/60 px-4 pt-24"
        >
          <div className="w-full max-w-(--container-sm) rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-h4 font-semibold text-neutral-950">Search</h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close search"
                className="rounded-md p-2 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
              >
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleSubmit} role="search" className="mt-4">
              <label htmlFor={`${dialogId}-input`} className="sr-only">
                Search
              </label>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  id={`${dialogId}-input`}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search products, collections, services..."
                  className="w-full rounded-md border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-600 focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-md bg-brand-600 px-4 py-3 text-sm font-medium text-white hover:bg-brand-700"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
