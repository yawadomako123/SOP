import { prisma } from "@/lib/prisma";
import { Package, Plus } from "lucide-react";
import Link from "next/link";
import DeleteProductButton from "./DeleteProductButton";

export const revalidate = 30;

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Products List</h2>
          <p className="text-muted-foreground mt-1">
            Manage your catalog and pricing
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">Add Product</span>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="p-4 font-semibold text-sm">Product Name</th>
                <th className="p-4 font-semibold text-sm">Category</th>
                <th className="p-4 font-semibold text-sm">Price</th>
                <th className="p-4 font-semibold text-sm">Current Stock</th>
                <th className="p-4 font-semibold text-sm text-right">
                  Barcode
                </th>
                <th className="p-4 font-semibold text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-border hover:bg-muted/10 transition-colors"
                >
                  <td className="p-4 font-medium flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    {product.name}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {product.category?.name}
                  </td>
                  <td className="p-4 font-semibold">
                    GH₵ {product.price.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.quantity <= 5
                          ? "bg-red-500/10 text-red-500 border border-red-500/20"
                          : "bg-green-500/10 text-green-500 border border-green-500/20"
                      }`}
                    >
                      {product.quantity} in stock
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground font-mono text-right">
                    {product.barcode}
                  </td>
                  <td className="p-4 text-right">
                    <DeleteProductButton productId={product.id} productName={product.name} />
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-12 text-center text-muted-foreground"
                  >
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No products found in the database.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
