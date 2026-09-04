# 09 — Content & Database Model

## Database

Supabase Postgres.

Use UUID primary keys unless a strong reason dictates otherwise.

Every public content entity should normally include:
- `id`
- `slug`
- `status` (`draft`, `published`, optionally `archived`)
- `created_at`
- `updated_at`
- `published_at` where relevant

## 1. products

Suggested fields:

```text
id
name
slug
short_name
short_description
intro_richtext
body_richtext
featured_image_id
origin
status
sort_order
is_featured
seo_title
seo_description
canonical_url
og_image_id
created_at
updated_at
published_at
```

Do not assume every product has the same specification keys.

## 2. product_specifications

```text
id
product_id
label
value
unit (nullable)
sort_order
```

This allows product-specific specs without schema churn.

## 3. product_features

```text
id
product_id
title (nullable)
description
sort_order
```

## 4. product_applications

```text
id
product_id
title
description (nullable)
sort_order
```

## 5. media_assets

Store metadata; binary assets live in Supabase Storage.

```text
id
bucket
path
public_url or derived path
alt_text
caption
width
height
mime_type
size_bytes
created_at
```

## 6. product_media

```text
id
product_id
media_id
role (gallery / featured / diagram / document)
sort_order
```

## 7. collections

```text
id
name
slug
kicker
h1
short_description
hero_image_id
intro_richtext
body_content/json blocks
brochure_media_id
status
sort_order
seo_title
seo_description
canonical_url
og_image_id
```

### Why modular body blocks?
Collection pages are much richer than a basic category. They may need tables, use-case groups, selection guides and other editorial modules.

Recommended approach:
- structured JSON content blocks with a controlled block schema
or
- normalized tables for highly reusable sections

Do not allow arbitrary code/HTML from admin.

## 8. collection_products

```text
collection_id
product_id
sort_order
```

Composite unique constraint on collection/product.

## 9. services

```text
id
name
slug
short_description
intro_richtext
body_richtext
featured_image_id
service_area
status
sort_order
is_featured
seo_title
seo_description
canonical_url
og_image_id
```

## 10. service_media

Same pattern as product media.

## 11. product_services

Many-to-many relationship.

```text
product_id
service_id
sort_order
```

## 12. faqs

Prefer a unified FAQ table with link tables rather than duplicated schemas.

```text
id
question
answer_richtext
status
sort_order
```

Relations:
- `product_faqs`
- `service_faqs`
- `collection_faqs`
- `global_faqs`

## 13. posts

```text
id
title
slug
excerpt
body
featured_image_id
status
author_name or author_id
published_at
seo_title
seo_description
canonical_url
og_image_id
created_at
updated_at
```

## 14. post_categories / post_tags

Only implement taxonomies that content strategy will actually use.

## 15. locations

```text
id
name
location_type
address_line_1
address_line_2
city
province
postal_code
country
phone
email
map_url
map_embed_url or coordinates
is_primary
sort_order
status
```

## 16. partners

For distributors/franchisers/partners.

```text
id
name
description
logo_media_id
website_url
relationship_label
status
sort_order
```

## 17. certifications

```text
id
name
issuer
description
media_id
certificate_url
status
sort_order
```

## 18. quote_requests

```text
id
name
company
email
phone
city
product_id nullable
service_id nullable
quantity_text
specification_text
message
attachment_path nullable
source_page
status
created_at
```

Suggested statuses:
- new
- contacted
- qualified
- quoted
- closed
- spam

## 19. contact_requests

Can be a separate lightweight table or unified with inquiries if the workflow is the same.

## 20. site_settings

Avoid a single uncontrolled JSON blob for everything.
Use either:
- typed key/value settings
- logical setting groups with validation

Potential settings:
- company legal name
- primary phone
- WhatsApp
- primary email
- social URLs
- default SEO
- footer description
- brochure

## Row Level Security

### Public
- read published public content only
- insert inquiries only through a controlled server endpoint/action, not unrestricted direct table inserts

### Admin
- authenticated authorized users can manage content

Do not equate "authenticated" with "admin". Use explicit authorization/role checks.

## Data integrity

- unique slugs within each content type
- foreign keys with deliberate delete behavior
- sort order validation
- media cleanup policy
- server-side validation with a schema library
- sanitize rich text/content blocks
