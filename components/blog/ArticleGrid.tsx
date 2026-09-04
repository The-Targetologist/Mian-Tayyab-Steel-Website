import type { Post } from "@/types/content";
import { ArticleCard } from "./ArticleCard";

interface ArticleGridProps {
  posts: Post[];
  emptyMessage?: string;
}

export function ArticleGrid({
  posts,
  emptyMessage = "No articles are published yet.",
}: ArticleGridProps) {
  if (posts.length === 0) {
    return <p className="text-body text-neutral-500">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <ArticleCard key={post.id} post={post} />
      ))}
    </div>
  );
}
