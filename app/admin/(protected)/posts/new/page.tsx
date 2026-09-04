import type { Metadata } from "next";
import { PostForm } from "@/components/admin/PostForm";
import { createPost } from "@/lib/actions/admin/posts";
import { getAllPostOptions } from "@/lib/queries/admin/posts";

export const metadata: Metadata = {
  title: "New Post | MTS Admin",
  robots: { index: false },
};

export default async function NewPostPage() {
  const postOptions = await getAllPostOptions();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h2 font-bold text-neutral-950">New post</h1>
      <div className="max-w-(--container-md)">
        <PostForm action={createPost} postOptions={postOptions} selectedRelatedPostIds={[]} />
      </div>
    </div>
  );
}
