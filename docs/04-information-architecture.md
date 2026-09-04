# 04 — Information Architecture

## Principle

The website is organized around three user questions:

1. **What steel/product do I need?**
2. **What is it used for?**
3. **Can you process/supply it for my project?**

The architecture must therefore connect:

```text
Products ↔ Applications/Collections ↔ Services ↔ Inquiry
```

## Primary content entities

### Product
A specific material/section/product sold by the company.

Examples:
- HRC
- CRC
- H Beam
- Channel

### Collection / Application
A discovery/SEO landing page grouping products around use/application.

Examples:
- Construction Steel
- Structural Steel
- Steel Coils

### Service
A processing/logistics capability.

Examples:
- Laser cutting
- Coil slitting

### Article
Educational/search content.

### Location
Office, warehouse, yard or facility.

### Trust entity
Distributor relationship, certification, membership, brand/manufacturer authorization.

## Relationships

```text
Product
  ├── belongs to many Collections
  ├── relates to many Services
  ├── has many FAQs
  ├── has many Images
  ├── has many Specifications
  └── relates to many Products

Collection
  ├── contains many Products
  ├── has many FAQs
  └── may relate to Industries/Applications

Service
  ├── relates to many Products
  ├── has many Images
  └── has many FAQs

Article
  ├── may relate to Products
  ├── may relate to Services
  └── may relate to Collections
```

## Navigation behavior

### Products menu
Avoid listing dozens of items in one unstructured menu as catalogue grows.

Recommended hierarchy:
- View All Products
- Flat Steel
- Structural Sections
- Coated Steel
- Other/Industrial

Final taxonomy must follow real business catalogue, not invented classifications.

### Applications/Collections menu
Use user-language, not database-language.

Potential label:
- Applications
- Steel Solutions
- Industries & Applications

Choose after brand/content review.

### Services menu
List current processing services and "View all services".

## Breadcrumb hierarchy

Examples:

```text
Home > Products > Hot Rolled Steel
Home > Applications > Construction Steel
Home > Services > Laser Cutting
Home > Blog > Article Title
```

Breadcrumbs should output structured data.

## Internal linking rules

Every product page should link to:
- relevant collections
- relevant services
- related products

Every collection should link to:
- included products
- relevant services where useful

Every article should link contextually to:
- relevant product(s)
- relevant collection(s)
- relevant service(s)

Avoid manufactured SEO links that harm readability.

## Content density principle

Industrial buyers tolerate and often require information density. Do not artificially reduce useful technical content just to create whitespace.

Instead use:
- clear section headings
- tables
- definition lists
- accordions only for secondary content
- anchor navigation on very long pages
- progressive disclosure
