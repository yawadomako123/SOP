import { prisma } from '@/lib/prisma';
import {
  ShoppingBag, Package, Users, Receipt,
  AlertCircle, TrendingUp, Clock, CheckCircle, XCircle,
  ArrowUpRight, ArrowDownRight, Activity, Zap
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
      sub: `${todayCount} successful checkout${todayCount !== 1 ? 's' : ''}`,
      icon: ShoppingBag,
      variant: 'primary',
      trend: '+12.5%',
      trendUp: true
    },
    {
      label: 'Inventory Assets',
      value: productsCount.toString(),
      sub: `${lowStockProducts.length} items require restock`,
      icon: Package,
      variant: 'indigo',
      trend: '0.4%',
      trendUp: true
    },
    {
      label: 'Staff Activity',
      value: usersCount.toString(),
      sub: 'Active platform operators',
      icon: Users,
      variant: 'slate',
      trend: 'Stable',
      trendUp: null
    },
    {
      label: 'System Lifetime',
      value: `GH₵ ${allTimeTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      sub: `${pendingSales} payments awaiting verification`,
      icon: Activity,
      variant: 'primary',
      trend: '+4.2%',
      trendUp: true
    },
  ];

  const statusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">Verified</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-amber-500/5 text-amber-500 border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">Awaiting</Badge>;
      default:
        return <Badge variant="outline" className="bg-destructive/5 text-destructive border-destructive/20 text-[10px] font-bold uppercase tracking-wider">Registry Error</Badge>;
    }
  };

  const methodLabel: Record<string, string> = {
    cash: 'Fiat / Cash',
    card: 'Digital Card',
    mobile: 'Mobile Wallet',
  };

  return (
    <div className="space-y-10 pb-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.3em] mb-2">
            <Zap className="size-3 fill-primary" /> System Overview
          </div>
          <h1 className="text-4xl font-display font-extrabold tracking-tight">Executive Terminal</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Real-time analytics for{' '}
            <span className="text-foreground font-semibold">
              {new Date().toLocaleDateString('en-GH', {
                weekday: 'long', month: 'long', day: 'numeric',
              })}
            </span>
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="rounded-xl font-bold px-4">
            Custom Range
          </Button>
          <Button size="sm" className="rounded-xl font-bold px-4 shadow-lg shadow-primary/20">
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cluster */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="glass group hover:border-primary/30 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${
                    stat.variant === 'primary' ? 'bg-primary/10 text-primary' : 
                    stat.variant === 'indigo' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-slate-500/10 text-slate-500'
                  }`}>
                    <Icon className="size-5" />
                  </div>
                  {stat.trend !== 'Stable' && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${stat.trendUp ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {stat.trend} {stat.trendUp ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-display font-bold tracking-tight group-hover:text-primary transition-colors">{stat.value}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{stat.label}</p>
                  <p className="text-xs font-medium text-muted-foreground pt-2 border-t border-border/40 mt-3">{stat.sub}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Data Visualization & Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Flows */}
        <Card className="lg:col-span-2 glass overflow-hidden border-border/40 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between bg-secondary/30 px-6 py-4">
            <div className="space-y-0.5">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Receipt className="size-4 text-primary" /> Transaction Stream
              </CardTitle>
              <CardDescription className="text-xs font-medium uppercase tracking-wider opacity-60">Verified Settlement Ledger</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="rounded-lg text-xs font-bold">
              <Link href="/admin/reports">Audit History</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {recentSales.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                  <Receipt className="size-12 text-muted-foreground/20 mb-4" />
                  <p className="text-sm font-semibold text-muted-foreground">The settlement ledger is currently empty</p>
                </div>
              ) : (
                recentSales.map((sale: any) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <ShoppingBag className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-tight">
                          {methodLabel[sale.paymentMethod] ?? sale.paymentMethod}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                          {new Date(sale.createdAt).toLocaleTimeString('en-GH', {
                            hour: '2-digit', minute: '2-digit',
                          })}
                          {' '}· {sale.user?.name ? `${sale.user.name}` : 'Terminal'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="text-sm font-black text-foreground">
                        GH₵ {sale.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      {statusBadge(sale.paymentStatus)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Asset Alerts */}
        <Card className="glass border-border/40 shadow-xl">
          <CardHeader className="bg-secondary/30 px-6 py-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <AlertCircle className="size-4 text-destructive" /> Low Stock
            </CardTitle>
            <CardDescription className="text-xs font-medium uppercase tracking-wider opacity-60">Inventory Depletion Warnings</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {lowStockProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                  <CheckCircle className="size-12 text-emerald-500/20 mb-4" />
                  <p className="text-sm font-semibold text-muted-foreground">All inventory channels optimized</p>
                </div>
              ) : (
                lowStockProducts.map((product: any) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-destructive/5 transition-all group"
                  >
                    <div className="min-w-0 pr-4">
                      <p className="text-sm font-bold truncate group-hover:text-destructive transition-colors">{product.name}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5 truncate">{product.category?.name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-xs font-black p-1.5 px-3 rounded-lg border-2 ${
                        product.quantity === 0 
                        ? 'bg-destructive/10 text-destructive border-destructive/20' 
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {product.quantity} Units
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {lowStockProducts.length > 0 && (
              <div className="p-4 border-t border-border/40">
                <Button variant="outline" className="w-full text-xs font-bold rounded-xl border-destructive/20 hover:bg-destructive/5 hover:text-destructive transition-all" asChild>
                  <Link href="/admin/inventory">Initialize Restock</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Strategic Performance */}
      <Card className="glass border-border/40 shadow-xl overflow-hidden">
        <CardHeader className="bg-secondary/30 px-6 py-4 flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" /> Alpha Performance
            </CardTitle>
            <CardDescription className="text-xs font-medium uppercase tracking-wider opacity-60">High Velocity Product Index</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="rounded-lg text-xs font-bold">
            <Link href="/admin/products">Manifest Full List</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {topProducts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm font-semibold text-muted-foreground opacity-50">Accumulating velocity data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/40">
              {topProducts.map((item: any, i: number) => {
                const product = topProductMap[item.productId];
                if (!product) return null;
                return (
                  <div key={item.productId} className="flex items-center gap-4 px-6 py-6 group hover:bg-primary/5 transition-all">
                    <div className="size-12 rounded-2xl bg-secondary border border-border/40 flex items-center justify-center font-black text-lg shrink-0 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-transparent transition-all duration-300">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold group-hover:text-primary transition-colors truncate">{product.name}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5 truncate">{product.category?.name}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="h-1 flex-1 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${Math.min(100, (item._sum.quantity || 0) * 5)}%` }} />
                        </div>
                        <span className="text-[10px] font-black">{item._sum.quantity} Sold</span>
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
