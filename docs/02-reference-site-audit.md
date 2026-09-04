# 02 — Reference Site Audit

Primary reference: https://oht.com.pk/

Audit performed via direct fetch/inspection of the live homepage, `/products/`, `/collection/construction-steel/`, `/services/`, and `/about/` (2026-09-02). This is a structural/content audit, not a pixel-measured visual audit — the fetch method used renders semantic HTML/content, not computed CSS or a real viewport. Where exact pixel values (container width, grid gap, breakpoint px) would normally be recorded, this document states observed proportions/patterns instead of fabricating precision. A follow-up visual pass with real browser dev tools/screenshots is still recommended before finalizing pixel-exact tokens, but is not a blocker for provisional design-system work.

## Global navigation

**Logo/branding:** dual lockup (icon + wordmark), top-left, company name spelled out ("Osman Haji Tayyab (OHT) Steel").

**Primary nav (exact order observed):** Home · About · Products · Services · Contact.

**Utility bar:** address, phone number, email, and social links (Facebook, WhatsApp, LinkedIn) surfaced globally, separate from primary nav.

**CTAs:** "Get a Quote" (primary, filled) + "Call Us" (secondary, direct tel: link) — both present in the header, repeated at page end and in the footer.

**Search:** not present on the reference site.

### Requirement for our build (confirmed)
Create a navigation system that makes Products and Services easy to discover without becoming an oversized generic mega-menu.

Recommended desktop structure (unchanged from prior planning):
- Logo
- About
- Products
- Collections / Applications
- Services
- Blog
- Contact
- Search (an improvement over the reference, which has none)
- Request Quote CTA

Mobile: compact header, clear menu hierarchy, quote/contact action must remain easy to reach.

## Homepage content architecture

Confirmed section order on the reference homepage:

1. **Hero/value proposition** — "Pakistan's Trusted Structural Steel Importer Since 1960" + CTA. Positioning-led, not a SaaS-style abstract headline — the claim is a specific, factual heritage statement.
2. **Product grid** — 11 product cards (HRC, HRC Chequered, CRC, GP/Galvanized, I Beam, H Beam, Channel, Angle, Girders, MS Rail, Heshe/Galvalume Coils).
3. **Application/collection categories** — 6 cards (Construction, Structural, Fabrication, Coil Processing, Industrial, Roofing), visually distinct from the product grid above it.
4. **Trust/heritage section** — "70 Years as a Leading Steel Importer" narrative, paired with factory/production imagery (steel at temperature, packed rolls) rather than generic office photography.
5. **Partner credentials** — named, authorized-distributor logos (International Steel Limited, Aisha Steel Mills), not generic "as seen in" logo soup.
6. **Footer.**

### Why this works
It answers, in order: Who are you? What do you sell? How do I find the right steel? Why should I trust you? Who validates/partners with you? How do I contact you?

Our homepage should preserve this **decision logic**, but visual composition may be improved.

## Design language observed

- **Colour:** black text on light/white background is the dominant scheme — a monochrome, restrained palette rather than a colourful marketing palette. Colour is not the site's credibility mechanism; content specificity and photography are.
- **Typography:** clean sans-serif, moderate weight contrast between headline and body — no display/decorative fonts.
- **Density:** moderate-to-high; organized grid sections alternate with full-width photography breaks rather than uniform whitespace-heavy blocks.
- **Imagery:** product- and process-focused (factory floor, coils, cutting) — never lifestyle stock photography or abstract graphics.
- **Cards:** minimalist — image/icon + heading + short description, square-ish corners, no heavy shadow or glassmorphism.
- **Buttons:** solid fill for primary action, with generous surrounding whitespace rather than being crowded by other elements.
- **Section rhythm:** predominantly light background, with photography (not colour blocks) providing the visual break between sections — there is no dark hero or dark section observed on the pages audited.

These observations directly support the MTS design-direction rule of "industrial identity from composition/imagery, not decoration."

## Products archive

Confirmed layout:
- Short page intro restating heritage/experience (70 years) before the grid.
- Six collection/application entry points surfaced above or alongside the product grid (Construction Steel, Structural Steel, Steel Sheets & Plates, Steel Coils, Industrial Steel, Galvanized & Coated Steel).
- Product cards: name, short technical description (roughly 50–100 characters, e.g. "High strength steel produced through hot rolling for durability"), product image. No price, no stock status.
- No search/filter UI on the archive itself.
- Closing CTA: "Get a Quote" / "Call Us".

### Requirement (confirmed)
Products must be database-driven. Never hardcode one React page per product.

## Product detail pattern

Not separately fetched in this pass (blocked by earlier planning notes as "verify before final tokens") — prior planning-doc description stands and should be spot-checked visually before the product-detail template is finalized:
breadcrumb, gallery/lightbox, SEO-specific H1, intro copy, spec/value blocks, features, applications, WhatsApp/contact CTA, trust content, per-product FAQs, related products.

### Improvement opportunity (confirmed)
Our version should organize technical data more intentionally: quick summary, key specs, applications, grades/sizes, downloadable datasheet/brochure when available, inquiry CTA, related services, FAQs, related products. Avoid repeating generic company claims too many times on the same page.

## Application / collection pages

Confirmed via `/collection/construction-steel/` — this is a genuine long-form SEO landing page, not a filtered archive. Full section order observed (H2 level unless noted):

1. **H1:** "Construction Steel Supplier in Pakistan" — page-specific, not generic.
2. **What is Construction Steel?** — definitional/educational overview with benefit bullets.
3. **Why Steel is Preferred in Construction** — five-point value proposition (speed, strength, flexibility, durability, sustainability).
4. **Construction Steel Products Available at OHT** — visual grid of 10 linked product categories.
5. **Construction Steel Solutions** — four solution blocks (Structural Framework, Steel Fabrication, Roofing and Cladding, Industrial Flooring), each with an H3.
6. **Applications** — plain list of 16 use cases (building frames, bridges, warehouses, etc.).
7. **Industries We Serve** — 16-item industry list.
8. **Construction Steel Products Available at OHT (table)** — same product set repeated in a two-column table (Product / Primary Construction Applications) — a deliberate second pass at the same data in a more scannable technical format.
9. **How to Choose the Right Construction Steel** — four numbered (01–04) selection scenarios, each an H3.
10. **Construction Steel Comparison** — table (Product / Best Used For).
11. **Why Choose OHT?** — six numbered value propositions.
12. **Nationwide Supply Across Pakistan** — geographic service-area paragraph.
13. **Explore More** — three subsections: Related Products, Related Collections, Related Services.
14. **Frequently Asked Questions** — eight Q&A pairs.

This confirms the collection page is built from **repeatable modular blocks** (intro, benefit list, product grid, solution cards, plain use-case list, industry list, table, numbered guide, comparison table, related-content links, FAQ) — exactly the block model proposed in `09-content-and-database-model.md` and `10-admin-panel.md`. No block type observed here should be treated as required on every collection; the mix should vary by collection based on available content.

### Requirement (confirmed)
Collections must have editable rich modular content, not just title + body text.

## Services archive

Confirmed layout:
- Intro reinforces "trusted HRC and CRC supplier... 70 years" positioning even on the services page (cross-selling credibility, not just service-specific copy).
- Six service cards in a grid, each with: process image, service title (linked), 1–2 line benefit description.
- Services listed (exact names): Laser Cutting Services in Karachi, Steel Shearing Services, Steel Cutting Services (Manual & Machine), Steel Bending & Forming Services, Coil Cutting & Slitting Services, Steel Transportation Services (Karachi Only).
- A dedicated certification-badge section below the service grid (~11 badges referenced, including ISO and OHSAS-18001-style marks) — positioned specifically near services, i.e. tied to operational/process credibility rather than the whole-site trust section.
- Closing CTAs: "Get a Quote" + "Call Us" (direct tel: link).

**Note for MTS:** do not fabricate equivalent certification badges. This pattern (certifications placed near services, not just on About) is worth keeping as a slot in the service-archive template, populated only once real MTS certification data is supplied.

## Service detail pattern

Not separately fetched in this pass. Prior planning-doc description stands: breadcrumb, image gallery, service-specific H1/content, WhatsApp CTA, why-choose-us, service FAQs.

### Improvement opportunity (confirmed)
Add structured operational fields where known: materials supported, thickness/size limits, tolerance/capability, accepted drawing formats, turnaround guidance, service area. Do **not invent these values**. Admin fields may exist while data remains empty until MTS provides it.

## About page

Confirmed structure — a genuinely editorial, non-generic page:

1. **About Us** (H1)
2. **The Beginning of a Legacy** — founding story (named founders: brothers Osman and Muhammad).
3. **First Generation: The Foundation**
4. **Second Generation — Building on the Foundation**
5. **Third Generation — Shaping the Future**
6. **Our Vision**
7. **Our Mission**
8. **Why Choose OHT?**
9. **Company Profile** — downloadable PDF reference.

This is organized by **generational chapters**, not by "meet the team" bios — the company is presented as a continuous institution rather than a set of individual employee profiles. Imagery implied throughout is industrial/product (channels, girders, coils, galvanized sheet close-ups, factory packing), reinforcing durability/reliability rather than corporate lifestyle photography.

### Design implication (confirmed)
About should feel editorial and historical, not another generic icon-card page. MTS does not yet have confirmed generational/founder history — this section must use clearly marked placeholder structure until real company history is supplied, never a fabricated timeline.

## Contact page

Not separately fetched in this pass. Prior planning-doc description stands: contact introduction, multiple offices/warehouses (reference site shows two main offices and two warehouses), inquiry form, map embed.

### Requirement (confirmed)
Locations must be data-driven and independently editable.

## FAQ

Confirmed pattern: FAQs appear contextually on collection pages (8 Q&A pairs observed on the Construction Steel collection) in addition to any global FAQ page.

### Requirement (confirmed)
Support global FAQ groups, product-specific FAQs, service-specific FAQs, collection-specific FAQs.

## Blog

Referenced in the reference site's footer/quick-links ("Blogs") but not separately audited in this pass. Use a proper article model: title, slug, excerpt, body, featured image, author (optional), published date, category/tag, metadata, social image, canonical settings.

## Search

The reference site has **no search feature** — this is a gap MTS can improve on, not a pattern to copy. Our search should cover, at minimum: products, collections/applications, services, blog posts, core pages.

## What we should emulate

- business-first information hierarchy (who/what/how/why/who-validates/contact, in that order on the homepage)
- industrial credibility built from specific, factual claims (named founders, named distributor partners, precise process descriptions) rather than generic trust language
- substantial, genuinely useful technical/application content on collection pages
- repeatable modular block structure for collection pages (benefit list, product grid, solution cards, use-case list, industry list, tables, numbered guide, comparison table, related-content, FAQ)
- prominent, low-friction inquiry paths (Get a Quote + Call Us, repeated consistently)
- certifications placed contextually near the content they support (services), not just dumped on About

## What we should improve

- add real site search (reference has none)
- reduce content repetition (the reference repeats "70 years" / heritage messaging on nearly every page — MTS should state credibility clearly once per page, not as filler)
- stronger, more consistent component system across product/service/collection cards (reference cards read as minimally distinct from each other)
- more intentional technical-spec presentation (tables are functional but plain — MTS can improve scannability without adding decoration)
- clearer cross-linking among products, applications and services beyond the "Explore More" block
- accessible tables/galleries/accordions (not verifiable from this fetch method — must be checked in a real browser before launch)
- confirmed-responsive mobile layout (not verifiable from this fetch method — must be checked in a real browser before launch)

## What we should NOT copy blindly

- exact text (all reference copy above is paraphrased/summarized for structural understanding, not reproduced)
- exact imagery, logos, proprietary certificates/assets
- OHT's URL structure (MTS is net-new — see `12-seo-and-url-strategy.md`)
- accidental spacing/layout quirks
- unverified or MTS-inapplicable content values (OHT's "70 years", named partners, and certifications are OHT's facts, not MTS's — see `PROJECT_STATE.md` for what is/isn't confirmed for MTS)

## Still outstanding — real visual audit

The findings above are structural/content-level, gathered via content fetch rather than a rendered browser. Before finalizing **exact** pixel tokens (container max-width, grid gap, breakpoint values, header height, image aspect ratios), someone should still open the reference site in a real browser at 1440 / 1024 / 768 / 390 and record actual measurements. This is not required to proceed with provisional design-system work (see `07-design-system.md`), but should happen before those provisional values are locked as final.
