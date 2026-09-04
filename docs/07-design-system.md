# 07 — Design System

## Project
Mian Tayyab Steel (MTS)

## Purpose
Define a consistent visual system before implementation so Claude/Cursor does not invent styles page by page.

## Status: Provisional — pending final brand/logo approval

The token values in this document (colour hex, typography, spacing, container, radius, motion) are a **provisional, internally-consistent system**, derived from the confirmed MTS direction (blue-led industrial theme, restrained/technical character) and the structural findings in `02-reference-site-audit.md`. They are real, usable values — not placeholders left blank — but they are not final brand values.

They must be used consistently across all pages built during this phase so the site is coherent, and they should be swapped in one place (this file + the CSS token layer) once final logo artwork and brand HEX values are supplied. Do not leave values undefined while implementation proceeds.

---

# 1. Colour System

## Primary Family
Blue industrial palette — deep navy/steel blue for authority, medium industrial blue for interaction, pale blue-grey for subtle surfaces. No purple, neon, or SaaS-gradient hues.

```css
--color-brand-950: #0B1E33;  /* near-navy-black: dark hero/footer sections */
--color-brand-900: #102A45;  /* header dark state, strong contrast surfaces */
--color-brand-800: #16395C;  /* strong brand surfaces, dark section fill */
--color-brand-700: #1D4E79;  /* secondary interactive/hover-dark */
--color-brand-600: #26629A;  /* primary buttons, links, interactive default */
--color-brand-500: #3878B5;  /* hover/lighter interactive state */
--color-brand-100: #DCE7F0;  /* pale blue-grey backgrounds, subtle section fill */
--color-brand-50:  #F1F5F9;  /* near-white blue-tinted surface */
```

Usage:
- 950 / 900: dark hero/footer/header states, major contrast sections
- 800 / 700: strong brand surfaces, dark section fills
- 600 / 500: buttons, links, interactive states
- 100 / 50: subtle backgrounds and supporting surfaces

## Neutral Family

```css
--color-neutral-950: #14171A; /* charcoal — headings on light, dark technical contrast */
--color-neutral-900: #1D2226; /* primary body text */
--color-neutral-700: #3D4448; /* secondary text */
--color-neutral-500: #6B7378; /* muted text, captions */
--color-neutral-300: #A8AEB2; /* disabled/placeholder text */
--color-neutral-200: #C9CDD0; /* strong borders, table dividers */
--color-neutral-100: #E4E6E8; /* subtle borders */
--color-neutral-50:  #F5F6F7; /* off-white section backgrounds */
--color-white:       #FFFFFF;
```

Use neutrals for:
- body text
- borders
- technical tables
- captions
- section backgrounds
- muted UI

## Colour Rule
Do not add random accent colours.

A new accent colour must have a business or UX reason. (No accent colour is defined provisionally — none has a confirmed business reason yet.)

---

# 2. Typography System

One family, used for both heading and body via weight contrast — restrained rather than a decorative display face.

```css
--font-sans: "Inter", system-ui, -apple-system, sans-serif;
--font-heading: "Inter", system-ui, -apple-system, sans-serif;
```

Provisional choice: **Inter**, loaded via `next/font/google` (self-hosted at build time, no runtime request, no licensing concern). It reads as neutral/technical/highly legible rather than "SaaS" specifically — chosen for readability at small technical-content sizes over character. If final brand typography is supplied later, swap the token value only; no component should reference a font name directly.

## Heading Scale

Desktop / mobile (rem, 16px root). Deliberately controlled — no 70–100px hero type.

```css
--text-display: 3rem / 2.25rem;     /* 48px / 36px — used sparingly, e.g. About legacy sections */
--text-h1:      2.5rem / 2rem;      /* 40px / 32px */
--text-h2:      2rem / 1.75rem;     /* 32px / 28px */
--text-h3:      1.5rem / 1.375rem;  /* 24px / 22px */
--text-h4:      1.25rem;            /* 20px */
--text-h5:      1.125rem;           /* 18px */
--text-body-lg: 1.125rem;           /* 18px */
--text-body:    1rem;               /* 16px */
--text-body-sm: 0.875rem;           /* 14px */
--text-caption: 0.75rem;            /* 12px */
```

Desktop H1 stays commercially practical (40px), not oversized. Mobile headings scale down intentionally rather than via `clamp()` guesswork.

**Implementation convention (Phase 2):** each size above is implemented as a Tailwind theme token at its mobile value; sizes with a distinct desktop value get a paired `-lg` token (e.g. `--text-h1` / `--text-h1-lg`), applied as `className="text-h1 lg:text-h1-lg"`. `--text-h4`, `--text-h5`, `--text-body*` and `--text-caption` have one value at all sizes (no `-lg` pair).

## Weight System

```css
--font-regular:  400;
--font-medium:   500;
--font-semibold: 600;
--font-bold:     700;
```

Avoid excessive use of extra-bold (800/900) weights — reserve `--font-bold` for H1/H2 and primary CTAs only.

---

# 3. Spacing System

4px base scale (rem, 16px root):

```css
--space-1:  0.25rem;  /* 4px */
--space-2:  0.5rem;   /* 8px */
--space-3:  0.75rem;  /* 12px */
--space-4:  1rem;     /* 16px */
--space-5:  1.25rem;  /* 20px */
--space-6:  1.5rem;   /* 24px */
--space-8:  2rem;     /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

Do not use arbitrary spacing values unless a component genuinely requires one.

Section spacing should be intentional and responsive — e.g. section vertical padding uses `--space-16`/`--space-20`/`--space-24` depending on content weight, scaling down at mobile (typically `--space-10`/`--space-12`).

---

# 4. Container System

```css
--container-sm: 40rem;   /* 640px — narrow forms, modals */
--container-md: 56rem;   /* 896px — long-form reading width (article/collection body copy) */
--container-lg: 72rem;   /* 1152px — standard section container */
--container-xl: 82.5rem; /* 1320px — main marketing max-width: product grids, wide tables */
```

The main marketing website uses `--container-xl` as its consistent max-width.

Long-form reading content (article body, collection prose) uses `--container-md` for readability.

Technical tables and product grids may use `--container-xl` for width, but table content itself should not force horizontal scroll on desktop.

---

# 5. Grid System

Primary grid:
- 12-column desktop
- simplified tablet grid
- single/controlled multi-column mobile

Use grid to create:
- product layouts
- split-content sections
- specification layouts
- service layouts
- article structures

Do not center everything by default.

---

# 6. Border Radius

Industrial design should avoid excessive softness.

```css
--radius-sm: 2px;  /* inputs, small tags, table cells */
--radius-md: 4px;  /* buttons, cards */
--radius-lg: 8px;  /* larger media/image containers only */
```

Avoid making every card heavily rounded.

Technical areas (tables, spec grids) use `--radius-sm` or square corners.

---

# 7. Borders

Borders should help create technical structure.

Preferred:
- subtle neutral borders
- stronger divider lines for tables/specification sections
- blue emphasis where necessary

Avoid decorative glowing borders.

---

# 8. Shadows

Use shadows sparingly.

Preferred:
- light elevation for dropdowns
- subtle card separation where necessary
- strong focus on border/contrast rather than floating cards

Avoid:
- heavy SaaS card shadows
- neon glows
- large blurred shadows on every component

---

# 9. Buttons

Required button styles:

## Primary
Blue filled button.

Use for:
- Request Quote
- Contact
- important conversion actions

## Secondary
Outline / neutral button.

Use for:
- View Products
- Learn More
- Download Brochure

## Text Link
Simple arrow/text treatment.

Use for:
- card navigation
- related content
- blog links

Button rules:
- readable height
- restrained radius
- clear hover
- visible keyboard focus
- no unnecessary gradients

---

# 10. Cards

Cards should be content-driven.

Possible card types:

- Product Card
- Service Card
- Collection Card
- Blog Card
- Location Card
- Related Product Card

Do not force all card types to share identical layout.

Shared elements may include:
- border
- radius logic
- image treatment
- typography hierarchy
- interaction behaviour

---

# 11. Product Image Ratios

Define consistent ratios for:

- archive cards
- related products
- product gallery
- collection product grids

Use `object-fit` intentionally.

Product imagery should not appear randomly cropped.

---

# 12. Technical Tables

Technical tables are part of the visual identity.

Requirements:
- high readability
- clear row hierarchy
- restrained borders
- strong mobile handling
- no unnecessary decorative styling

Mobile options:
- stacked key/value layout
- horizontally scrollable table only where appropriate
- responsive comparison cards for complex comparisons

---

# 13. Icons

Icons should be:
- simple
- consistent
- line-based or restrained solid
- used only where they improve scanning

Avoid:
- random oversized icon circles
- multi-colour icon packs
- decorative icon sections with weak content

---

# 14. Form System

Forms should use consistent:
- label hierarchy
- input height
- border styles
- textarea sizing
- focus states
- error states
- success states

Quote form may include:
- name
- company
- phone
- email
- product/service
- quantity
- required dimensions
- delivery city
- message
- attachment

---

# 15. Navigation System

Header should feel strong and professional.

Potential elements:
- MTS logo
- main navigation
- Products
- Collections / Applications
- Services
- About
- Blog
- Contact
- Search
- Quote CTA

Mobile navigation must be properly designed, not treated as an afterthought.

---

# 16. Section Background System

Possible section states:

- white
- off-white
- pale blue-grey
- deep navy
- dark neutral

Do not alternate section colours mechanically.

Background choices should support content hierarchy.

---

# 17. Motion Tokens

```css
--duration-fast:   120ms;  /* hover/focus state changes */
--duration-normal: 200ms;  /* menu/accordion/gallery transitions */
--duration-slow:   320ms;  /* section reveal, modal/lightbox open */
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
```

Avoid page-specific arbitrary animation timings.

---

# 18. Accessibility

Minimum requirements:
- strong text contrast
- visible focus states
- correct semantic heading hierarchy
- accessible forms
- keyboard-friendly navigation
- alt text support
- responsive typography

---

# 19. Design System Approval Rule

The provisional tokens above (palette, typography, container width, spacing, radius, motion) are approved for use in Phase 1–3 foundation and initial high-fidelity page work.

Before building large page sections, confirm the remaining page-specific patterns not yet locked:
- buttons (final states beyond the direction in §9)
- card language per card type
- product card composition
- navigation final behaviour
- technical table style

Once final logo/brand HEX values are supplied, replace the provisional colour values in §1 (and this file's status banner) with production values — do not change the token *names*, only their values, so components never need to change.
