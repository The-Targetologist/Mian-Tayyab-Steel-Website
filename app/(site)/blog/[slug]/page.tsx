import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Section } from "@/components/layout/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { QuoteCtaSection } from "@/components/layout/QuoteCtaSection";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { ArticleMeta } from "@/components/blog/ArticleMeta";
import { ArticleGrid } from "@/components/blog/ArticleGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildArticleSchema } from "@/lib/seo/schema";
import { getPostBySlug, getRelatedPosts } from "@/lib/queries/posts";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Article not found | Mian Tayyab Steel" };
  }

  return buildPageMetadata({
    path: `/blog/${post.slug}`,
    title: post.seoTitle ?? `${post.title} | Mian Tayyab Steel`,
    description: post.seoDescription ?? post.excerpt,
    canonicalUrl: post.canonicalUrl,
    ogImage: post.ogImage ?? post.featuredImage,
    type: "article",
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post.id);

  return (
    <>
      <JsonLd data={buildArticleSchema(post)} />
      <Section background="white">
        <div className="flex flex-col gap-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Blog", href: "/blog" },
              { label: post.title },
            ]}
          />

          <div className="max-w-(--container-md) flex flex-col gap-4">
            <ArticleMeta authorName={post.authorName} publishedAt={post.publishedAt} />
            <h1 className="text-h1 font-bold text-neutral-950 lg:text-h1-lg">{post.title}</h1>
          </div>

          <div className="relative aspect-[16/9] w-full max-w-(--container-lg) overflow-hidden rounded-lg bg-brand-50">
            {post.featuredImage ? (
              <Image
                src={post.featuredImage.publicUrl}
                alt={post.featuredImage.altText ?? post.title}
                fill
                sizes="(min-width: 1024px) 900px, 90vw"
                priority
                className="object-cover"
              />
            ) : (
              <ImagePlaceholder />
            )}
          </div>

          <div className="max-w-(--container-md) text-body-lg whitespace-pre-line text-neutral-700">
            {post.body}
          </div>
        </div>
      </Section>

      {relatedPosts.length > 0 && (
        <Section background="off-white">
          <h2 className="text-h2 font-bold text-neutral-950 lg:text-h2-lg">Related articles</h2>
          <div className="mt-6">
            <ArticleGrid posts={relatedPosts} />
          </div>
        </Section>
      )}

      <QuoteCtaSection />
    </>
  );
}
