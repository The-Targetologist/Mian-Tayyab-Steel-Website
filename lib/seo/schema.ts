import { SITE_NAME, SITE_URL } from "./metadata";
import type { BreadcrumbItem } from "@/components/layout/Breadcrumbs";
import type { Faq, Post, Product, Service, SiteSettings } from "@/types/content";

// docs/12-seo-and-url-strategy.md "Structured data" — Organization,
// BreadcrumbList, FAQPage, Article/BlogPosting, Service, and Product
// ("only if page content actually fits applicable schema semantics; do not
// fabricate offer/pricing fields" — so no `offers` here, ever, since no real
// pricing data exists anywhere in this project).

export function buildOrganizationSchema(settings: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.companyLegalName || SITE_NAME,
    url: SITE_URL,
    ...(settings.primaryPhone ? { telephone: settings.primaryPhone } : {}),
    ...(settings.primaryEmail ? { email: settings.primaryEmail } : {}),
    ...(Object.keys(settings.socialUrls).length > 0
      ? { sameAs: Object.values(settings.socialUrls) }
      : {}),
  };
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  };
}

export function buildFaqSchema(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answerRichtext,
      },
    })),
  };
}

export function buildProductSchema(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.introRichtext || undefined,
    ...(product.featuredImage ? { image: product.featuredImage.publicUrl } : {}),
    url: `${SITE_URL}/products/${product.slug}`,
  };
}

export function buildServiceSchema(service: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.shortDescription || service.introRichtext || undefined,
    ...(service.featuredImage ? { image: service.featuredImage.publicUrl } : {}),
    url: `${SITE_URL}/services/${service.slug}`,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
    },
  };
}

export function buildArticleSchema(post: Post) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || undefined,
    ...(post.featuredImage ? { image: post.featuredImage.publicUrl } : {}),
    url: `${SITE_URL}/blog/${post.slug}`,
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    dateModified: post.updatedAt,
    ...(post.authorName ? { author: { "@type": "Person", name: post.authorName } } : {}),
  };
}
