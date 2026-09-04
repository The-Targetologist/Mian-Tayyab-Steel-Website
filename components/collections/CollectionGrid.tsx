import type { Collection } from "@/types/content";
import { CollectionCard } from "./CollectionCard";

interface CollectionGridProps {
  collections: Collection[];
  emptyMessage?: string;
}

export function CollectionGrid({
  collections,
  emptyMessage = "No collections are published yet.",
}: CollectionGridProps) {
  if (collections.length === 0) {
    return <p className="text-body text-neutral-500">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}
