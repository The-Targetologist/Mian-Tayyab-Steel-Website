# 13 — Implementation Roadmap

## Rule

Do not ask Claude to "build the whole site" in one pass.

Each phase has a definition of done and must preserve previously approved behavior.

## Phase 0 — Discovery freeze

Complete:
- reference audit
- sitemap
- content model
- design direction
- wireframes
- design tokens

**No production UI code before approval.**

## Phase 1 — Project foundation

- initialize Next.js/TypeScript/Tailwind
- project folders
- lint/typecheck
- env example
- base fonts
- global CSS/tokens
- Supabase clients
- shared types

Definition of done:
- project runs
- no visual page work beyond foundation
- lint/typecheck pass

## Phase 2 — Global shell

- header
- nav
- mobile nav
- search shell
- footer
- Section/Container primitives
- buttons/typography/forms foundations

## Phase 3 — Homepage

Implement from approved wireframe/reference.

Order:
- hero
- product discovery
- application/collection discovery
- company/legacy
- optional service preview
- partner/certification proof
- CTA

After desktop, finish responsive behavior before moving on.

## Phase 4 — Product system

- database schema/migrations
- seed development products
- archive page
- dynamic product route
- gallery
- specs
- applications/features
- FAQs
- related products/services
- metadata

## Phase 5 — Collection/application system

- structured content blocks
- dynamic collection route
- product relationships
- tables
- selection guides
- FAQ
- SEO metadata

## Phase 6 — Services

- service schema
- archive
- detail
- galleries/capabilities
- product relationships
- FAQs

## Phase 7 — Company/static pages

- About
- FAQ
- Contact
- Privacy
- Terms

## Phase 8 — Blog/insights

- article schema
- archive
- article detail
- related content
- metadata/schema

## Phase 9 — Admin foundation

- auth
- route protection
- admin shell
- permission checks

## Phase 10 — Admin CRUD

Order:
1. Products
2. Collections
3. Services
4. Posts
5. FAQs
6. Locations
7. Partners/certifications
8. Settings
9. Inquiries

Do not build all forms at once. Validate each entity end to end.

## Phase 11 — Quote/contact workflow

- form
- validation
- file upload if required
- spam/rate controls
- database
- admin inquiry view
- notification mechanism if enabled

## Phase 12 — Search

- index/query implementation
- search result UI
- keyboard/accessibility
- empty state

## Phase 13 — SEO & migration

- metadata
- schema
- sitemap
- robots
- redirects
- canonical
- social cards

## Phase 14 — Performance/accessibility

- Lighthouse review
- bundle review
- image optimization
- focus/keyboard
- reduced motion
- contrast
- semantic structure

## Phase 15 — QA

See `15-qa-and-launch.md`.

## Commit discipline

Each phase should result in coherent commits.
Avoid giant commits mixing:
- schema changes
- unrelated design changes
- dependency upgrades
- multiple pages

## Claude workflow per phase

For each phase Claude should:
1. read relevant docs
2. inspect existing code before modifying
3. summarize intended changes
4. implement only current scope
5. run lint/typecheck/build/tests
6. report files changed
7. update `PROJECT_STATE.md`
8. stop instead of silently expanding scope
