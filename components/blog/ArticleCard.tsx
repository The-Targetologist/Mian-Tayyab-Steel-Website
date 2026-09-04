import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/types/content";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { ArticleMeta } from "./ArticleMeta";

// 16:9 — distinct from ProductCard's 4:3 and CollectionCard's 16:9-but-wider
// composition; editorial convention rather than catalogue convention.
export function ArticleCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-md border border-neutral-100 transition-colors duration-fast hover:border-brand-600"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-brand-50">
        {post.featuredImage ? (
          <Image
            src={post.featuredImage.publicUrl}
            alt={post.featuredImage.altText ?? post.title}
            fill
            sizes="(min-width: 1024px) 400px, 90vw"
            className="object-cover transition-transform duration-normal group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <ArticleMeta authorName={post.authorName} publishedAt={post.publishedAt} />
        <h3 className="text-h5 font-semibold text-neutral-950">{post.title}</h3>
        {post.excerpt && <p className="text-body-sm text-neutral-600">{post.excerpt}</p>}
      </div>
    </Link>
  );
}
