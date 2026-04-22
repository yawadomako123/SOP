"use client";
import React, { useState } from 'react';
import { Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

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

interface PrintReportButtonProps {
  salesSummary: SalesSummary;
  paymentBreakdown: PaymentMethod[];
  cashierClosing: CashierClosing[];
  refundsVoids: RefundVoid[];
  expectedCash: number;
  actualCash: number;
  variance: number;
}

export default function PrintReportButton({
  salesSummary,
  paymentBreakdown,
  cashierClosing,
  refundsVoids,
  expectedCash,
  actualCash,
  variance
}: PrintReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      const currentDate = format(new Date(), 'PPpp');

      // Title
      doc.setFontSize(20);
      doc.text('EvansCouture Daily Closing Report', 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${currentDate}`, 14, 30);

      let yPos = 40;

      // Sales Summary
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Sales Summary', 14, yPos);
      yPos += 6;

      autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'Value']],
        body: [
          ['Total Transactions', salesSummary.totalTransactions.toString()],
          ['Gross Sales', `GHS ${salesSummary.totalSales.toFixed(2)}`],
          ['Tax Collected', `GHS ${salesSummary.totalTax.toFixed(2)}`],
          ['Discounts', `GHS ${salesSummary.totalDiscount.toFixed(2)}`],
          ['Net Sales', `GHS ${salesSummary.netSales.toFixed(2)}`],
        ],
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
        margin: { top: 10 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Payment Methods Breakdown
      doc.setFontSize(14);
      doc.text('Payment Methods Breakdown', 14, yPos);
      yPos += 6;

      autoTable(doc, {
        startY: yPos,
        head: [['Method', 'Transactions', 'Total Amount']],
        body: paymentBreakdown.map(p => [
          p.method,
          p.transactions.toString(),
          `GHS ${p.amount.toFixed(2)}`
        ]),
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Cash Reconciliation
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.text('Cash Reconciliation', 14, yPos);
      yPos += 6;

      autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'Amount']],
        body: [
          ['Expected Cash', `GHS ${expectedCash.toFixed(2)}`],
          ['Actual Cash', `GHS ${actualCash.toFixed(2)}`],
          ['Variance', `GHS ${variance.toFixed(2)}`],
        ],
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Cashier Closings
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.text('Cashier Shift Closings', 14, yPos);
      yPos += 6;

      autoTable(doc, {
        startY: yPos,
        head: [['Name', 'Shift', 'Status', 'Transactions', 'Sales']],
        body: cashierClosing.map(c => [
          c.name,
          c.shift,
          c.status.toUpperCase(),
          c.transactions.toString(),
          `GHS ${c.sales.toFixed(2)}`
        ]),
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Refunds and Voids
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.text('Refunds & Voids', 14, yPos);
      yPos += 6;

      if (refundsVoids.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [['Type', 'Transaction ID', 'Amount', 'Reason']],
          body: refundsVoids.map(r => [
            r.type,
            r.txnId,
            `GHS ${r.amount.toFixed(2)}`,
            r.reason
          ]),
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185] },
        });
      } else {
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text('No refunds or voids recorded for today.', 14, yPos);
      }

      doc.save(`Daily_Closing_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors border border-border disabled:opacity-50"
    >
      <Printer className="w-5 h-5" />
      <span className="font-semibold">{isGenerating ? 'Generating...' : 'Print Report'}</span>
    </button>
  );
}
