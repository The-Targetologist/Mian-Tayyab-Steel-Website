import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DeleteEntityButton } from "@/components/admin/DeleteEntityButton";
import { getAdminProducts } from "@/lib/queries/admin/products";
import { deleteProduct } from "@/lib/actions/admin/products";

export const metadata: Metadata = {
  title: "Products | MTS Admin",
  robots: { index: false },
};

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h2 font-bold text-neutral-950">Products</h1>
        <Button href="/admin/products/new" variant="primary">
          New product
        </Button>
      </div>

      {products.length === 0 ? (
        <p className="text-body text-neutral-500">
          No products yet. Create your first one to get started.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-neutral-100 bg-white">
          <table className="w-full min-w-[640px] text-body-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left">
                <th className="px-4 py-3 font-semibold text-neutral-700">Name</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">Status</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">Featured</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">Updated</th>
                <th className="px-4 py-3 font-semibold text-neutral-700">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-950">{product.name}</p>
                    <p className="text-caption text-neutral-500">/{product.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {product.isFeatured ? "Yes" : "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {new Date(product.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-body-sm font-medium text-brand-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteEntityButton entityId={product.id} entityName={product.name} deleteAction={deleteProduct} />
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
