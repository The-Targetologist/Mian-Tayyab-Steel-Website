# 16 — Claude Project Rules

Paste/adapt this file as repository-level guidance for Claude.

## Project mission

Build a professional industrial steel website using the approved planning documents in `/docs`.

## Mandatory behavior

1. Read relevant `/docs` files before working.
2. Do not start implementation while the relevant planning stage is unresolved.
3. Never interpret "premium" as permission to invent a generic AI/SaaS visual style.
4. Preserve the approved industrial design direction.
5. Use real project content/assets. Never invent certifications, partners, years, statistics, technical tolerances, service capabilities or product specifications.
6. Ask for/project placeholders for missing factual content rather than fabricating it.
7. Public pages should be Server Components by default.
8. Keep Client Components narrowly scoped.
9. Use reusable typed components.
10. Do not hardcode separate React pages for every database-driven product/service/collection/article.
11. Keep Supabase access in a deliberate data layer rather than random UI components.
12. Validate all writes server-side.
13. Never expose privileged Supabase keys to client code.
14. Maintain accessible keyboard/focus behavior.
15. Preserve SEO URLs/metadata when migration requirements specify them.
16. Do not install packages merely because implementation is easier; first confirm the dependency is justified.
17. Do not redesign unrelated completed sections while implementing a new phase.
18. After each meaningful phase, run lint, typecheck and build where appropriate.
19. Update `docs/PROJECT_STATE.md` after meaningful work.
20. Do not claim a phase is complete with known TODOs hidden in code.

## Design rejection checklist

Reject your own output and revise if it has several of these traits:
- looks like a SaaS landing-page template
- giant centered headline with excessive empty space
- arbitrary gradients/glows
- every section uses rounded cards
- icon grids substitute for real content
- typography scale is oversized for technical content
- same layout repeated for product, service, about and collection pages
- random entrance animations on every element
- imagery feels generic/unrelated
- whitespace removes useful business information

## Before implementing a page

Confirm from docs:
- page goal
- information hierarchy
- approved wireframe
- design tokens
- reusable components
- data source/model
- SEO requirements
- responsive behavior

## If visual reference is available

Treat it as evidence, not inspiration-only.
Compare:
- proportions
- hierarchy
- image ratio
- alignment
- spacing rhythm
- density
- behavior

Do not make arbitrary stylistic substitutions unless the approved plan intentionally improves them.

## Code quality

- TypeScript strictness
- semantic HTML
- no avoidable `any`
- no giant monolithic page component
- avoid duplicated queries/types
- no inline secrets
- no dead code
- comment only where intent is not obvious

## Output at end of a work session

Report:
1. completed scope
2. files changed
3. validation commands/results
4. unresolved issues
5. next recommended phase

Then update `PROJECT_STATE.md`.
