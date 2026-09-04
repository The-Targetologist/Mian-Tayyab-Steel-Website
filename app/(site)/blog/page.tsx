import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ArticleGrid } from "@/components/blog/ArticleGrid";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getPublishedPosts } from "@/lib/queries/posts";

export const metadata: Metadata = buildPageMetadata({
  path: "/blog",
  title: "Blog | Mian Tayyab Steel",
  description: "Industry insights and updates from Mian Tayyab Steel.",
});

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <Section background="white">
      <div className="flex flex-col gap-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />

        <div className="max-w-2xl">
          <p className="text-sm font-medium tracking-wide text-brand-600 uppercase">Blog</p>
          <h1 className="mt-2 text-h1 font-bold text-neutral-950 lg:text-h1-lg">
            Insights and updates
          </h1>
          <p className="mt-4 text-body-lg text-neutral-700">
            {posts.length > 0
              ? "Industry insights and updates from our team."
              : "We're building out our blog. Check back soon for industry insights and updates."}
          </p>
        </div>

        <ArticleGrid posts={posts} emptyMessage="No articles are published yet — check back soon." />
      </div>
    </Section>
  );
}
