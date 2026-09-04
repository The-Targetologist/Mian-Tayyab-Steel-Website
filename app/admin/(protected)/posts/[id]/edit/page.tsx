import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostForm } from "@/components/admin/PostForm";
import { updatePost } from "@/lib/actions/admin/posts";
import { getAdminPostById, getAllPostOptions, getRelatedPostIds } from "@/lib/queries/admin/posts";

export const metadata: Metadata = {
  title: "Edit Post | MTS Admin",
  robots: { index: false },
};

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;

  const post = await getAdminPostById(id);
  if (!post) {
    notFound();
  }

  const [postOptions, selectedRelatedPostIds] = await Promise.all([
    getAllPostOptions(id),
    getRelatedPostIds(id),
  ]);

  const boundUpdatePost = updatePost.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h2 font-bold text-neutral-950">Edit post</h1>
      <div className="max-w-(--container-md)">
        <PostForm
          action={boundUpdatePost}
          post={post}
          postOptions={postOptions}
          selectedRelatedPostIds={selectedRelatedPostIds}
        />
      </div>
    </div>
  );
}
