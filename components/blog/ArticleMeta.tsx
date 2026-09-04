interface ArticleMetaProps {
  authorName: string | null;
  publishedAt: string | null;
  className?: string;
}

// Shared by ArticleCard and the article detail page.
export function ArticleMeta({ authorName, publishedAt, className }: ArticleMetaProps) {
  if (!authorName && !publishedAt) return null;

  return (
    <p className={className ?? "text-body-sm text-neutral-500"}>
      {authorName}
      {authorName && publishedAt ? " · " : ""}
      {publishedAt && (
        <time dateTime={publishedAt}>
          {new Date(publishedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      )}
    </p>
  );
}
