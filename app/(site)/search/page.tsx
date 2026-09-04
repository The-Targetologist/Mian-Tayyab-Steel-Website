import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/layout/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { searchContent } from "@/lib/queries/search";
import type { SearchResultType } from "@/types/content";

// Search result pages are noindexed (docs/12-seo-and-url-strategy.md: exclude
// "search result pages unless a deliberate SEO reason exists").
export const metadata: Metadata = {
  title: "Search | Mian Tayyab Steel",
  robots: { index: false },
};

const TYPE_LABELS: Record<SearchResultType, string> = {
  product: "Product",
  collection: "Collection",
  service: "Service",
  post: "Article",
  page: "Page",
};

const BROWSE_LINKS = [
  { label: "Products", href: "/products" },
  { label: "Collections", href: "/collections" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
];

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await searchContent(query) : [];

  return (
    <Section background="white">
      <div className="flex flex-col gap-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />

        <div className="max-w-2xl">
          <p className="text-sm font-medium tracking-wide text-brand-600 uppercase">Search</p>
          <h1 className="mt-2 text-h1 font-bold text-neutral-950 lg:text-h1-lg">
            {query ? `Results for "${query}"` : "Search"}
          </h1>
        </div>

        <form action="/search" method="GET" className="max-w-(--container-sm)" role="search">
          <label htmlFor="search-page-input" className="sr-only">
            Search
          </label>
          <div className="flex gap-2">
            <input
              id="search-page-input"
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search products, collections, services, articles..."
              className="w-full rounded-md border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-600 focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="shrink-0 rounded-md bg-brand-600 px-5 py-3 text-sm font-medium text-white hover:bg-brand-700"
            >
              Search
            </button>
          </div>
        </form>

        {!query ? (
          <p className="text-body-lg text-neutral-700">Enter a search term above to get started.</p>
        ) : results.length === 0 ? (
          <div className="flex flex-col gap-4">
            <p className="text-body-lg text-neutral-700">
              No results found for &quot;{query}&quot;. Try a different term, or browse:
            </p>
            <ul className="flex flex-wrap gap-2">
              {BROWSE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex rounded-md border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 hover:border-brand-600 hover:text-brand-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ul className="flex max-w-(--container-md) flex-col gap-6">
            {results.map((result) => (
              <li key={`${result.type}-${result.href}`} className="border-b border-neutral-100 pb-6 last:border-0">
                <Link href={result.href} className="group flex flex-col gap-1">
                  <span className="inline-flex w-fit rounded-sm bg-neutral-100 px-2 py-0.5 text-caption font-medium text-neutral-600">
                    {TYPE_LABELS[result.type]}
                  </span>
                  <span className="text-h5 font-semibold text-neutral-950 group-hover:text-brand-600">
                    {result.title}
                  </span>
                  {result.excerpt && <span className="text-body-sm text-neutral-600">{result.excerpt}</span>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  );
}
