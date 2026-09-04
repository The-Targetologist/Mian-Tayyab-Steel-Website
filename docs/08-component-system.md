# 08 — Component System

## Goal

Build a reusable system without turning every page into the same composition.

## Global layout components

```text
SiteHeader
UtilityBar (optional)
DesktopNav
MobileNav
SearchTrigger/SearchOverlay
Breadcrumbs
SiteFooter
PageShell
Section
Container
```

## Content primitives

```text
Eyebrow
SectionHeading
RichText
Prose
Button
LinkArrow
Badge (limited use)
Divider
Icon
ResponsiveImage
```

## Catalogue components

```text
ProductCard
ProductGrid
ProductGallery
ProductQuickFacts
SpecificationList
SpecificationTable
ApplicationList
RelatedProducts
ProductDownloads
```

## Collection/application components

```text
CollectionCard
CollectionGrid
SolutionGroup
IndustryList
UseCaseGrid
ProductComparisonTable
SelectionGuide
AnchorNav
```

## Service components

```text
ServiceCard
ServiceGrid
ServiceGallery
CapabilityList
ProjectRequirementBlock
RelatedServices
```

## Trust components

```text
LegacyBlock
Timeline
PartnerLogoItem
PartnerStrip
CertificationGrid
CompanyStats (only factual data)
Testimonial (only real data)
```

## Conversion components

```text
QuoteCTA
WhatsAppCTA
ContactMethods
QuoteForm
ContactForm
FileUpload
FormSuccess
FormError
```

## Content components

```text
FAQAccordion
ArticleCard
ArticleGrid
ArticleMeta
TableOfContents
RelatedArticles
DownloadCard
```

## Location components

```text
LocationCard
LocationList
MapEmbed
```

## Admin components

```text
AdminShell
AdminSidebar
AdminTopbar
DataTable
EntityForm
SlugField
SeoFields
ImageUploader
GalleryManager
RelationPicker
RepeaterField
RichTextEditor
ConfirmDialog
StatusBadge
```

## Component rules

1. Components must accept data through typed props.
2. No content-specific hardcoding inside generic components.
3. Server Components by default.
4. Add `use client` only at the smallest necessary interaction boundary.
5. Variants must be explicit; avoid hidden conditional styling based on page path.
6. Keep repeated spacing decisions in Section/layout primitives.
7. Avoid a universal `Card` component if product/service/article cards genuinely require different semantics.

## Example typed concept

```ts
type ProductCardProps = {
  name: string;
  slug: string;
  shortDescription?: string | null;
  image?: MediaAsset | null;
  categoryLabel?: string | null;
  priority?: boolean;
};
```

This file defines architecture, not final code.
