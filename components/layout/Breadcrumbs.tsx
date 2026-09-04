import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema } from "@/lib/seo/schema";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// docs/04-information-architecture.md "Breadcrumb hierarchy" — e.g.
// Home > Products > Hot Rolled Steel. The last item has no href (current page).
// Also emits BreadcrumbList JSON-LD (docs/12-seo-and-url-strategy.md
// "Structured data") from the same `items` prop — every page using this
// component gets the schema automatically, no per-page wiring needed.
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <JsonLd data={buildBreadcrumbSchema(items)} />
      <ol className="flex flex-wrap items-center gap-1 text-body-sm text-neutral-500">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1">
              {index > 0 && (
                <span aria-hidden="true" className="text-neutral-300">
                  /
                </span>
              )}
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-brand-600">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className="text-neutral-900">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
