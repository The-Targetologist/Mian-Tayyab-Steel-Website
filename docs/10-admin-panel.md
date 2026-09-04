# 10 — Admin Panel

## Goal

Give the client a focused content-management system, not a generic enterprise dashboard.

Route recommendation:
`/admin`

Protect all admin routes server-side.

## Roles

Initial version may use one role:
- Admin

Architecture should allow future roles such as Editor without forcing implementation now.

## Dashboard

Show useful operational information only:
- new quote requests
- recent inquiries
- draft content
- recently edited content

Do not fill dashboard with decorative charts if no meaningful data exists.

## Products

### List screen
Columns:
- thumbnail
- product name
- status
- featured
- collections
- updated
- actions

Functions:
- search
- filter status
- sort
- create
- edit
- archive/delete with confirmation

### Product editor
Sections/tabs:

#### Basics
- Product name
- Slug
- Short name
- Short description
- H1 override only if needed
- Status
- Featured
- Sort order

#### Media
- Featured image
- Gallery
- Alt text/captions
- Downloads/documents

#### Technical information
- Origin
- repeatable specifications
- features
- applications

#### Relationships
- collections
- related products
- relevant services

#### FAQs
- select existing or create contextual FAQs

#### SEO
- SEO title
- meta description
- canonical
- OG image
- index/noindex only if a real requirement exists

## Collections

Collection editor must support richer modular content.

Required:
- identity/hero
- intro
- relevant products
- content blocks
- comparison tables
- application/industry blocks
- selection guidance
- FAQs
- brochure
- SEO

### Controlled block types
Potential block schema:
- rich text
- image + text
- feature list
- product links
- solution cards
- application grid
- industry list
- comparison table
- numbered selection guide
- CTA

Do not build a completely freeform page builder unless genuinely required.

## Services

Editor:
- name/slug/status
- description/content
- gallery
- capabilities
- service area
- related products
- FAQs
- SEO

## Blog

Editor:
- title/slug
- excerpt
- featured image
- body editor
- publish date
- category/tag if enabled
- related commercial pages
- SEO

## FAQs

Global reusable FAQ library with usage indicators.

## Locations

Manage offices/warehouses.

## Partners & Certifications

Manage logo, title, relationship/certificate data, links and ordering.

## Inquiries

### Quote requests table
- date
- name/company
- phone/email
- product/service
- status
- source page

### Detail
- all submitted requirements
- attachment
- status update
- internal notes if later required

## Media

Do not rebuild a full DAM.
Need enough to:
- upload
- select
- preview
- set alt text
- remove unused asset safely

## Site settings

- contact details
- WhatsApp
- social links
- footer
- default brochure/profile
- default SEO/social image

## Admin UX rules

1. Never expose raw database IDs to normal users.
2. Auto-generate slug from title but allow editing.
3. Show preview URL.
4. Warn on unsaved changes where practical.
5. Validate before submit.
6. Destructive actions require confirmation.
7. Use helpful empty states.
8. Autosave is optional; do not implement poorly.
9. Forms must be keyboard accessible.
10. Rich editors must not allow arbitrary scripts.
