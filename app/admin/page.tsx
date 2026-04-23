import { prisma } from '@/lib/prisma';
import {
  ShoppingBag, Package, Users, Receipt,
  AlertCircle, TrendingUp, Clock, CheckCircle,
  ArrowUpRight, ArrowDownRight, Activity, Zap, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    todaySalesAgg,
    allTimeSalesAgg,
    productsCount,
    usersCount,
    lowStockProducts,
    recentSales,
    topProducts,
    pendingSales,
  ] = await Promise.all([
    prisma.sale.aggregate({
      where: { createdAt: { gte: today }, paymentStatus: 'paid' },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.sale.aggregate({
      where: { paymentStatus: 'paid' },
      _sum: { totalAmount: true },
    }),
    prisma.product.count(),
    prisma.user.count(),
    prisma.product.findMany({
      where: { quantity: { lte: 10 } },
      include: { category: true },
      orderBy: { quantity: 'asc' },
      take: 6,
    }),
    prisma.sale.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { items: true, user: { select: { name: true } } },
    }),
    prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 6,
    }),
    prisma.sale.count({ where: { paymentStatus: 'pending' } }),
  ]);

  const topProductIds = topProducts.map((p: any) => p.productId);
  const topProductDetails = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true, price: true, category: { select: { name: true } } },
  });
  const topProductMap = Object.fromEntries(topProductDetails.map((p: any) => [p.id, p]));

  const todayTotal = todaySalesAgg._sum.totalAmount ?? 0;
  const allTimeTotal = allTimeSalesAgg._sum.totalAmount ?? 0;
  const todayCount = todaySalesAgg._count;

  const stats = [
    {
      label: "Today's Revenue",
      value: `GH₵ ${todayTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      sub: `${todayCount} transaction${todayCount !== 1 ? 's' : ''} today`,
      icon: ShoppingBag,
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/15',
      trend: '+12.5%',
      trendUp: true,
    },
    {
      label: 'Inventory',
      value: productsCount.toString(),
      sub: `${lowStockProducts.length} items need restock`,
      icon: Package,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/15',
      trend: 'Stable',
      trendUp: null,
    },
    {
      label: 'Staff',
      value: usersCount.toString(),
      sub: 'Active platform operators',
      icon: Users,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/15',
      trend: 'Stable',
      trendUp: null,
    },
    {
      label: 'All-Time Revenue',
      value: `GH₵ ${allTimeTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      sub: `${pendingSales} payment${pendingSales !== 1 ? 's' : ''} pending`,
      icon: Activity,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/15',
      trend: '+4.2%',
      trendUp: true,
    },
  ];

  const methodLabel: Record<string, string> = {
    cash: 'Cash Payment',
    card: 'Card Payment',
    mobile: 'Mobile Money',
  };

  const methodIcon: Record<string, string> = {
    cash: '💵',
    card: '💳',
    mobile: '📱',
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="size-3.5 text-primary fill-primary" />
            <span className="text-primary font-bold text-xs uppercase tracking-[0.3em]">
              System Overview
            </span>
          </div>
          <h1 className="text-3xl font-display font-extrabold tracking-tight mb-1">
            Executive Dashboard
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            {new Date().toLocaleDateString('en-GH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="rounded-xl font-semibold h-9 px-4 border-border/60">
            Export Report
          </Button>
          <Button size="sm" className="rounded-xl font-bold h-9 px-4 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90">
            View Analytics
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`card-hover relative bg-card border border-border/50 rounded-2xl p-6 overflow-hidden`}
            >
              {/* Subtle glow accent */}
              <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full blur-2xl opacity-40 -translate-y-8 translate-x-8`} />

              <div className="relative">
                <div className="flex items-start justify-between mb-5">
                  <div className={`p-2.5 rounded-xl ${stat.bg} border ${stat.border}`}>
                    <Icon className={`size-5 ${stat.color}`} />
                  </div>
                  {stat.trend !== 'Stable' && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${stat.trendUp ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {stat.trend}
                      {stat.trendUp ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                    </div>
                  )}
                  {stat.trend === 'Stable' && (
                    <span className="text-xs font-bold text-muted-foreground/60">Stable</span>
                  )}
                </div>
                <p className="text-2xl font-display font-black tracking-tight mb-1">{stat.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">{stat.label}</p>
                <div className="gold-divider mb-3" />
                <p className="text-xs text-muted-foreground font-medium">{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction stream */}
        <Card className="lg:col-span-2 border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-border/40 bg-secondary/20">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Receipt className="size-4 text-primary" />
                Recent Transactions
              </CardTitle>
              <CardDescription className="text-[10px] font-semibold uppercase tracking-wider opacity-50 mt-0.5">
                Settlement Ledger
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="rounded-lg text-xs font-bold h-8">
              <Link href="/admin/reports">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/30">
              {recentSales.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <Receipt className="size-10 text-muted-foreground/15 mb-3" />
                  <p className="text-sm font-semibold text-muted-foreground/50">No transactions yet</p>
                </div>
              ) : (
                recentSales.map((sale: any) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-9 rounded-xl bg-secondary/80 border border-border/40 flex items-center justify-center text-lg group-hover:bg-primary/10 transition-colors">
                        {methodIcon[sale.paymentMethod] ?? '💰'}
                      </div>
                      <div>
                        <p className="text-sm font-bold">
                          {methodLabel[sale.paymentMethod] ?? sale.paymentMethod}
                        </p>
                        <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider mt-0.5">
                          {new Date(sale.createdAt).toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit' })}
                          {' · '}{sale.user?.name || 'Terminal'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5">
                      <p className="text-sm font-black">
                        GH₵ {sale.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        sale.paymentStatus === 'paid' ? 'status-paid' : 'status-pending'
                      }`}>
                        {sale.paymentStatus === 'paid' ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low stock */}
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-border/40 bg-secondary/20">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <AlertCircle className="size-4 text-destructive" />
              Low Stock
            </CardTitle>
            <CardDescription className="text-[10px] font-semibold uppercase tracking-wider opacity-50">
              Inventory Alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/30">
              {lowStockProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <CheckCircle className="size-10 text-emerald-400/20 mb-3" />
                  <p className="text-sm font-semibold text-muted-foreground/50">All stock levels good</p>
                </div>
              ) : (
                lowStockProducts.map((product: any) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-destructive/5 transition-all group"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="text-sm font-bold truncate group-hover:text-destructive transition-colors">{product.name}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mt-0.5 truncate">
                        {product.category?.name}
                      </p>
                    </div>
                    <div className={`shrink-0 text-xs font-black px-2.5 py-1 rounded-lg border ${
                      product.quantity === 0
                        ? 'bg-destructive/10 text-destructive border-destructive/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {product.quantity} left
                    </div>
                  </div>
                ))
              )}
            </div>
            {lowStockProducts.length > 0 && (
              <div className="p-4 border-t border-border/40">
                <Button variant="outline" className="w-full text-xs font-bold rounded-xl h-9 border-destructive/20 hover:bg-destructive/5 hover:text-destructive" asChild>
                  <Link href="/admin/inventory">Restock Inventory</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-border/40 bg-secondary/20">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              Top Performing Products
            </CardTitle>
            <CardDescription className="text-[10px] font-semibold uppercase tracking-wider opacity-50 mt-0.5">
              Highest Volume Index
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="rounded-lg text-xs font-bold h-8">
            <Link href="/admin/products">View All</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {topProducts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-semibold text-muted-foreground/40">No data yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/30">
              {topProducts.map((item: any, i: number) => {
                const product = topProductMap[item.productId];
                if (!product) return null;
                return (
                  <div key={item.productId} className="flex items-center gap-4 px-6 py-5 group hover:bg-primary/5 transition-all">
                    <div className="size-11 rounded-2xl bg-secondary/60 border border-border/40 flex items-center justify-center font-black text-base shrink-0 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-transparent transition-all duration-300">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold group-hover:text-primary transition-colors truncate">{product.name}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mt-0.5 truncate">
                        {product.category?.name}
                      </p>
                      <div className="flex items-center gap-2 mt-2.5">
                        <div className="h-1 flex-1 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${Math.min(100, (item._sum.quantity || 0) * 5)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground">{item._sum.quantity} sold</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
