"use client";
import { Calendar, Download, TrendingUp, DollarSign, ShoppingBag, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface SalesDay {
  day: string;
  sales: number;
  transactions: number;
}

interface ProductSale {
  product: string;
  sales: number;
}

interface Props {
  salesData: SalesDay[];
  productSales: ProductSale[];
  weeklySales: number;
  weeklyTransactions: number;
  avgTransaction: number;
  uniqueUsers: number;
}

export default function ReportsClient({ salesData, productSales, weeklySales, weeklyTransactions, avgTransaction, uniqueUsers }: Props) {
  const handleExport = () => {
    const headers = ['Day', 'Sales', 'Transactions'];
    const csvContent = [
      headers.join(','),
      ...salesData.map(d => [d.day, d.sales, d.transactions].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `reports_${new Date().toISOString().split('T')[0]}.csv`);
    a.style.visibility = 'hidden';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Business performance insights & database telemetry</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => alert("Report is already configured to show the trailing 7 days.")} className="flex items-center gap-2 px-4 py-2 bg-secondary/50 font-medium hover:bg-secondary/80 border border-border/50 rounded-lg transition-colors">
            <Calendar className="w-5 h-5" />
            <span>This Week</span>
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity">
            <Download className="w-5 h-5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <span className="text-sm font-bold text-green-500">Live DB</span>
          </div>
          <h3 className="mb-1 text-2xl font-bold">GH₵ {weeklySales.toFixed(2)}</h3>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Weekly Revenue</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <ShoppingBag className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-sm font-bold text-blue-500">Live DB</span>
          </div>
          <h3 className="mb-1 text-2xl font-bold">{weeklyTransactions}</h3>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Total Transactions</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <span className="text-sm font-bold text-purple-500">Live DB</span>
          </div>
          <h3 className="mb-1 text-2xl font-bold">GH₵ {avgTransaction.toFixed(2)}</h3>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Avg Transaction</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <Users className="w-6 h-6 text-orange-500" />
            </div>
            <span className="text-sm font-bold text-orange-500">Live DB</span>
          </div>
          <h3 className="mb-1 text-2xl font-bold">{uniqueUsers}</h3>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Unique Cashiers</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="mb-6 font-bold text-lg">Weekly Sales Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis dataKey="day" stroke="currentColor" opacity={0.5} tick={{ fontSize: 12, fontWeight: 600 }} />
              <YAxis stroke="currentColor" opacity={0.5} tick={{ fontSize: 12, fontWeight: 600 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontWeight: 600
                }}
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', r: 5, strokeWidth: 0 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="mb-6 font-bold text-lg">Top Selling Products</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productSales} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis dataKey="product" stroke="currentColor" opacity={0.5} tick={{ fontSize: 12, fontWeight: 600 }} />
              <YAxis stroke="currentColor" opacity={0.5} tick={{ fontSize: 12, fontWeight: 600 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontWeight: 600
                }}
              />
              <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Report */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="mb-6 font-bold text-lg">Daily Sales Breakdown</h2>
          <div className="space-y-3">
            {salesData.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-lg group hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                    <span className="font-bold">{day.day}</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">Aggregated Report</p>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">{day.transactions} logged transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-foreground">GH₵ {day.sales.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    Avg: GH₵ {day.transactions > 0 ? (day.sales / day.transactions).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
          <h2 className="mb-6 font-bold text-lg">Payment Methods Distribution</h2>
          <div className="space-y-5 flex-1 p-2">
            <div>
              <div className="flex gap-2 items-center mb-2">
                <span className="font-bold text-sm tracking-wide text-muted-foreground">Cash Payments</span>
                <span className="ml-auto font-bold text-lg">45%</span>
              </div>
              <div className="h-4 bg-muted border border-border/50 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
            <div>
              <div className="flex gap-2 items-center mb-2">
                <span className="font-bold text-sm tracking-wide text-muted-foreground">Card Payments</span>
                <span className="ml-auto font-bold text-lg">35%</span>
              </div>
              <div className="h-4 bg-muted border border-border/50 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>
            <div>
              <div className="flex gap-2 items-center mb-2">
                <span className="font-bold text-sm tracking-wide text-muted-foreground">Mobile Money</span>
                <span className="ml-auto font-bold text-lg">20%</span>
              </div>
              <div className="h-4 bg-muted border border-border/50 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border space-y-4">
            <h3 className="font-bold text-sm text-primary uppercase tracking-wider">Fast Facts</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/20 border border-border rounded-xl">
                <p className="text-xs font-bold text-muted-foreground mb-1 uppercase">Peak Hour</p>
                <p className="font-bold">2:00 PM - 4:00 PM</p>
              </div>
              <div className="p-4 bg-muted/20 border border-border rounded-xl">
                <p className="text-xs font-bold text-muted-foreground mb-1 uppercase">Best Day</p>
                <p className="font-bold text-primary">
                  {salesData.reduce((prev, current) => (prev.sales > current.sales) ? prev : current).day}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
