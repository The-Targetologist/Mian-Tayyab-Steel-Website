# OHT-Style Industrial Website — Planning Pack

> Purpose: plan a production-grade Next.js industrial/steel website before writing implementation code.

## Core rule

This is **not** a generic AI website project. Do not begin UI implementation from vague prompts such as "make it modern", "make it premium", or "clone this website".

The project must move through documented stages:

1. Reference audit
2. Business/content understanding
3. Sitemap and page goals
4. Information architecture
5. Design direction
6. Wireframes
7. Design system
8. Component system
9. Content/data model
10. Admin UX
11. Technical architecture
12. SEO/migration planning
13. Implementation roadmap
14. QA/launch

## Reference site

Primary reference: https://oht.com.pk/

The reference is used to understand:
- industrial visual language
- content depth
- page hierarchy
- product/service presentation
- trust signals
- SEO landing-page strategy
- conversion paths

Do not copy proprietary text, photography, logos, or branding unless the project owner has rights/permission. Recreate the required structure and quality using project-owned assets/content.

## Recommended stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase Postgres
- Supabase Auth
- Supabase Storage
- Vercel
- Server Components by default
- Client Components only where interaction requires them

## Read order

1. `docs/01-project-brief.md`
2. `docs/02-reference-site-audit.md`
3. `docs/03-sitemap-and-page-goals.md`
4. `docs/04-information-architecture.md`
5. `docs/05-design-direction.md`
6. `docs/06-wireframe-spec.md`
7. `docs/07-design-system.md`
8. `docs/08-component-system.md`
9. `docs/09-content-and-database-model.md`
10. `docs/10-admin-panel.md`
11. `docs/11-technical-architecture.md`
12. `docs/12-seo-and-url-strategy.md`
13. `docs/13-implementation-roadmap.md`
14. `docs/14-responsive-accessibility-performance.md`
15. `docs/15-qa-and-launch.md`
16. `docs/16-claude-project-rules.md`
17. `docs/PROJECT_STATE.md`

## Stage gates

### Gate A — no code
Do not write frontend code until documents 01–07 are reviewed and the design direction is accepted.

### Gate B — no database improvisation
Do not create Supabase tables until documents 09–10 are accepted.

### Gate C — no page-by-page duplication
Dynamic content types must use reusable templates/components and data-driven routes.

### Gate D — no generic AI patterns
Reject layouts that depend on:
- giant centered SaaS hero text
- decorative gradient blobs
- arbitrary glassmorphism
- icon-card grids with invented claims
- excessive pill badges
- random statistics
- animation added only to make the page look "advanced"

### Gate E — quality check
A page is not complete because it renders. It must pass visual, responsive, content, SEO, accessibility and performance QA.
