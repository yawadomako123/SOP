"use client";
import { useState } from 'react';
import { Search, Filter, Download, Eye, RotateCcw, XCircle, CheckCircle, Receipt } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  time: string;
  cashier: string;
  customer?: string;
  items: number;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  status: string;
}

interface Props {
  initialTransactions: Transaction[];
}

export default function TransactionsClient({ initialTransactions }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');

  const filteredTransactions = initialTransactions.filter(txn => {
    const matchesSearch = 
      txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.cashier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (txn.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesStatus = selectedStatus === 'all' || txn.status === selectedStatus;
    const matchesPayment = selectedPayment === 'all' || txn.paymentMethod === selectedPayment;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalSales = filteredTransactions.reduce((sum, txn) => 
    txn.status === 'completed' ? sum + txn.total : sum, 0
  );
  const totalRefunded = filteredTransactions.reduce((sum, txn) => 
    txn.status === 'refunded' ? sum + txn.total : sum, 0
  );

  const handleExport = () => {
    const headers = ['Transaction ID', 'Date', 'Time', 'Cashier', 'Customer', 'Items', 'Total', 'Payment Method', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => 
        [t.id, t.date, t.time, t.cashier, t.customer || '', t.items, t.total, t.paymentMethod, t.status].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    a.style.visibility = 'hidden';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Transaction Management</h1>
          <p className="text-muted-foreground">View and manage all live transactions</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity">
          <Download className="w-5 h-5" />
          <span>Export Transactions</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <p className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-wider">Total Transactions</p>
          <p className="text-2xl font-bold">{filteredTransactions.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <p className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-wider">Completed Sales</p>
          <p className="text-2xl font-bold text-green-500">GH₵ {totalSales.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <p className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-wider">Refunded</p>
          <p className="text-2xl font-bold text-red-500">GH₵ {totalRefunded.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <p className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-wider">Pending Approval</p>
          <p className="text-2xl font-bold text-orange-500">
            {filteredTransactions.filter(t => t.status === 'pending').length}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by transaction ID, cashier, or customer..."
              className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-medium"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 appearance-none font-medium text-foreground cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
              <option value="voided">Voided</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 appearance-none font-medium text-foreground cursor-pointer"
            >
              <option value="all">All Payments</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mobile">Mobile Money</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Cashier</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">Payment</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredTransactions.map(txn => (
                <tr key={txn.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold font-mono tracking-wider text-sm">{txn.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold">{txn.date}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">{txn.time}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-foreground/80">{txn.cashier}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                    {txn.customer || '—'}
                  </td>
                  <td className="px-6 py-4 text-center font-bold">{txn.items}</td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-bold text-lg">GH₵ {txn.total.toFixed(2)}</p>
                    {txn.discount > 0 && (
                      <p className="text-xs font-bold text-green-500 mt-0.5">-GH₵ {txn.discount.toFixed(2)} discount</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1.5 bg-muted/50 border border-border/50 rounded-md text-xs font-bold uppercase tracking-wider">
                      {txn.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold capitalize border ${
                      txn.status === 'completed'
                        ? 'bg-green-500/10 text-green-600 border-green-500/20'
                        : txn.status === 'pending'
                        ? 'bg-orange-500/10 text-orange-600 border-orange-500/20'
                        : txn.status === 'refunded'
                        ? 'bg-red-500/10 text-red-600 border-red-500/20'
                        : 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20'
                    }`}>
                      {txn.status === 'completed' && <CheckCircle className="w-3.5 h-3.5" />}
                      {txn.status === 'pending' && <Receipt className="w-3.5 h-3.5" />}
                      {txn.status === 'refunded' && <RotateCcw className="w-3.5 h-3.5" />}
                      {txn.status === 'voided' && <XCircle className="w-3.5 h-3.5" />}
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 hover:bg-primary/10 text-primary border border-transparent hover:border-primary/20 rounded-lg transition-all" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      {txn.status === 'completed' && (
                        <button className="p-2 hover:bg-orange-500/10 text-orange-500 border border-transparent hover:border-orange-500/20 rounded-lg transition-all" title="Refund">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                      {txn.status === 'pending' && (
                        <button className="p-2 hover:bg-red-500/10 text-red-500 border border-transparent hover:border-red-500/20 rounded-lg transition-all" title="Void">
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-16 bg-muted/10">
            <Receipt className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-bold text-muted-foreground">No transactions found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your active filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
