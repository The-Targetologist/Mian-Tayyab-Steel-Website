// Shared content entity types, per docs/09-content-and-database-model.md.
// These describe the planned Supabase schema shape for use across query
// functions and components. No tables/migrations exist yet (Phase 4+ of
// docs/13-implementation-roadmap.md) — treat as the contract to build toward.

export type ContentStatus = "draft" | "published" | "archived";

export interface MediaAsset {
  id: string;
  bucket: string;
  path: string;
  publicUrl: string;
  altText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  mimeType: string;
  sizeBytes: number;
}

export interface ProductSpecification {
  id: string;
  productId: string;
  label: string;
  value: string;
  unit: string | null;
  sortOrder: number;
}

export interface ProductFeature {
  id: string;
  productId: string;
  title: string | null;
  description: string;
  sortOrder: number;
}

export interface ProductApplication {
  id: string;
  productId: string;
  title: string;
  description: string | null;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortName: string | null;
  shortDescription: string | null;
  introRichtext: string | null;
  bodyRichtext: string | null;
  featuredImage: MediaAsset | null;
  gallery: MediaAsset[];
  origin: string | null;
  status: ContentStatus;
  sortOrder: number;
  isFeatured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  ogImage: MediaAsset | null;
  specifications: ProductSpecification[];
  features: ProductFeature[];
  applications: ProductApplication[];
  faqs: Faq[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// Controlled content-block schema for collection pages — docs/09 "Why modular
// body blocks?" and docs/10-admin-panel.md "Controlled block types". A
// discriminated union, not freeform HTML/code, per docs/09 "Do not allow
// arbitrary code/HTML from admin." Product references flow through the
// dedicated `collection_products` relation (rendered as its own "Relevant
// products" section), not a block type — avoids two mechanisms for the same
// relationship.
export type CollectionBlock =
  | { type: "rich_text"; title?: string; body: string }
  | {
      type: "image_text";
      title: string;
      body: string;
      image: MediaAsset | null;
      imagePosition: "left" | "right";
    }
  | { type: "feature_list"; title?: string; items: { title: string; description?: string }[] }
  | { type: "solution_cards"; title?: string; items: { title: string; description?: string }[] }
  | { type: "application_grid"; title?: string; items: { title: string; description?: string }[] }
  | { type: "industry_list"; title?: string; items: string[] }
  | { type: "comparison_table"; title?: string; columns: string[]; rows: string[][] }
  | {
      type: "selection_guide";
      title?: string;
      steps: { title: string; description?: string }[];
    }
  | { type: "cta"; title: string; body?: string; buttonLabel: string; buttonHref: string };

export interface Collection {
  id: string;
  name: string;
  slug: string;
  kicker: string | null;
  h1: string;
  shortDescription: string | null;
  heroImage: MediaAsset | null;
  introRichtext: string | null;
  contentBlocks: CollectionBlock[];
  brochure: MediaAsset | null;
  status: ContentStatus;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  ogImage: MediaAsset | null;
  products: Product[];
  faqs: Faq[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// Structured operational fields — docs/02-reference-site-audit.md "Add
// structured operational fields where known: materials supported,
// thickness/size limits, tolerance/capability, accepted drawing formats,
// turnaround guidance, service area. Do not invent these values." Same
// flexible label/value shape as ProductSpecification, matching doc08's
// CapabilityList component.
export interface ServiceCapability {
  id: string;
  serviceId: string;
  label: string;
  value: string;
  unit: string | null;
  sortOrder: number;
}

// "Accepted input/project requirements" — doc08's ProjectRequirementBlock.
export interface ServiceRequirement {
  id: string;
  serviceId: string;
  title: string;
  description: string | null;
  sortOrder: number;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  introRichtext: string | null;
  bodyRichtext: string | null;
  featuredImage: MediaAsset | null;
  gallery: MediaAsset[];
  serviceArea: string | null;
  status: ContentStatus;
  sortOrder: number;
  isFeatured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  ogImage: MediaAsset | null;
  capabilities: ServiceCapability[];
  requirements: ServiceRequirement[];
  relatedProducts: Product[];
  faqs: Faq[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface Faq {
  id: string;
  question: string;
  answerRichtext: string;
  status: ContentStatus;
  sortOrder: number;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  featuredImage: MediaAsset | null;
  status: ContentStatus;
  authorName: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  ogImage: MediaAsset | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export type LocationType = "office" | "warehouse" | "yard" | "facility";

export interface Location {
  id: string;
  name: string;
  locationType: LocationType;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  province: string | null;
  postalCode: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  mapUrl: string | null;
  mapEmbedUrl: string | null;
  isPrimary: boolean;
  sortOrder: number;
  status: ContentStatus;
}

export interface Partner {
  id: string;
  name: string;
  description: string | null;
  logo: MediaAsset | null;
  websiteUrl: string | null;
  relationshipLabel: string | null;
  status: ContentStatus;
  sortOrder: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string | null;
  description: string | null;
  media: MediaAsset | null;
  certificateUrl: string | null;
  status: ContentStatus;
  sortOrder: number;
}

export type QuoteRequestStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "quoted"
  | "closed"
  | "spam";

export interface QuoteRequest {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string;
  city: string | null;
  productId: string | null;
  serviceId: string | null;
  quantityText: string | null;
  specificationText: string | null;
  message: string | null;
  attachmentPath: string | null;
  sourcePage: string | null;
  status: QuoteRequestStatus;
  createdAt: string;
}

export interface SiteSettings {
  companyLegalName: string | null;
  primaryPhone: string | null;
  whatsapp: string | null;
  primaryEmail: string | null;
  socialUrls: Record<string, string>;
  defaultSeoTitle: string | null;
  defaultSeoDescription: string | null;
  defaultOgImage: MediaAsset | null;
  footerDescription: string | null;
  brochure: MediaAsset | null;
}

// Phase 12 — site search (docs/11-technical-architecture.md). "page" covers
// core marketing pages (About/FAQ/Contact), which have no dynamic body
// content to run through Postgres full-text search — matched separately as
// a small static list rather than a database row.
export type SearchResultType = "product" | "collection" | "service" | "post" | "page";

export interface SearchResult {
  type: SearchResultType;
  title: string;
  excerpt: string | null;
  href: string;
  rank: number;
}
