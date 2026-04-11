import { prisma } from '@/lib/prisma';
import ClosingClient from './ClosingClient';

export const dynamic = 'force-dynamic';

export default async function DailyClosingPage() {
  // 1. Get today's bounds (Midnight to now)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // 2. Query Postgres for today's sales and their cashiers
  const todaysSales = await prisma.sale.findMany({
    where: {
      createdAt: { gte: todayStart }
    },
    include: {
      user: true // we need cashier names
    }
  });

  // 3. Aggregate Core Metrics
  const totalTransactions = todaysSales.length;
  const grossSales = todaysSales.reduce((sum, sale) => sum + sale.totalAmount, 0);

  // Note: the schema doesn't yet have dedicated fields for tax and discount per sale.
  // In a robust POS system these would be aggregated directly from the Sale table.
  const totalTax = 0;
  const totalDiscount = 0;
  const netSales = grossSales;

  const salesSummary = {
    totalTransactions,
    totalSales: grossSales,
    totalTax,
    totalDiscount,
    netSales,
  };

  // 4. Payment Methods Breakdown
  // Currently, the "paymentType" field does not exist in the Database Schema.
  // We attribute all tracked sales to "Cash" dynamically so UI calculations (e.g., Variance) don't fall out of sync with actual Sales.
  const paymentBreakdown = [
    { method: 'Cash', transactions: totalTransactions, amount: netSales, color: 'text-green-500' },
    { method: 'Card', transactions: 0, amount: 0, color: 'text-blue-500' },
    { method: 'Mobile Money', transactions: 0, amount: 0, color: 'text-purple-500' },
  ];

  // Since all transactions are routed through "Cash" for now, expected cash equals net sales
  const expectedCash = netSales;

  // 5. Cashier Shift Status
  type CashierState = {
    name: string;
    shift: string;
    transactions: number;
    sales: number;
    status: 'closed' | 'pending';
  };

  const cashierMap = new Map<string, CashierState>();

  todaysSales.forEach(sale => {
    const cashId = sale.userId;
    if (!cashierMap.has(cashId)) {
      cashierMap.set(cashId, {
        name: sale.user?.name || 'Unknown Cashier',
        shift: 'Today', // Shift tracking isn't explicitly defined, using "Today"
        transactions: 0,
        sales: 0,
        status: 'pending' // Active sessions map to 'pending' by default
      });
    }
    const c = cashierMap.get(cashId)!;
    c.transactions += 1;
    c.sales += sale.totalAmount;
  });

  const cashierClosing = Array.from(cashierMap.values());

  // 6. Refunds and Voids
  // We do not have refunds logged natively in Prisma yet.
  const refundsVoids: never[] = [];

  return (
    <ClosingClient 
      salesSummary={salesSummary}
      paymentBreakdown={paymentBreakdown}
      cashierClosing={cashierClosing}
      refundsVoids={refundsVoids}
      expectedCash={expectedCash}
    />
  );
}
