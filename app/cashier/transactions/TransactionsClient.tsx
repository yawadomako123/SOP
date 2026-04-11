"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Clock, ShoppingBag, RefreshCw } from 'lucide-react';

interface Sale {
  id: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

export default function TransactionsClient({ initialSales }: { initialSales: Sale[] }) {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh every 5 seconds to pick up newly verified payments
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await fetch('/api/sales');
        if (res.ok) {
          const data: Sale[] = await res.json();
          const todaySales = data.filter(s => {
            const saleDate = new Date(s.createdAt).toDateString();
            return saleDate === new Date().toDateString();
          });
          setSales(todaySales);
        }
      } catch (err) {
        console.error('Error refreshing sales:', err);
      }
    };

    const interval = setInterval(fetchSales, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/sales');
      if (res.ok) {
        const data: Sale[] = await res.json();
        const todaySales = data.filter(s => {
          const saleDate = new Date(s.createdAt).toDateString();
          return saleDate === new Date().toDateString();
        });
        setSales(todaySales);
      }
    } catch (err) {
      console.error('Error refreshing sales:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/cashier')}
            className="p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6" />
            <h1 className="text-xl font-bold">Today's Transactions</h1>
          </div>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-hidden flex flex-col">
        {sales.length === 0 ? (
          <div className="text-center py-10 bg-card border border-border rounded-xl shadow-sm">
            <p className="text-muted-foreground font-medium">No transactions found for today.</p>
          </div>
        ) : (
          <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden flex flex-col flex-1">
            <div className="overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-muted/95 backdrop-blur z-10">
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Time</th>
                    <th className="px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Transaction ID</th>
                    <th className="px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Method</th>
                    <th className="px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {sales.map(sale => (
                    <tr key={sale.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {sale.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 font-bold text-lg">
                        GHS {sale.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold tracking-wide">{sale.paymentMethod.toUpperCase()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-row items-center gap-2">
                          {sale.paymentStatus === 'paid' ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20 px-2.5 py-1 rounded-full">
                                PAID
                              </span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4 text-yellow-500" />
                              <span className="text-xs font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2.5 py-1 rounded-full">
                                PENDING
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
