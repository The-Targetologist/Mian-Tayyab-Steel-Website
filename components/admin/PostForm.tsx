"use client";

import { useActionState } from "react";
import { NameAndSlugFields } from "./NameAndSlugFields";
import { RelationCheckboxList } from "./RelationCheckboxList";
import { ImageUploader } from "./ImageUploader";
import { FormField, formInputClasses } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { initialPostFormState, type PostFormState } from "@/lib/validation/admin/post";
import type { PostOption } from "@/lib/queries/admin/posts";
import type { Post } from "@/types/content";

interface PostFormProps {
  action: (state: PostFormState, formData: FormData) => Promise<PostFormState>;
  post?: Post;
  postOptions: PostOption[];
  selectedRelatedPostIds: string[];
}

export function PostForm({ action, post, postOptions, selectedRelatedPostIds }: PostFormProps) {
  const [state, formAction, pending] = useActionState(action, initialPostFormState);

  return (
    <form action={formAction} className="flex flex-col gap-10">
      <section className="flex flex-col gap-5">
        <h2 className="text-h4 font-semibold text-neutral-950">Basics</h2>

        <NameAndSlugFields
          nameFieldKey="title"
          nameLabel="Title"
          defaultName={post?.title}
          defaultSlug={post?.slug}
          nameError={state.fieldErrors?.title?.[0]}
          slugError={state.fieldErrors?.slug?.[0]}
        />

        <FormField label="Author name" htmlFor="authorName" error={state.fieldErrors?.authorName?.[0]}>
          <input
            id="authorName"
            name="authorName"
            type="text"
            defaultValue={post?.authorName ?? ""}
            className={formInputClasses}
          />
        </FormField>

        <FormField label="Excerpt" htmlFor="excerpt" error={state.fieldErrors?.excerpt?.[0]}>
          <textarea
            id="excerpt"
            name="excerpt"
            rows={2}
            defaultValue={post?.excerpt ?? ""}
            className={formInputClasses}
          />
        </FormField>

        <FormField label="Body" htmlFor="body" required error={state.fieldErrors?.body?.[0]}>
          <textarea
            id="body"
            name="body"
            rows={12}
            required
            defaultValue={post?.body ?? ""}
            className={formInputClasses}
          />
        </FormField>

        <FormField label="Status" htmlFor="status" required>
          <select id="status" name="status" defaultValue={post?.status ?? "draft"} className={formInputClasses}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </FormField>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h4 font-semibold text-neutral-950">Media</h2>
        <ImageUploader
          label="Featured image"
          hiddenInputName="featuredImageId"
          folder="posts"
          initialAsset={post?.featuredImage}
        />
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h4 font-semibold text-neutral-950">Relationships</h2>
        <RelationCheckboxList
          label="Related articles"
          name="relatedPostIds"
          options={postOptions}
          selectedIds={selectedRelatedPostIds}
          emptyMessage="No other articles exist yet."
        />
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h4 font-semibold text-neutral-950">SEO</h2>

        <FormField label="SEO title" htmlFor="seoTitle" error={state.fieldErrors?.seoTitle?.[0]}>
          <input
            id="seoTitle"
            name="seoTitle"
            type="text"
            defaultValue={post?.seoTitle ?? ""}
            className={formInputClasses}
          />
        </FormField>
        <FormField label="Meta description" htmlFor="seoDescription" error={state.fieldErrors?.seoDescription?.[0]}>
          <textarea
            id="seoDescription"
            name="seoDescription"
            rows={2}
            defaultValue={post?.seoDescription ?? ""}
            className={formInputClasses}
          />
        </FormField>
        <FormField label="Canonical URL" htmlFor="canonicalUrl" error={state.fieldErrors?.canonicalUrl?.[0]}>
          <input
            id="canonicalUrl"
            name="canonicalUrl"
            type="text"
            defaultValue={post?.canonicalUrl ?? ""}
            className={formInputClasses}
          />
        </FormField>
      </section>

      {state.status === "error" && (
        <p role="alert" className="text-body-sm text-red-600">
          {state.message}
        </p>
      )}

      <div>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving..." : post ? "Save changes" : "Create post"}
        </Button>
      </div>
    </form>
  );
}
