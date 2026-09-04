"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface DeleteEntityButtonProps {
  entityId: string;
  entityName: string;
  deleteAction: (id: string) => Promise<void>;
}

// Generalized from the Products increment's DeleteProductButton once a
// second real consumer (Collections) needed the identical pattern — same
// instinct as RepeaterField/ImageUploader/FaqPicker being built generic
// from the start where a second consumer was already known to be coming.
//
// Native confirm() for now rather than a styled ConfirmDialog — simple,
// accessible, and sufficient to satisfy docs/10-admin-panel.md UX rule 6
// ("destructive actions require confirmation"). A custom modal can replace
// this later without changing the action wiring.
//
// Plain onClick rather than <form action={...}> — deliberately avoided
// mixing React's form-action lifecycle with a manual router.refresh() call;
// that combination raced in testing (the delete genuinely succeeded
// server-side but the already-rendered list didn't reliably pick up the
// change). useTransition + a direct call keeps the sequencing explicit:
// delete resolves, then refresh, in order, inside one transition.
export function DeleteEntityButton({ entityId, entityName, deleteAction }: DeleteEntityButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete "${entityName}"? This cannot be undone.`)) return;

    startTransition(async () => {
      await deleteAction(entityId);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="text-body-sm font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}
