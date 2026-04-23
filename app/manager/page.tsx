import { prisma } from '@/lib/prisma';
import { TrendingUp, Users, DollarSign, Receipt, Clock, AlertCircle, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { approveUser, suspendUser } from './staff/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const revalidate = 60;

export default async function ManagerDashboardPage() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [todaysSales, recentSales, pendingUsers] = await Promise.all([
    prisma.sale.findMany({
      where: { createdAt: { gte: startOfDay, lte: endOfDay } },
      include: { user: true, items: true }
    }),
    prisma.sale.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true, items: true }
    }),
    prisma.user.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  const totalRevenue = todaysSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const transactionCount = todaysSales.length;
  const avgTransaction = transactionCount > 0 ? totalRevenue / transactionCount : 0;

  const cashierMap = new Map();
  todaysSales.forEach(sale => {
    if (!cashierMap.has(sale.userId)) {
      cashierMap.set(sale.userId, { id: sale.user.id, name: sale.user.name, transactions: 0, sales: 0 });
    }
    const c = cashierMap.get(sale.userId);
    c.transactions += 1;
    c.sales += sale.totalAmount;
  });
  const cashierPerformance = Array.from(cashierMap.values()).map(c => ({
    ...c, shift: 'Today', status: 'active', accuracy: 100
  }));

  const recentTransactionsUI = recentSales.map(sale => ({
    id: sale.id.slice(0, 8).toUpperCase(),
    cashier: sale.user.name,
    time: new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    amount: sale.totalAmount,
    status: 'completed',
    method: sale.paymentMethod,
    items: sale.items.reduce((sum, item) => sum + item.quantity, 0)
  }));

  const hourlyData = Array(12).fill(0);
  todaysSales.forEach(sale => {
    const hour = new Date(sale.createdAt).getHours();
    if (hour >= 8 && hour <= 19) hourlyData[hour - 8] += sale.totalAmount;
  });
  const maxHourly = Math.max(...hourlyData, 1);
  const normalizedHourly = hourlyData.map(val => (val / maxHourly) * 100);

  const pendingApprovals = pendingUsers.map((u: any) => ({
    id: u.id.slice(0, 8).toUpperCase(),
    fullId: u.id,
    cashier: u.name || u.email,
    reason: `Sign-up via ${u.email.includes('@') ? 'Email' : 'System'}`,
  }));

  const stats = [
    { label: "Today's Revenue", value: `GH₵ ${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/15' },
    { label: 'Transactions', value: transactionCount.toString(), icon: Receipt, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/15' },
    { label: 'Active Cashiers', value: cashierMap.size.toString(), icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/15' },
    { label: 'Avg Transaction', value: `GH₵ ${avgTransaction.toFixed(2)}`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/15' },
  ];

  const methodIcon: Record<string, string> = { cash: '💵', card: '💳', mobile: '📱' };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="size-3.5 text-primary fill-primary" />
            <span className="text-primary font-bold text-xs uppercase tracking-[0.3em]">Live Operations</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold tracking-tight mb-1">Manager Dashboard</h1>
          <p className="text-muted-foreground text-sm font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border/60 rounded-xl">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <Link
            href="/manager/closing"
            className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all text-sm shadow-lg shadow-primary/20"
          >
            End Shift Report
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card-hover relative bg-card border border-border/50 rounded-2xl p-6 overflow-hidden">
              <div className={`absolute top-0 right-0 w-20 h-20 ${stat.bg} rounded-full blur-2xl opacity-40 -translate-y-6 translate-x-6`} />
              <div className="relative">
                <div className={`inline-flex p-2.5 rounded-xl ${stat.bg} border ${stat.border} mb-4`}>
                  <Icon className={`size-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-display font-black tracking-tight mb-1">{stat.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-amber-400 font-bold">
              Pending Approvals ({pendingApprovals.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {pendingApprovals.map((request: any) => (
              <div key={request.id} className="bg-card border border-border/60 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-sm">Account Request</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{request.id}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 font-bold rounded-full text-[10px] border border-amber-500/20">
                    Pending
                  </span>
                </div>
                <p className="text-sm mb-1 font-semibold truncate">{request.cashier}</p>
                <p className="text-xs text-muted-foreground mb-4">{request.reason}</p>
                <div className="flex gap-2">
                  <form action={approveUser.bind(null, request.fullId)} className="flex-1">
                    <Button type="submit" size="sm" className="w-full h-9 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white font-bold rounded-xl">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                    </Button>
                  </form>
                  <form action={suspendUser.bind(null, request.fullId)} className="flex-1">
                    <Button type="submit" size="sm" className="w-full h-9 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white font-bold rounded-xl">
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Deny
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cashier Performance */}
        <Card className="border-border/50">
          <CardHeader className="px-6 py-4 border-b border-border/40 bg-secondary/20">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="size-4 text-primary" /> Cashier Performance
            </CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-wider opacity-50 font-semibold">Today</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {cashierPerformance.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground/50">
                <Users className="w-10 h-10 mx-auto opacity-20 mb-3" />
                <p className="text-sm font-semibold">No activity today</p>
              </div>
            ) : cashierPerformance.map(cashier => (
              <div key={cashier.id} className="p-4 bg-secondary/30 border border-border/40 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold">{cashier.name}</p>
                    <p className="text-xs text-muted-foreground">{cashier.shift} Shift</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 bg-background/60 border border-border/30 rounded-lg p-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">Txns</p>
                    <p className="font-black text-lg">{cashier.transactions}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">Sales</p>
                    <p className="font-black text-lg text-primary">GH₵ {cashier.sales.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">Acc.</p>
                    <p className="font-black text-lg text-emerald-400">{cashier.accuracy}%</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="border-border/50">
          <CardHeader className="px-6 py-4 border-b border-border/40 bg-secondary/20">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Receipt className="size-4 text-primary" /> Recent Transactions
            </CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-wider opacity-50 font-semibold">All Cashiers</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/30">
              {recentTransactionsUI.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground/50 px-6">
                  <Receipt className="w-10 h-10 mx-auto opacity-20 mb-3" />
                  <p className="text-sm font-semibold">No transactions yet</p>
                </div>
              ) : recentTransactionsUI.map(txn => (
                <div key={txn.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-primary/5 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-secondary/80 border border-border/40 flex items-center justify-center text-base group-hover:bg-primary/10 transition-colors">
                      {methodIcon[txn.method] ?? '💰'}
                    </div>
                    <div>
                      <p className="font-bold font-mono text-xs tracking-wider">{txn.id}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <span className="font-semibold text-foreground/80">{txn.cashier}</span> · {txn.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black">GH₵ {txn.amount.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">{txn.items} item{txn.items !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly chart */}
      <Card className="border-border/50">
        <CardHeader className="px-6 py-4 border-b border-border/40 bg-secondary/20">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" /> Hourly Sales Volume
          </CardTitle>
          <CardDescription className="text-[10px] uppercase tracking-wider opacity-50 font-semibold">Today 8AM – 7PM</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-12 gap-2 items-end h-48">
            {normalizedHourly.map((heightPercent, index) => {
              const hour = index + 8;
              const displayHour = hour > 12 ? hour - 12 : hour;
              const period = hour >= 12 ? 'PM' : 'AM';
              const realValue = hourlyData[index];
              return (
                <div key={index} className="flex flex-col items-center gap-2 w-full group relative">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-foreground text-background text-[10px] font-bold py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap z-10">
                    GH₵ {realValue.toFixed(0)}
                  </div>
                  <div
                    className="w-full bg-primary/20 group-hover:bg-primary rounded-t-lg transition-all duration-500 min-h-[4px] border-t-2 border-primary/40 group-hover:border-primary"
                    style={{ height: `${Math.max(4, heightPercent)}%` }}
                  />
                  <p className="text-[9px] text-muted-foreground font-semibold whitespace-nowrap">
                    {displayHour}{period}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
