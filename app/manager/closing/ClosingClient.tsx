"use client";
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Printer, Lock, Banknote, CreditCard, Smartphone, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const PrintReportButton = dynamic(() => import('./PrintReportButton'), { ssr: false });

interface SalesSummary {
  totalTransactions: number;
  totalSales: number;
  totalTax: number;
  totalDiscount: number;
  netSales: number;
}

interface PaymentMethod {
  method: string;
  transactions: number;
  amount: number;
  color: string;
}

interface CashierClosing {
  name: string;
  shift: string;
  transactions: number;
  sales: number;
  status: 'closed' | 'pending';
}

interface RefundVoid {
  type: string;
  txnId: string;
  amount: number;
  reason: string;
}

interface ClosingClientProps {
  salesSummary: SalesSummary;
  paymentBreakdown: PaymentMethod[];
  cashierClosing: CashierClosing[];
  refundsVoids: RefundVoid[];
  expectedCash: number;
}

export default function ClosingClient({
  salesSummary,
  paymentBreakdown,
  cashierClosing,
  refundsVoids,
  expectedCash
}: ClosingClientProps) {
  const [cashDrawerAmount, setCashDrawerAmount] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const actualCash = parseFloat(cashDrawerAmount) || 0;
  const variance = actualCash - expectedCash;

  const handleClosing = () => {
    setIsClosing(true);
    // Simulate closing process
    setTimeout(() => {
      alert('Daily closing completed successfully!');
      setIsClosing(false);
    }, 2000);
  };



  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'Cash': return Banknote;
      case 'Card': return CreditCard;
      case 'Mobile Money': return Smartphone;
      default: return Banknote;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Daily Closing</h1>
          <p className="text-muted-foreground">End of day reconciliation and reports</p>
        </div>
        <div className="flex items-center gap-3">
          <PrintReportButton 
            salesSummary={salesSummary}
            paymentBreakdown={paymentBreakdown}
            cashierClosing={cashierClosing}
            refundsVoids={refundsVoids}
            expectedCash={expectedCash}
            actualCash={actualCash}
            variance={variance}
          />
          <button
            onClick={handleClosing}
            disabled={!cashDrawerAmount || isClosing}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lock className="w-5 h-5" />
            <span>{isClosing ? 'Closing...' : 'Complete Closing'}</span>
          </button>
        </div>
      </div>

      {/* Alert for pending closings */}
      {cashierClosing.some(c => c.status === 'pending') && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-orange-500 mb-1">Pending Cashier Closings</p>
              <p className="text-sm text-muted-foreground font-medium">
                {cashierClosing.filter(c => c.status === 'pending').length} cashier(s) have not completed their shift closing.
                Please ensure all cashiers close their shifts before completing daily closing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sales Summary */}
      <div className="bg-card border border-border shadow-sm rounded-xl p-6">
        <h2 className="mb-4 font-bold text-lg">Sales Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="p-4 bg-background border border-border/50 rounded-lg">
            <p className="text-sm text-muted-foreground font-bold mb-1 uppercase tracking-wider">Total Transactions</p>
            <p className="text-2xl font-semibold">{salesSummary.totalTransactions}</p>
          </div>
          <div className="p-4 bg-background border border-border/50 rounded-lg">
            <p className="text-sm text-muted-foreground font-bold mb-1 uppercase tracking-wider">Gross Sales</p>
            <p className="text-2xl font-semibold">GH₵ {salesSummary.totalSales.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-background border border-border/50 rounded-lg">
            <p className="text-sm text-muted-foreground font-bold mb-1 uppercase tracking-wider">Tax Collected</p>
            <p className="text-2xl font-semibold text-blue-500">GH₵ {salesSummary.totalTax.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-background border border-border/50 rounded-lg">
            <p className="text-sm text-muted-foreground font-bold mb-1 uppercase tracking-wider">Discounts</p>
            <p className="text-2xl font-semibold text-red-500">GH₵ {salesSummary.totalDiscount.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm text-primary font-bold mb-1 uppercase tracking-wider">Net Sales</p>
            <p className="text-2xl font-bold text-primary">GH₵ {salesSummary.netSales.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Payment Methods Breakdown */}
      <div className="bg-card border border-border shadow-sm rounded-xl p-6">
        <h2 className="mb-4 font-bold text-lg">Payment Methods Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paymentBreakdown.map((payment, index) => {
            const Icon = getPaymentIcon(payment.method);
            return (
              <div key={index} className="p-4 bg-background border border-border/50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 bg-background rounded-lg border border-border/50 ${payment.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold">{payment.method}</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Transactions</span>
                    <span className="font-bold">{payment.transactions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Total</span>
                    <span className="font-bold">GH₵ {payment.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Reconciliation */}
        <div className="bg-card border border-border shadow-sm rounded-xl p-6">
          <h2 className="mb-4 font-bold text-lg">Cash Reconciliation</h2>
          
          <div className="space-y-4 mb-6">
            <div className="p-4 bg-background border border-border/50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground font-bold">Expected Cash</span>
                <span className="font-bold text-lg">GH₵ {expectedCash.toFixed(2)}</span>
              </div>
              <p className="text-xs font-semibold text-muted-foreground">Based on cash transactions in Live DB</p>
            </div>

            <div>
              <label htmlFor="cash-drawer" className="block mb-2 font-bold text-sm text-muted-foreground uppercase tracking-wider">
                Actual Cash in Drawer
              </label>
              <input
                id="cash-drawer"
                type="number"
                step="0.01"
                value={cashDrawerAmount}
                onChange={(e) => setCashDrawerAmount(e.target.value)}
                placeholder="Enter amount counted"
                className="w-full px-4 py-3 bg-background font-bold border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
            </div>

            {cashDrawerAmount && (
              <div className={`p-4 rounded-lg border-2 ${
                Math.abs(variance) < 0.01 
                  ? 'bg-green-500/10 border-green-500/20' 
                  : variance > 0 
                  ? 'bg-blue-500/10 border-blue-500/20'
                  : 'bg-red-500/10 border-red-500/20'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {Math.abs(variance) < 0.01 ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : variance > 0 ? (
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  )}
                  <h3 className="font-bold">Variance</h3>
                </div>
                <p className={`text-2xl font-bold ${
                  Math.abs(variance) < 0.01 
                    ? 'text-green-500' 
                    : variance > 0 
                    ? 'text-blue-500'
                    : 'text-red-500'
                }`}>
                  {variance >= 0 ? '+' : ''}GH₵ {variance.toFixed(2)}
                </p>
                <p className="text-sm font-semibold text-muted-foreground mt-1">
                  {Math.abs(variance) < 0.01 
                    ? 'Perfect match!' 
                    : variance > 0 
                    ? 'Cash over'
                    : 'Cash short'}
                </p>
              </div>
            )}
          </div>

          {variance !== 0 && cashDrawerAmount && (
            <div className="p-4 bg-muted/40 border border-border rounded-lg">
              <label htmlFor="variance-notes" className="block mb-2 font-bold text-sm text-muted-foreground uppercase tracking-wider">
                Variance Notes (Required)
              </label>
              <textarea
                id="variance-notes"
                placeholder="Explain the variance..."
                className="w-full px-3 py-2 bg-background border border-border font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm shadow-sm"
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Cashier Shift Closings */}
        <div className="bg-card border border-border shadow-sm rounded-xl p-6">
          <h2 className="mb-4 font-bold text-lg">Cashier Shift Status</h2>
          <div className="space-y-3">
            {cashierClosing.length === 0 ? (
                <div className="text-sm text-center font-bold text-muted-foreground p-6 rounded-lg border border-dashed border-border/50">No cashiers have processed sales today!</div>
            ) : cashierClosing.map((cashier, index) => (
              <div key={index} className="p-4 bg-background border border-border/50 rounded-lg transition-colors hover:bg-muted/10">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold">{cashier.name}</p>
                    <p className="text-sm font-semibold text-muted-foreground">{cashier.shift} Shift</p>
                  </div>
                  <span className={`px-3 py-1 font-bold rounded-full text-xs ${
                    cashier.status === 'closed'
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-orange-500/10 text-orange-500'
                  }`}>
                    {cashier.status === 'closed' ? '✓ Closed' : '○ Pending'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-border/50">
                  <div>
                    <p className="text-muted-foreground font-semibold uppercase tracking-wider text-xs mb-1">Transactions</p>
                    <p className="font-bold text-lg">{cashier.transactions}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-semibold uppercase tracking-wider text-xs mb-1">Sales</p>
                    <p className="font-bold text-lg text-primary">GH₵ {cashier.sales.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Refunds and Voids */}
      <div className="bg-card border border-border shadow-sm rounded-xl p-6">
        <h2 className="mb-4 font-bold text-lg">Refunds & Voids</h2>
        <div className="overflow-x-auto border border-border/50 rounded-xl">
          <table className="w-full">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="px-5 py-4 text-left font-bold text-muted-foreground uppercase text-xs tracking-wider">Type</th>
                <th className="px-5 py-4 text-left font-bold text-muted-foreground uppercase text-xs tracking-wider">Transaction ID</th>
                <th className="px-5 py-4 text-right font-bold text-muted-foreground uppercase text-xs tracking-wider">Amount</th>
                <th className="px-5 py-4 text-left font-bold text-muted-foreground uppercase text-xs tracking-wider">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {refundsVoids.length === 0 ? (
                <tr>
                   <td colSpan={4} className="p-8 text-center text-sm font-bold text-muted-foreground">No refunds or voids recorded for today.</td>
                </tr>
              ) : refundsVoids.map((item, index) => (
                <tr key={index} className="hover:bg-muted/10 transition-colors">
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 font-bold rounded text-xs ${
                      item.type === 'Refund' 
                        ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                        : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold font-mono text-sm">{item.txnId}</td>
                  <td className="px-5 py-4 text-right font-bold">GH₵ {item.amount.toFixed(2)}</td>
                  <td className="px-5 py-4 text-sm font-medium text-muted-foreground">{item.reason}</td>
                </tr>
              ))}
            </tbody>
            {refundsVoids.length > 0 && (
                <tfoot className="border-t border-border bg-muted/20">
                    <tr>
                        <td colSpan={2} className="px-5 py-4 font-bold tracking-wide uppercase text-sm">Total Adjustments</td>
                        <td className="px-5 py-4 text-right font-bold text-red-500 text-lg">
                        -GH₵ {refundsVoids.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                        </td>
                        <td></td>
                    </tr>
                </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-card border border-border shadow-sm rounded-xl p-6">
        <h2 className="mb-4 font-bold text-lg">Closing Notes</h2>
        <textarea
          placeholder="Add any additional notes or observations for this closing period..."
          className="w-full px-4 py-3 bg-background font-medium border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          rows={4}
        />
      </div>
    </div>
  );
}
