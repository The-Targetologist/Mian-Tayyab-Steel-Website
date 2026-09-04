# 12 — SEO & URL Strategy

## Priority

MTS is a net-new website — there is no existing indexed Mian Tayyab Steel site/domain to migrate at this stage. No redirect map is required now. Use the clean semantic URL structure defined in `03-sitemap-and-page-goals.md`:

```text
/
/about
/products
/products/[slug]
/collections
/collections/[slug]
/services
/services/[slug]
/blog
/blog/[slug]
/faq
/contact
/privacy-policy
/terms
```

The reference site's URL patterns (e.g. `/collection/construction-steel/`, `/services/laser-cutting-services-in-karachi/`) are studied for information architecture only (see `02-reference-site-audit.md`) — they are not copied as MTS routes.

## If a legacy MTS site/domain is supplied later

Before production launch, if an existing indexed MTS site/domain exists:
1. crawl/export all current public URLs
2. map old URL → new URL
3. mark unchanged URLs
4. create permanent redirects for changed URLs
5. test every redirect
6. check canonical targets
7. update sitemap/internal links

Until such a site is supplied, this workflow does not apply.

## Metadata

Every indexable page should have intentional:
- title
- meta description
- canonical
- Open Graph title/description/image

Do not auto-generate weak metadata when editorial values exist.

## Heading rules

- one primary H1 per page
- H2/H3 hierarchy should reflect document structure
- do not use heading tags merely for visual sizing

## Structured data

Potential schema types:
- Organization
- BreadcrumbList
- FAQPage where valid and policy-appropriate
- Article / BlogPosting
- Service where useful
- Product only if page content actually fits applicable schema semantics; do not fabricate offer/pricing fields

## Sitemap

Generate dynamic sitemap from published content.
Include:
- pages
- products
- collections
- services
- posts

Exclude:
- admin
- drafts
- search result pages unless a deliberate SEO reason exists

## Robots

Production:
- allow public content
- block admin/private routes as appropriate

Staging/previews:
- must be noindex/disallowed appropriately to avoid duplicate indexing.

## Internal linking

Strategically connect:
- product ↔ collection
- product ↔ service
- article ↔ product/service/collection

## Collection SEO pages

Long-form content should remain useful to humans.
Avoid keyword stuffing and city-name dumping.

Use:
- clear intent matching
- product comparison
- practical application guidance
- FAQs
- contextual internal links

## Image SEO

- meaningful filenames
- accurate alt text
- no keyword-stuffed alt
- optimized dimensions/file size

## Core Web Vitals

SEO implementation includes performance:
- prevent layout shift
- optimize hero/LCP media
- minimize unnecessary client JS
- self-host fonts where appropriate/licensed
- use caching

## Search Console launch checklist

After production deployment/domain change:
- verify domain/property
- submit sitemap
- inspect critical URLs
- monitor indexing
- monitor 404s
- monitor redirect errors
- compare traffic/rankings after migration
