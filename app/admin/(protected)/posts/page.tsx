import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DeleteEntityButton } from "@/components/admin/DeleteEntityButton";
import { getAdminPosts } from "@/lib/queries/admin/posts";
import { deletePost } from "@/lib/actions/admin/posts";

export const metadata: Metadata = {
  title: "Blog | MTS Admin",
  robots: { index: false },
};

export default async function AdminPostsPage() {
  const posts = await getAdminPosts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h2 font-bold text-neutral-950">Blog</h1>
        <Button href="/admin/posts/new" variant="primary">
          New post
        </Button>
      </div>

      {posts.length === 0 ? (
        <p className="text-body text-neutral-500">
          No posts yet. Create your first one to get started.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-neutral-100 bg-white">
          <table className="w-full min-w-[640px] text-body-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left">
                <th className="px-4 py-3 font-semibold text-neutral-700">Title</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">Status</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">Author</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">Updated</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-950">{post.title}</p>
                    <p className="text-caption text-neutral-500">/{post.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{post.authorName ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-700">
                    {new Date(post.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="text-body-sm font-medium text-brand-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteEntityButton entityId={post.id} entityName={post.title} deleteAction={deletePost} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
