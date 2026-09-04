# 14 — Responsive, Accessibility & Performance

## Responsive philosophy

Responsive design is not "desktop, then stack everything".

Each breakpoint should preserve:
- information priority
- tap targets
- readable technical data
- gallery usability
- conversion visibility

## Test widths

At minimum:
- 360
- 390
- 430
- 768
- 1024
- 1280
- 1440+

Test content extremes too, not only exact widths.

## Navigation

Mobile:
- menu must be keyboard/touch usable
- nested groups need clear affordances
- no tiny close controls
- quote/contact action easy to find

## Product gallery

- swipe/touch usable where implemented
- thumbnails not required if they become unusable on small screens
- modal/lightbox must trap/focus correctly
- close with keyboard
- alt/caption semantics

## Tables

Never squash a wide technical table into unreadable columns.

Options:
- horizontal overflow with clear visual affordance
- transform simple comparison rows into cards on small screens

Preserve semantic table markup when table meaning matters.

## Forms

- visible label
- correct input type/autocomplete
- accessible error association
- keyboard navigation
- touch-friendly controls
- file upload state
- loading/success/error feedback

## Accessibility baseline

- semantic landmarks
- skip link
- logical heading hierarchy
- focus-visible states
- keyboard menus/modals/accordions
- image alt text
- adequate contrast
- no meaning conveyed through color alone
- reduced-motion support

## Performance budget mindset

Avoid:
- huge unoptimized hero video
- autoplay media without reason
- loading entire animation libraries for tiny effects
- client-side rendering static content
- multiple font families/weights without justification
- oversized gallery assets

## Core Web Vitals priorities

### LCP
- optimize hero image
- avoid delaying main content with client hydration
- preload only genuinely critical assets

### CLS
- reserve image dimensions
- stable fonts/layout
- avoid late-inserting banners

### INP
- minimize client JS
- keep menu/gallery/admin interactions efficient

## Images

Prepare sensible original asset sizes.
Do not upload 6000px product images and rely entirely on runtime optimization.

## Fonts

- use Next font handling/self-hosting where licensing allows
- restrict weights
- fallback metrics as needed

## JavaScript

Every `use client` needs justification.
The public marketing/catalogue site should remain server-heavy.
