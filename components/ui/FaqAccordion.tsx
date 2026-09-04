"use client";

import { useId, useState } from "react";
import type { Faq } from "@/types/content";
import { cn } from "@/lib/utils/cn";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildFaqSchema } from "@/lib/seo/schema";

// Generic FAQ accordion — used wherever product/service/collection/global
// FAQs are shown (docs/08-component-system.md "Content components"). Also
// emits FAQPage JSON-LD (docs/12-seo-and-url-strategy.md "Structured data":
// "FAQPage where valid and policy-appropriate") from the same `faqs` prop —
// only ever real, published FAQs, since that's all the public queries ever
// pass in here.
export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const baseId = useId();

  if (faqs.length === 0) return null;

  return (
    <div className="divide-y divide-neutral-100 border-y border-neutral-100">
      <JsonLd data={buildFaqSchema(faqs)} />
      {faqs.map((faq) => {
        const open = openId === faq.id;
        const panelId = `${baseId}-panel-${faq.id}`;
        const buttonId = `${baseId}-button-${faq.id}`;

        return (
          <div key={faq.id}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : faq.id)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left text-body font-medium text-neutral-950"
              >
                {faq.question}
                <span aria-hidden="true" className={cn("shrink-0 transition-transform duration-fast", open && "rotate-45")}>
                  +
                </span>
              </button>
            </h3>
            {open && (
              <div id={panelId} role="region" aria-labelledby={buttonId} className="pb-4 text-body-sm text-neutral-600">
                {faq.answerRichtext}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
