'use client';

import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

interface Props {
  completedSaleData: any;
  onDone: () => void;
}

export default function ReceiptDownloader({ completedSaleData, onDone }: Props) {
  const generateReceiptPDF = async () => {
    if (!completedSaleData) return;

    const doc = new jsPDF({ format: 'a5' });
    const isCash = completedSaleData.paymentMethod === 'cash';

    // Header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('EvansCouture', 74, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Sales Receipt', 74, 25, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Date: ${completedSaleData.date}`, 14, 45);
    doc.text(`Payment: ${completedSaleData.paymentMethod.toUpperCase()}`, 14, 52);
    //doc.text(`Status: ${isCash ? 'PAID' : 'PENDING PAYMENT'}`, 14, 59);

    // Items Table
    const tableColumn = ["Item", "Qty", "Price", "Total"];
    const tableRows = completedSaleData.items.map((item: any) => [
      item.product.name,
      item.quantity.toString(),
      `GHS ${item.product.price.toFixed(2)}`,
      `GHS ${(item.quantity * item.product.price).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 56,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      margin: { top: 56 }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 66;

    // Summary
    const summaryXLabel = 95;
    const summaryXValue = 134;

    doc.setFontSize(10);
    doc.text('Subtotal:', summaryXLabel, finalY + 10);
    doc.text(`GHS ${completedSaleData.subtotal.toFixed(2)}`, summaryXValue, finalY + 10, { align: 'right' });

    doc.text('Tax (12.5%):', summaryXLabel, finalY + 16);
    doc.text(`GHS ${completedSaleData.tax.toFixed(2)}`, summaryXValue, finalY + 16, { align: 'right' });

    doc.setDrawColor(200, 200, 200);
    doc.line(summaryXLabel, finalY + 20, summaryXValue, finalY + 20);

    doc.setFont('helvetica', 'bold');
    doc.text('Total:', summaryXLabel, finalY + 27);
    doc.text(`GHS ${completedSaleData.total.toFixed(2)}`, summaryXValue, finalY + 27, { align: 'right' });

    // QR Code for non-cash payments
    if (!isCash && completedSaleData.paystackUrl) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Scan to Pay', 74, finalY + 42, { align: 'center' });

      try {
        const qrDataUrl = await QRCode.toDataURL(completedSaleData.paystackUrl, {
          width: 150,
          margin: 1,
        });

        // Add QR code image centered
        doc.addImage(qrDataUrl, 'PNG', 50, finalY + 44, 50, 50);

        // Add the link below QR code
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(37, 99, 235);
        doc.text(completedSaleData.paystackUrl, 74, finalY + 97, {
          align: 'center',
          maxWidth: 120,
        });
        doc.setTextColor(0, 0, 0);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text('Pay with MoMo, Card or Bank — scan or visit the link above', 74, finalY + 134, { align: 'center' });
        doc.text('Thank you for shopping at EvansCouture!', 74, finalY + 141, { align: 'center' });
      } catch (err) {
        console.error('QR generation failed:', err);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('Thank you for shopping at EvansCouture!', 74, finalY + 45, { align: 'center' });
      }
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('Thank you for shopping at EvansCouture!', 74, finalY + 45, { align: 'center' });
    }

    doc.save('EvansCouture_receipt.pdf');
  };

  return (
    <div className="pt-4 flex flex-col gap-3">
      <button
        onClick={generateReceiptPDF}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-primary-foreground
         rounded-lg hover:opacity-90 transition-colors font-semibold shadow-sm"
      >
        <Download className="w-5 h-5" />
        <span>Download Receipt (PDF)</span>
      </button>
      <button
        onClick={onDone}
        className="w-full py-3 px-4 bg-secondary font-semibold hover:bg-secondary/80 border border-border rounded-lg transition-colors"
      >
        Start New Sale
      </button>
    </div>
  );
}