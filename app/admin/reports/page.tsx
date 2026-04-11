import { prisma } from "@/lib/prisma";
import { ReceiptText, CalendarDays } from "lucide-react";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function ReportsTab() {
  const sales = await prisma.sale.findMany({
    include: {
      user: true,
      items: {
        include: {
          product: true,
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Transaction Reports</h2>
          <p className="text-muted-foreground mt-1">Detailed history of all POS transactions</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-lg font-medium text-sm shadow-sm">
          <CalendarDays className="w-4 h-4" />
          <span>Last 7 Days</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="p-4 font-semibold text-sm">Transaction ID</th>
                <th className="p-4 font-semibold text-sm">Date & Time</th>
                <th className="p-4 font-semibold text-sm">Cashier</th>
                <th className="p-4 font-semibold text-sm">Items Included</th>
                <th className="p-4 font-semibold text-sm text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sales.map((sale) => {
                const totalItems = sale.items.reduce((sum, item) => sum + item.quantity, 0);
                
                return (
                  <tr key={sale.id} className="hover:bg-muted/10 transition-colors group">
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                          <ReceiptText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-mono text-sm">{sale.id.slice(0, 12).toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground">Successful</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <p className="font-medium text-sm">{format(new Date(sale.createdAt), "MMM d, yyyy")}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(sale.createdAt), "h:mm a")}</p>
                    </td>
                    <td className="p-4 align-top">
                      <p className="text-sm font-medium">{sale.user.name}</p>
                      <p className="text-xs text-muted-foreground">{sale.user.role}</p>
                    </td>
                    <td className="p-4 align-top">
                      <div className="text-sm">
                        <p className="font-medium mb-1">{totalItems} unit(s) total</p>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 mt-2">
                           {sale.items.map(item => (
                             <span key={item.id} className="text-xs text-muted-foreground flex justify-between gap-4">
                               <span className="truncate w-32">{item.product.name} x{item.quantity}</span>
                               <span className="text-right">GH₵{(item.price * item.quantity).toFixed(2)}</span>
                             </span>
                           ))}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-top text-right">
                      <p className="font-bold text-lg">GH₵ {sale.totalAmount.toFixed(2)}</p>
                    </td>
                  </tr>
                );
              })}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    <ReceiptText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No transactions recorded yet.</p>
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