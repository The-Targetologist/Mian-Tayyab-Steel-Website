import "server-only";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { SearchResult, SearchResultType } from "@/types/content";

interface SearchContentRow {
  content_type: "product" | "collection" | "service" | "post";
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  rank: number;
}

const TYPE_TO_BASE_PATH: Record<SearchContentRow["content_type"], string> = {
  product: "/products",
  collection: "/collections",
  service: "/services",
  post: "/blog",
};

// "Core pages" (docs/02-reference-site-audit.md: search should cover "at
// minimum: products, collections/applications, services, blog posts, core
// pages") — static marketing pages have no dynamic body content to run
// through Postgres full-text search, so they're matched here as a small
// fixed list rather than a database row. Deliberately excludes Privacy
// Policy/Terms (placeholder legal pages, not something a high-intent
// visitor searches for per docs/03-sitemap-and-page-goals.md's search goal).
const CORE_PAGES: { title: string; excerpt: string; href: string; keywords: string[] }[] = [
  {
    title: "About",
    excerpt: "Learn about Mian Tayyab Steel.",
    href: "/about",
    keywords: ["about", "company", "who we are", "history"],
  },
  {
    title: "FAQ",
    excerpt: "Frequently asked questions.",
    href: "/faq",
    keywords: ["faq", "frequently asked questions", "help"],
  },
  {
    title: "Contact",
    excerpt: "Get in touch for a quote or inquiry.",
    href: "/contact",
    keywords: ["contact", "quote", "get in touch", "phone", "email", "reach us"],
  },
];

function searchCorePages(query: string): SearchResult[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 0);

  if (terms.length === 0) return [];

  return CORE_PAGES.filter((page) => {
    const haystack = `${page.title} ${page.excerpt} ${page.keywords.join(" ")}`.toLowerCase();
    return terms.some((term) => haystack.includes(term));
  }).map((page) => ({
    type: "page" as SearchResultType,
    title: page.title,
    excerpt: page.excerpt,
    href: page.href,
    // Core-page matches rank alongside real content rather than always
    // topping it — a fixed mid-range score, not 0 (would sort last) or a
    // very high value (would always win over genuinely relevant content).
    rank: 0.1,
  }));
}

// Single combined query across products/collections/services/posts (the
// search_content() Postgres function — see
// supabase/migrations/0012_search.sql), merged with the static core-pages
// match and re-sorted by rank. Empty/whitespace-only queries return no
// results rather than erroring on an empty tsquery.
export async function searchContent(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase.rpc("search_content", { search_query: trimmed });

  if (error) {
    throw new Error(`searchContent: ${error.message}`);
  }

  const contentResults: SearchResult[] = (data as SearchContentRow[]).map((row) => ({
    type: row.content_type,
    title: row.title,
    excerpt: row.excerpt,
    href: `${TYPE_TO_BASE_PATH[row.content_type]}/${row.slug}`,
    rank: row.rank,
  }));

  return [...contentResults, ...searchCorePages(trimmed)].sort((a, b) => b.rank - a.rank);
}
