import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface InvoiceData {
  docNum: string;
  invoiceDate: string;
  dueDate: string;
  status: string;
  currency: string;
  amount: number;
  paidAmount: number;
  description?: string;
  items?: InvoiceItem[];
  customer?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  company?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

export interface InvoiceItem {
  itemCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class InvoicePdfService {

  generateInvoicePdf(invoice: InvoiceData): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Colors
    const primaryColor: [number, number, number] = [66, 175, 87]; // #42af57
    const darkColor: [number, number, number] = [28, 53, 44]; // #1c352c
    const grayColor: [number, number, number] = [107, 114, 128];

    // Header Background
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Company Logo/Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('SNAPPY FRESH', 20, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Fresh . Fast Delivery', 20, 28);

    // Invoice Label
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - 20, 25, { align: 'right' });

    // Invoice Number Box
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageWidth - 70, 30, 50, 12, 2, 2, 'F');
    doc.setTextColor(...darkColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.docNum, pageWidth - 45, 38, { align: 'center' });

    // Reset text color
    doc.setTextColor(...darkColor);

    // Company Details (Left)
    let yPos = 60;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('From:', 20, yPos);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    yPos += 7;
    doc.text(invoice.company?.name || 'Snappy Fresh Ltd', 20, yPos);
    yPos += 5;
    doc.setTextColor(...grayColor);
    doc.text(invoice.company?.address || '185 Loreley Close, Msasa, Harare', 20, yPos);
    yPos += 5;
    doc.text(invoice.company?.phone || '+263 782 978 460', 20, yPos);
    yPos += 5;
    doc.text(invoice.company?.email || 'sales@snappyfresh.net', 20, yPos);

    // Customer Details (Right)
    yPos = 60;
    doc.setTextColor(...darkColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', pageWidth - 80, yPos);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    yPos += 7;
    doc.text(invoice.customer?.name || 'Demo Business Solutions Ltd', pageWidth - 80, yPos);
    yPos += 5;
    doc.setTextColor(...grayColor);
    doc.text(invoice.customer?.address || '123 Demo Street, Nairobi', pageWidth - 80, yPos);
    yPos += 5;
    doc.text(invoice.customer?.phone || '+254 700 000 000', pageWidth - 80, yPos);
    yPos += 5;
    doc.text(invoice.customer?.email || 'demo@example.com', pageWidth - 80, yPos);

    // Invoice Info Box
    yPos = 100;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, yPos, pageWidth - 40, 25, 3, 3, 'F');

    doc.setTextColor(...darkColor);
    doc.setFontSize(9);

    // Invoice Date
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Date', 30, yPos + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(this.formatDate(invoice.invoiceDate), 30, yPos + 16);

    // Due Date
    doc.setFont('helvetica', 'bold');
    doc.text('Due Date', 80, yPos + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(this.formatDate(invoice.dueDate), 80, yPos + 16);

    // Status
    doc.setFont('helvetica', 'bold');
    doc.text('Status', 130, yPos + 8);
    doc.setFont('helvetica', 'normal');
    const statusColor = this.getStatusColor(invoice.status);
    doc.setTextColor(...statusColor);
    doc.text(invoice.status, 130, yPos + 16);

    // Amount Due
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Amount Due', pageWidth - 50, yPos + 8);
    doc.setFontSize(12);
    doc.text(`${invoice.currency} ${this.formatNumber(invoice.amount - invoice.paidAmount)}`, pageWidth - 50, yPos + 17);

    // Items Table
    yPos = 140;

    // Generate mock items if not provided
    const items = invoice.items || this.generateMockItems(invoice);

    autoTable(doc, {
      startY: yPos,
      head: [['Item', 'Description', 'Qty', 'Unit Price', 'Total']],
      body: items.map(item => [
        item.itemCode,
        item.description,
        item.quantity.toString(),
        `${invoice.currency} ${this.formatNumber(item.unitPrice)}`,
        `${invoice.currency} ${this.formatNumber(item.total)}`
      ]),
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: darkColor
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 35, halign: 'right' }
      },
      margin: { left: 20, right: 20 }
    });

    // Get the Y position after table
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Totals Section
    const totalsX = pageWidth - 80;
    let totalsY = finalY;

    // Subtotal
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    doc.text('Subtotal:', totalsX, totalsY);
    doc.setTextColor(...darkColor);
    doc.text(`${invoice.currency} ${this.formatNumber(invoice.amount)}`, pageWidth - 20, totalsY, { align: 'right' });

    // Tax (if applicable)
    totalsY += 8;
    doc.setTextColor(...grayColor);
    doc.text('Tax (0%):', totalsX, totalsY);
    doc.setTextColor(...darkColor);
    doc.text(`${invoice.currency} 0.00`, pageWidth - 20, totalsY, { align: 'right' });

    // Paid
    if (invoice.paidAmount > 0) {
      totalsY += 8;
      doc.setTextColor(...grayColor);
      doc.text('Paid:', totalsX, totalsY);
      doc.setTextColor(34, 197, 94); // Green
      doc.text(`-${invoice.currency} ${this.formatNumber(invoice.paidAmount)}`, pageWidth - 20, totalsY, { align: 'right' });
    }

    // Total Line
    totalsY += 5;
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(totalsX - 10, totalsY, pageWidth - 20, totalsY);

    // Total Due
    totalsY += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    doc.text('Total Due:', totalsX, totalsY);
    const balanceDue = invoice.amount - invoice.paidAmount;
    if (balanceDue > 0) {
      doc.setTextColor(...primaryColor);
    } else {
      doc.setTextColor(34, 197, 94);
    }
    doc.text(`${invoice.currency} ${this.formatNumber(balanceDue)}`, pageWidth - 20, totalsY, { align: 'right' });

    // Payment Instructions
    const paymentY = totalsY + 25;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, paymentY, pageWidth - 40, 35, 3, 3, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    doc.text('Payment Information', 30, paymentY + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...grayColor);
    doc.text('Bank: Steward Bank', 30, paymentY + 18);
    doc.text('Account Name: Snappy Fresh (Pvt) Ltd', 30, paymentY + 25);
    doc.text('Account Number: 1234567890', 30, paymentY + 32);

    doc.text('EcoCash: 0782 978 460', pageWidth - 60, paymentY + 18);
    doc.text('Reference: ' + invoice.docNum, pageWidth - 60, paymentY + 25);

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(20, footerY - 10, pageWidth - 20, footerY - 10);

    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    doc.text('Thank you for your business!', pageWidth / 2, footerY - 3, { align: 'center' });
    doc.text('Questions? Contact us at support@snappyfresh.net', pageWidth / 2, footerY + 3, { align: 'center' });

    // Save the PDF
    doc.save(`Invoice_${invoice.docNum}.pdf`);
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  private formatNumber(num: number): string {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  private getStatusColor(status: string): [number, number, number] {
    switch (status.toLowerCase()) {
      case 'paid':
        return [34, 197, 94]; // Green
      case 'overdue':
        return [239, 68, 68]; // Red
      case 'due soon':
        return [234, 179, 8]; // Yellow
      default:
        return [107, 114, 128]; // Gray
    }
  }

  private generateMockItems(invoice: InvoiceData): InvoiceItem[] {
    // Generate some mock items based on invoice total
    const items: InvoiceItem[] = [];
    const baseAmount = invoice.amount;

    if (baseAmount > 500) {
      items.push({
        itemCode: 'MILK-001',
        description: 'Fresh Full Cream Milk (500ml x 24)',
        quantity: 10,
        unitPrice: 45.00,
        total: 450.00
      });
    }

    if (baseAmount > 300) {
      items.push({
        itemCode: 'YOG-002',
        description: 'Plain Yogurt (1L x 12)',
        quantity: 5,
        unitPrice: 38.00,
        total: 190.00
      });
    }

    if (baseAmount > 200) {
      items.push({
        itemCode: 'CHE-003',
        description: 'Cheddar Cheese Block (500g)',
        quantity: 8,
        unitPrice: 25.50,
        total: 204.00
      });
    }

    items.push({
      itemCode: 'BUT-004',
      description: 'Salted Butter (250g)',
      quantity: Math.ceil((baseAmount - items.reduce((sum, i) => sum + i.total, 0)) / 12.50),
      unitPrice: 12.50,
      total: baseAmount - items.reduce((sum, i) => sum + i.total, 0)
    });

    return items;
  }
}
