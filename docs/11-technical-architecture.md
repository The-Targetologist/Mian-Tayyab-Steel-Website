# 11 — Technical Architecture

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- Vercel

Package manager: npm unless project requirements change.

## Proposed repository shape

```text
/
├── app/
│   ├── (site)/
│   │   ├── page.tsx
│   │   ├── about/
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── collections/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── services/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── faq/
│   │   ├── contact/
│   │   └── search/
│   ├── admin/
│   ├── api/ (only where route handlers are justified)
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── layout/
│   ├── ui/
│   ├── products/
│   ├── collections/
│   ├── services/
│   ├── articles/
│   ├── forms/
│   └── admin/
├── lib/
│   ├── supabase/
│   ├── queries/
│   ├── actions/
│   ├── validation/
│   ├── seo/
│   └── utils/
├── types/
├── public/
└── docs/
```

MTS is a net-new website (no legacy site/domain to migrate). Routes use the clean structure above. If an existing indexed MTS site/domain is supplied later, reassess against `12-seo-and-url-strategy.md` before launch.

## Rendering strategy

Use Server Components for content pages by default.

Use Client Components only for:
- mobile menu
- gallery/lightbox
- interactive filters
- accordion if client interaction chosen
- admin forms/editors

## Data fetching

Create central typed query functions.

Examples:
```text
getPublishedProducts()
getProductBySlug(slug)
getCollectionBySlug(slug)
getServiceBySlug(slug)
getPublishedPosts()
```

Do not scatter raw Supabase queries throughout presentational components.

## Caching/revalidation

Content does not need to query the database uncached on every request.
Use appropriate Next.js caching/revalidation strategy.

On admin publish/update:
- revalidate affected path(s)
- revalidate related archive pages

Example product update may revalidate:
- `/products`
- `/products/[slug]`
- related collection pages
- homepage if product is featured

## Images

Use `next/image` where appropriate.

Need:
- explicit dimensions/aspect ratio
- responsive `sizes`
- modern output formats through Next optimization
- priority only for true above-fold critical images
- admin-enforced alt text workflow

## Forms

Preferred:
- server action or controlled API route
- schema validation server-side
- spam prevention
- rate limiting where practical
- safe file uploads
- database insert
- email notification optional/integrated later

Never trust client validation alone.

## Authentication

Supabase Auth for admin.

Need:
- secure cookie/session handling
- server-side route protection
- explicit authorization check
- sign in
- sign out
- password reset flow if client needs it

## Search

Phase 1 options:
- Postgres full-text / trigram search
- server-side combined query across content types

Do not add Algolia/third-party search until scale justifies it.

## Rich content

Avoid storing unsafe arbitrary HTML.
Options:
- controlled rich-text JSON
- Markdown with strict rendering/sanitization
- structured content blocks

Collections likely need structured blocks.

## Error handling

Need:
- custom 404
- content-not-found handling
- form errors
- admin fetch/save errors
- graceful image fallbacks where appropriate

## Observability

At launch consider:
- Vercel analytics/performance
- error tracking if project scope allows
- form/inquiry failure logging

## Environment variables

Document in `.env.example`, never commit secrets.

Potential:
```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY= # server-only, never prefixed with NEXT_PUBLIC_
NEXT_PUBLIC_SITE_URL=
```

`SUPABASE_SECRET_KEY` must never be exposed to browser code, referenced from a Client Component, or given a `NEXT_PUBLIC_` prefix. Create two Supabase clients in `lib/supabase/`:
- a browser/RLS-scoped client using `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, used for normal authenticated/public access
- a server-only privileged client using `SUPABASE_SECRET_KEY`, used only where an operation genuinely requires bypassing RLS
