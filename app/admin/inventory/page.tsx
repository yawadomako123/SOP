import { prisma } from "@/lib/prisma";
import { Box, AlertTriangle } from "lucide-react";
import RestockAction from "./RestockAction";
import DeleteProductButton from "@/app/admin/products/DeleteProductButton";

export const revalidate = 30;

export default async function InventoryTab() {
  // Order by quantity ascending to highlight low stock automatically
  const products = await prisma.product.findMany({
    orderBy: { quantity: "asc" },
  });

  const lowStockCount = products.filter(p => p.quantity <= 5).length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Inventory Levels</h2>
          <p className="text-muted-foreground mt-1">Monitor stock and automate restocks</p>
        </div>
        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/30 px-4 py-2 rounded-lg font-semibold text-sm shadow-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>{lowStockCount} Items Low on Stock</span>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="p-4 font-semibold text-sm">Product Name</th>
                <th className="p-4 font-semibold text-sm">SKU / Barcode</th>
                <th className="p-4 font-semibold text-sm text-right">Quantity Available</th>
                <th className="p-4 font-semibold text-sm text-center">Status</th>
                <th className="p-4 font-semibold text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isLowStock = product.quantity <= 5;
                const isOutOfStock = product.quantity === 0;

                return (
                  <tr key={product.id} className="border-b border-border hover:bg-muted/10 transition-colors">
                    <td className="p-4 font-medium flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                        <Box className="w-5 h-5" />
                      </div>
                      {product.name}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground font-mono">{product.barcode}</td>
                    <td className="p-4 font-bold text-lg text-right pr-8">
                      {product.quantity}
                    </td>
                    <td className="p-4 text-center">
                      {isOutOfStock ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-500/10 text-zinc-500 border border-zinc-500/20">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                          Restock Needed
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                          Healthy
                        </span>
                      )}
                    </td>
                    <td className="p-4 flex items-center justify-end gap-2">
                      <RestockAction productId={product.id} />
                      <DeleteProductButton productId={product.id} productName={product.name} />
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    <Box className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Your inventory is empty.</p>
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
