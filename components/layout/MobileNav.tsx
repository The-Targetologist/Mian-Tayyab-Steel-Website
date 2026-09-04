"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { primaryNav, quoteCta } from "./navigation";
import { Button } from "@/components/ui/Button";
import { MenuIcon, CloseIcon, PhoneIcon } from "@/components/ui/icons";

interface MobileNavProps {
  phone: string;
  isPlaceholderPhone: boolean;
}

export function MobileNav({ phone, isPlaceholderPhone }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    closeButtonRef.current?.focus();
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

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Open menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-neutral-700 transition-colors duration-fast hover:bg-neutral-50 hover:text-brand-600"
      >
        <MenuIcon />
      </button>

      {open && (
        <div role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-50 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-4">
            <span className="text-lg font-bold text-neutral-950">Menu</span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-50"
            >
              <CloseIcon />
            </button>
          </div>

          <nav aria-label="Primary" className="flex flex-col gap-1 px-4 py-6">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className="rounded-md px-3 py-3 text-base font-medium text-neutral-900 hover:bg-neutral-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3 px-4">
            <Button href={quoteCta.href} variant="primary" className="w-full" onClick={close}>
              {quoteCta.label}
            </Button>
            <Button
              href={`tel:${phone.replace(/\s+/g, "")}`}
              variant="secondary"
              className="flex w-full items-center justify-center gap-2"
              title={isPlaceholderPhone ? "Placeholder number — update in Site Settings" : undefined}
            >
              <PhoneIcon width={16} height={16} />
              Call Us
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
