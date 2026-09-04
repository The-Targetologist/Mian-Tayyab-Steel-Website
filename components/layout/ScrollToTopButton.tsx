"use client";

import { useEffect, useState } from "react";
import { ArrowUpIcon } from "@/components/ui/icons";

const SCROLL_THRESHOLD = 400;

// Positioned directly above the floating WhatsApp button (same relative
// placement as the reference site), hidden until the visitor has actually
// scrolled down — never visible at the very top of the page.
export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > SCROLL_THRESHOLD);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll back to top"
      className="fixed right-6 bottom-24 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-colors duration-fast hover:bg-brand-700"
    >
      <ArrowUpIcon />
    </button>
  );
}
