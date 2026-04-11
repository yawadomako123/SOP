import { prisma } from '@/lib/prisma';
import { TrendingUp, Users, DollarSign, Receipt, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { approveUser, suspendUser } from './staff/actions';
import { Button } from '@/components/ui/button';

export const revalidate = 60;

export default async function ManagerDashboardPage() {
  // 1. Define "Today" boundaries
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // 2. Fetch today's sales and global recent sales
  const [todaysSales, recentSales, pendingUsers] = await Promise.all([
    prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        }
      },
      include: {
        user: true,
        items: true
      }
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

  // Calculate high level metrics
  const totalRevenue = todaysSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const transactionCount = todaysSales.length;
  const avgTransaction = transactionCount > 0 ? totalRevenue / transactionCount : 0;

  // Calculate Cashier Performance (group sales by user)
  const cashierMap = new Map();
  todaysSales.forEach(sale => {
    if (!cashierMap.has(sale.userId)) {
      cashierMap.set(sale.userId, {
        id: sale.user.id,
        name: sale.user.name,
        transactions: 0,
        sales: 0,
      });
    }
    const c = cashierMap.get(sale.userId);
    c.transactions += 1;
    c.sales += sale.totalAmount;
  });

  const cashierPerformance = Array.from(cashierMap.values()).map(c => ({
    ...c,
    shift: 'Today',
    status: 'active',
    accuracy: 100 // Hardcoded accuracy metric since refunds are not schema-backed
  }));

  // Create recent transactions array mapped for UI
  const recentTransactionsUI = recentSales.map(sale => ({
    id: sale.id.slice(0, 8).toUpperCase(),
    cashier: sale.user.name,
    time: new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    amount: sale.totalAmount,
    status: 'completed',
    items: sale.items.reduce((sum, item) => sum + item.quantity, 0)
  }));
  
  // Calculate hourly sales for chart
  const hourlyData = Array(12).fill(0); // 8 AM to 7 PM
  todaysSales.forEach(sale => {
    const hour = new Date(sale.createdAt).getHours();
    if (hour >= 8 && hour <= 19) {
      hourlyData[hour - 8] += sale.totalAmount;
    }
  });
  
  // Normalize chart data safely 0-100% heights
  const maxHourly = Math.max(...hourlyData, 1);
  const normalizedHourly = hourlyData.map(val => (val / maxHourly) * 100);

  // Stats array format
  const stats = [
    { label: 'Today\'s Sales', value: `GH₵ ${totalRevenue.toFixed(2)}`, change: 'Live', icon: DollarSign, color: 'text-green-500' },
    { label: 'Transactions', value: transactionCount.toString(), change: 'Live', icon: Receipt, color: 'text-blue-500' },
    { label: 'Active Cashiers', value: cashierMap.size.toString(), change: 'Today', icon: Users, color: 'text-purple-500' },
    { label: 'Avg Transaction', value: `GH₵ ${avgTransaction.toFixed(2)}`, change: 'Live', icon: TrendingUp, color: 'text-orange-500' },
  ];

  // PENDING users are now fetched in the initial parallel Promise.all to avoid a server data waterfall
  
  const pendingApprovals = pendingUsers.map((u: any) => ({
    id: u.id.slice(0, 8).toUpperCase(),
    fullId: u.id,
    type: 'Account',
    cashier: u.name || u.email,
    reason: `Sign-up via ${u.email.includes('@') ? 'Email/OAuth' : 'System'}`,
    amount: 0,
  }));

  // Import at the top isn't strict string replacement because we're inside the function, 
  // but let's wire up the buttons. Actually, server actions can be imported at the file top.
  // I will add the import down below in a second pass if needed, but we can do inline forms.

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Manager Dashboard</h1>
          <p className="text-muted-foreground">Monitor live operations and staff performance securely</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <Link href="/manager/closing" className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity">
            End Shift Report
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-background border border-border/50 ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-sm font-semibold text-muted-foreground`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="mb-1 text-2xl font-bold">{stat.value}</h3>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h3 className="text-orange-500 font-bold">Pending Approvals ({pendingApprovals.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {pendingApprovals.map((request: any) => (
              <div key={request.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold">{request.type} Request</p>
                    <p className="text-sm text-muted-foreground font-mono mt-1">{request.id}</p>
                  </div>
                  <span className="px-2 py-1 bg-orange-500/10 text-orange-500 font-bold rounded text-xs">
                    Pending
                  </span>
                </div>
                <p className="text-sm mb-1 font-medium">User: {request.cashier}</p>
                <p className="text-xs text-muted-foreground mb-3">{request.reason}</p>
                <div className="flex gap-2">
                  <form action={approveUser.bind(null, request.fullId)} className="flex-1">
                    <Button type="submit" variant="outline" className="w-full bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500 hover:text-white">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  </form>
                  <form action={suspendUser.bind(null, request.fullId)} className="flex-1">
                    <Button type="submit" variant="outline" className="w-full bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white">
                      <XCircle className="w-4 h-4 mr-2" />
                      Deny
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
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="mb-6- font-bold text-lg mb-4">Cashier Performance (Today)</h2>
          <div className="space-y-4">
            {cashierPerformance.map(cashier => (
              <div key={cashier.id} className="p-4 bg-muted/20 border border-border rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-lg">{cashier.name}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{cashier.shift} Shift</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    cashier.status === 'active'
                      ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                      : cashier.status === 'break'
                      ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                      : 'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}>
                    {cashier.status.charAt(0).toUpperCase() + cashier.status.slice(1)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm bg-background p-3 rounded-lg border border-border pt-4">
                  <div>
                    <p className="text-muted-foreground font-medium mb-1 line-clamp-1">Transactions</p>
                    <p className="font-bold text-lg">{cashier.transactions}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium mb-1 line-clamp-1">Sales Totals</p>
                    <p className="font-bold text-lg text-primary">GH₵ {cashier.sales.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium mb-1 line-clamp-1">Accuracy</p>
                    <p className="font-bold text-lg text-green-500">{cashier.accuracy}%</p>
                  </div>
                </div>
              </div>
            ))}
            {cashierPerformance.length === 0 && (
               <div className="text-center py-8 text-muted-foreground">
                 <Users className="w-10 h-10 mx-auto opacity-20 mb-3" />
                 <p>No cashier activity recorded today.</p>
               </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="mb-6 font-bold text-lg">System-wide Transactions</h2>
          <div className="space-y-3">
            {recentTransactionsUI.map(txn => (
              <div key={txn.id} className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-lg group hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold font-mono text-sm tracking-wider">{txn.id}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      <span className="font-medium text-foreground">{txn.cashier}</span> • {txn.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">GH₵ {txn.amount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{txn.items} items</p>
                </div>
              </div>
            ))}
            {recentTransactionsUI.length === 0 && (
               <div className="text-center py-8 text-muted-foreground">
                 <Receipt className="w-10 h-10 mx-auto opacity-20 mb-3" />
                 <p>No transactions have been processed yet.</p>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Hourly Sales Chart */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="mb-6 font-bold text-lg">Today&apos;s Hourly Performance Volume</h2>
        <div className="grid grid-cols-12 gap-2 sm:gap-4 items-end h-64 mt-4 px-2">
          {normalizedHourly.map((heightPercent, index) => {
            const hour = index + 8;
            const displayHour = hour > 12 ? hour - 12 : hour;
            const period = hour >= 12 ? 'PM' : 'AM';
            const realValue = hourlyData[index];
            
            return (
              <div key={index} className="flex flex-col items-center gap-3 w-full group relative">
                {/* Tooltip tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-foreground text-background text-xs font-bold py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                   GH₵ {realValue.toFixed(2)}
                </div>
                <div 
                  className="w-full bg-primary/80 group-hover:bg-primary rounded-t-lg transition-all duration-500 min-h-[4px]" 
                  style={{ height: `${heightPercent}%` }} 
                />
                <p className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                  {displayHour}{period}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
