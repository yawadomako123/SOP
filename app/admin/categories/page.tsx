import { prisma } from "@/lib/prisma";
import { createCategory, deleteCategory } from "./actions";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, GripVertical, AlertCircle, Package } from "lucide-react";

export const revalidate = 30;

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Product Categories</h1>
          <p className="text-muted-foreground">
            Manage the list of allowed categories for product uploads
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Add New Category</h2>
        <form action={createCategory} className="flex gap-3">
          <input
            name="name"
            type="text"
            required
            placeholder="e.g. Beverages, Electronics..."
            className="flex-1 px-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none"
          />
          <Button type="submit" className="gap-2 shrink-0">
            <Plus className="w-4 h-4" /> Add Category
          </Button>
        </form>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex bg-muted/20">
          <h2 className="text-lg font-bold">Existing Categories</h2>
        </div>

        <div className="divide-y divide-border">
          {categories.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Package className="w-10 h-10 mx-auto opacity-20 mb-3" />
              <p>No categories found. Add your first category above.</p>
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="p-4 px-6 flex items-center justify-between hover:bg-muted/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-muted-foreground opacity-50">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {category._count.products} associated product(s)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <form action={deleteCategory.bind(null, category.id)}>
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      disabled={category._count.products > 0}
                      title={
                        category._count.products > 0
                          ? "Cannot delete category in use"
                          : "Delete category"
                      }
                      className={
                        category._count.products > 0
                          ? "text-muted-foreground"
                          : "text-destructive hover:bg-destructive/10"
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-lg flex gap-3 text-orange-700 dark:text-orange-400">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-bold mb-1">Important Note</p>
          <p>
            You cannot delete a category that is currently assigned to active
            products in inventory. If you need to delete a category, first
            reassign or delete the products using it.
          </p>
        </div>
      </div>
    </div>
  );
}
