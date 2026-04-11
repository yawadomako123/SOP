import { prisma } from "@/lib/prisma";
import ReportsClient from "@/app/manager/reports/ReportsClient";

export const revalidate = 60;

export default async function ReportsPage() {
  // 1. Define trailing 7 days boundary
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 6);
  last7Days.setHours(0, 0, 0, 0);

  // 2. Query Postgres for all completed sales (and relations) in that window
  const recentSales = await prisma.sale.findMany({
    where: { createdAt: { gte: last7Days } },
    include: { items: { include: { product: true } } },
  });

  // 3. Aggregate Data for `salesData` (Line Chart)
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const salesByDayMap = new Map();

  // Preflight all 7 days to ensure unbroken chart axis
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = daysOfWeek[d.getDay()];
    // Only set if not already set, effectively generating the sequence correctly
    if (!salesByDayMap.has(dayName)) {
      salesByDayMap.set(dayName, {
        day: dayName,
        sales: 0,
        transactions: 0,
        _date: d,
      });
    }
  }

  // Inject real volume
  recentSales.forEach((sale) => {
    const dayName = daysOfWeek[sale.createdAt.getDay()];
    if (salesByDayMap.has(dayName)) {
      const metric = salesByDayMap.get(dayName);
      metric.sales += sale.totalAmount;
      metric.transactions += 1;
    }
  });

  // Strip helper fields and ensure chronological charting order
  const salesData = Array.from(salesByDayMap.values())
    .sort((a, b) => a._date.getTime() - b._date.getTime())
    .map((d) => ({ day: d.day, sales: d.sales, transactions: d.transactions }));

  // 4. Aggregate Data for `productSales` (Bar Chart)
  const productCounts = new Map();
  recentSales.forEach((sale) => {
    sale.items.forEach((item) => {
      // Create hash map entry grouping by specific product identifier
      if (!productCounts.has(item.productId)) {
        productCounts.set(item.productId, {
          product: item.product.name,
          sales: 0,
        });
      }
      productCounts.get(item.productId).sales += item.quantity;
    });
  });

  // Flatten map, sort mathematically descending, pick top 5
  const productSales = Array.from(productCounts.values())
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  // 5. High-level metric aggregation
  const weeklySales = salesData.reduce((sum, day) => sum + day.sales, 0);
  const weeklyTransactions = salesData.reduce(
    (sum, day) => sum + day.transactions,
    0,
  );
  const avgTransaction =
    weeklyTransactions > 0 ? weeklySales / weeklyTransactions : 0;
  // Approximating unique staff operators since Customer Tracking isn't actively inserted
  const uniqueUsers = new Set(recentSales.map((s) => s.userId)).size;

  // Pass sanitized UI-ready arrays to the standard client boundary
  return (
    <ReportsClient
      salesData={salesData}
      productSales={productSales}
      weeklySales={weeklySales}
      weeklyTransactions={weeklyTransactions}
      avgTransaction={avgTransaction}
      uniqueUsers={uniqueUsers}
    />
  );
}
