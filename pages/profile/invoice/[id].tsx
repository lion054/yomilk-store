import { useState, useEffect } from 'react';
import { useCart, useProducts } from '../../../hooks';
import Layout from '../../../components/layout/Layout';
import AuthGuard from '../../../components/guards/AuthGuard';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';
import apiClient from '../../../config/api';
import { normalizeProductForCart, createDefaultUOM } from '../../../lib/productTransformer';
import { formatCurrency, formatDateLong } from '../../../lib/formatters';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import StatusBadge from '../../../components/common/StatusBadge';
import { logger } from '../../../lib/logger';

export default function InvoiceDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { addToCart } = useCart();
  const { products: allProducts } = useProducts();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadInvoice = async () => {
      try {
        setLoading(true);
        const response = await ( apiClient as any).getSingleInvoice(id);
        setInvoice(response);
      } catch (error) {
        logger.error('Error loading invoice:', error);
        toast.error('Failed to load invoice details');
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [id]);

  const getAddressLines = () => {
    const street = (invoice as any)?.shipToStreet || (invoice as any)?.ShipToStreet || (invoice as any)?.billToStreet || (invoice as any)?.BillToStreet || (invoice as any)?.address || '';
    const city = (invoice as any)?.shipToCity || (invoice as any)?.ShipToCity || (invoice as any)?.billToCity || (invoice as any)?.BillToCity || '';
    const country = (invoice as any)?.shipToCountry || (invoice as any)?.ShipToCountry || (invoice as any)?.billToCountry || (invoice as any)?.BillToCountry || '';
    const zip = (invoice as any)?.shipToZipCode || (invoice as any)?.ShipToZipCode || (invoice as any)?.billToZipCode || (invoice as any)?.BillToZipCode || '';
    const lines = [];
    if (street) lines.push(street);
    if (city || country) lines.push([city, country].filter(Boolean).join(', '));
    if (zip) lines.push(zip);
    return lines.length ? lines : ['N/A'];
  };

  const handleReorder = () => {
    const items = (invoice as any)?.DocumentLines || (invoice as any)?.documentLines || (invoice as any)?.lines || [];
    if (items.length === 0) {
      toast.error('No items to reorder');
      return;
    }

    setReordering(true);
    let added = 0;

    for (const item of items) {
      const itemCode = item.ItemCode || item.itemCode;
      const qty = item.Quantity || item.quantity || 1;

      // Find product in cached products
      const product = allProducts.find(p =>
        (p.ItemCode || p.itemCode || '').toLowerCase() === (itemCode || '').toLowerCase()
      );

      if (product) {
        const normalized = normalizeProductForCart(product);
        let uoms = normalized.uoMs || normalized.uoms || [];
        if (uoms.length === 0) uoms = [createDefaultUOM(normalized)];

        // Match UOM from invoice if possible
        const invoiceUomEntry = item.UoMEntry || item.uoMEntry;
        const selectedUom = (invoiceUomEntry && uoms.find((u: any) => u.uomEntry === invoiceUomEntry)) || uoms[0];

        for (let i = 0; i < qty; i++) {
          addToCart(normalized, selectedUom);
        }
        added++;
      }
    }

    setReordering(false);

    if (added > 0) {
      toast.success(`${added} item(s) added to cart`);
      router.push('/cart');
    } else {
      toast.warning('Products are no longer available');
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const element = document.getElementById('invoice-pdf');
      if (!element) {
        toast.error('Unable to find invoice content');
        return;
      }

      const html2pdf = (await import('html2pdf.js')).default;
      const invoiceNumber = (invoice as any)?.DocNum || (invoice as any)?.docNum || (invoice as any)?.DocEntry || (invoice as any)?.docEntry || 'invoice';
      const fileName = `invoice-${invoiceNumber}.pdf`;

      await html2pdf()
        .from(element)
        .set({
          margin: 10,
          filename: fileName,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .save();
    } catch (error) {
      logger.error('Failed to generate PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <Layout parent="Account" sub="Invoice">
          <div className="page-content pt-150 pb-150">
            <div className="container">
              <div className="row">
                <div className="col-lg-10 m-auto">
                  <LoadingSpinner text="Loading invoice..." />
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  if (!invoice) {
    return (
      <AuthGuard>
        <Layout parent="Account" sub="Invoice">
          <div className="page-content pt-150 pb-150">
            <div className="container">
              <div className="row">
                <div className="col-lg-10 m-auto">
                  <EmptyState
                    icon="fi-rs-inbox"
                    title="Invoice Not Found"
                    text="The invoice you're looking for doesn't exist or you don't have access to it."
                  />
                  <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <Link href="/profile/invoice">
                      <button className="sf-btn sf-btn--green sf-btn--lg">
                        Back to Invoices
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  const lineItems = (invoice as any).DocumentLines || (invoice as any).documentLines || (invoice as any).lines || [];
  const docTotal = (invoice as any).DocTotal || (invoice as any).docTotal || 0;
  const vat = (invoice as any).VatSum || (invoice as any).taxAmount || 0;
  const shippingFee = (invoice as any).shippingAmount || 0;
  const subtotal = docTotal ? docTotal - vat - shippingFee : 0;
  const grandTotal = docTotal || 0;

  return (
    <AuthGuard>
      <Layout parent="Account" sub="Invoice">
        <div className="page-content pt-150 pb-150">
          <div className="container">
            <div className="row">
              <div className="col-lg-10 m-auto">
                <div id="invoice-pdf" className="invoice-pdf">
                  <style jsx>{`
                    #invoice-pdf {
                      background: #ffffff;
                      border: 1px solid #e5e7eb;
                      border-radius: 10px;
                      padding: 18px 20px;
                      font-size: 12px;
                      line-height: 1.35;
                      color: #111827;
                    }
                    #invoice-pdf .muted {
                      color: #6b7280;
                    }
                    #invoice-pdf .section-title {
                      font-size: 11px;
                      letter-spacing: 0.6px;
                      text-transform: uppercase;
                      color: #6b7280;
                      margin-bottom: 6px;
                      font-weight: 700;
                    }
                    #invoice-pdf .divider {
                      height: 1px;
                      background: #e5e7eb;
                      margin: 14px 0;
                    }
                    #invoice-pdf table {
                      width: 100%;
                      border-collapse: collapse;
                      background: #fff;
                    }
                    #invoice-pdf th,
                    #invoice-pdf td {
                      padding: 6px 4px;
                      font-size: 11px;
                      border-bottom: 1px solid #e5e7eb;
                    }
                    #invoice-pdf thead th {
                      font-size: 10.5px;
                      text-transform: uppercase;
                      letter-spacing: 0.4px;
                      color: #6b7280;
                      font-weight: 700;
                    }
                    #invoice-pdf .totals {
                      width: 100%;
                      margin-top: 8px;
                    }
                    #invoice-pdf .totals-row {
                      display: flex;
                      justify-content: space-between;
                      padding: 4px 0;
                      font-size: 12px;
                    }
                    #invoice-pdf .totals-strong {
                      font-weight: 800;
                    }
                    #invoice-pdf .no-border td {
                      border-bottom: none;
                    }
                  `}</style>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <img src="/assets/imgs/theme/snappy-logofull.png" alt="Snappy Fresh" style={{ height: "28px" }} />
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: "800" }}>Snappy Fresh</div>
                        <div className="muted" style={{ fontSize: "11px" }}>Fresh Dairy, Delivered</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="section-title" style={{ marginBottom: "2px" }}>Invoice</div>
                      <div style={{ fontSize: "16px", fontWeight: "800" }}>#{(invoice as any).DocNum || (invoice as any).docNum || (invoice as any).DocEntry || (invoice as any).docEntry}</div>
                      <div className="muted" style={{ fontSize: "11px" }}>Issued {formatDateLong((invoice as any).DocDate || (invoice as any).docDate)}</div>
                    </div>
                  </div>

                  <div className="divider"></div>

                  <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "16px" }}>
                    <div>
                      <div className="section-title">Bill To</div>
                      <div style={{ fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>
                        {(invoice as any).CardName || (invoice as any).cardName || (invoice as any).customerName || "Customer"}
                      </div>
                      <div className="muted" style={{ fontSize: "12px" }}>
                        {getAddressLines().map((line, index) => (
                          <div key={index}>{line}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="section-title">Details</div>
                      <div style={{ fontSize: "12px", display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span className="muted">Status</span>
                        <StatusBadge status={(invoice as any).DocStatus || (invoice as any).docStatus} />
                      </div>
                      <div style={{ fontSize: "12px", display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span className="muted">Due Date</span>
                        <span style={{ fontWeight: "700" }}>{formatDateLong((invoice as any).DocDueDate || (invoice as any).dueDate)}</span>
                      </div>
                      <div style={{ fontSize: "12px", display: "flex", justifyContent: "space-between" }}>
                        <span className="muted">Total</span>
                        <span style={{ fontWeight: "800" }}>{formatCurrency(grandTotal)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="divider"></div>

                  <div style={{ marginBottom: "12px" }}>
                    <div className="section-title" style={{ marginBottom: "8px" }}>Order Items</div>
                    {lineItems.length > 0 ? (
                      <table>
                        <thead>
                          <tr>
                            <th style={{ textAlign: "left" }}>Item</th>
                            <th style={{ textAlign: "right" }}>Qty</th>
                            <th style={{ textAlign: "right" }}>Unit Price</th>
                            <th style={{ textAlign: "right" }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lineItems.map((item: any, index: any) => (
                            <tr key={index}>
                              <td style={{ textAlign: "left" }}>
                                {item.ItemDescription || item.itemName || item.ItemCode || item.itemCode || 'Item'}
                              </td>
                              <td style={{ textAlign: "right" }}>
                                {item.Quantity || item.quantity || 0}
                              </td>
                              <td style={{ textAlign: "right" }}>
                                {formatCurrency(item.PriceAfterVAT || item.unitPrice || item.price || 0)}
                              </td>
                              <td style={{ textAlign: "right", fontWeight: "600" }}>
                                {formatCurrency((item.Quantity || item.quantity || 0) * (item.PriceAfterVAT || item.unitPrice || item.price || 0))}
                              </td>
                            </tr>
                          ))}
                          <tr className="no-border">
                            <td colSpan={4}></td>
                          </tr>
                        </tbody>
                      </table>
                    ) : (
                      <div className="muted" style={{ textAlign: "center", padding: "12px 0" }}>No items found</div>
                    )}
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ minWidth: "220px" }}>
                      <div className="totals">
                        <div className="totals-row">
                          <span className="muted">Subtotal</span>
                          <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="totals-row">
                          <span className="muted">VAT (Tax)</span>
                          <span>{formatCurrency(vat)}</span>
                        </div>
                        {shippingFee > 0 && (
                          <div className="totals-row">
                            <span className="muted">Shipping</span>
                            <span>{formatCurrency(shippingFee)}</span>
                          </div>
                        )}
                        <div className="totals-row totals-strong" style={{ borderTop: "1px solid #e5e7eb", paddingTop: "6px", marginTop: "4px" }}>
                          <span>Grand Total</span>
                          <span>{formatCurrency(grandTotal)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="sf-flex-end sf-mb-6" style={{ marginTop: '24px' }}>
                  <Link href="/profile/invoice">
                    <button className="sf-btn sf-btn--outline-gray sf-btn--lg">
                      <i className="fi-rs-arrow-left sf-icon-mr"></i>
                      Back to Invoices
                    </button>
                  </Link>
                  <button
                    onClick={handleDownloadPdf}
                    className="sf-btn sf-btn--green sf-btn--lg"
                  >
                    <i className="fi-rs-download sf-icon-mr"></i>
                    Download PDF
                  </button>
                  <button
                    onClick={handleReorder}
                    disabled={reordering}
                    className="sf-btn sf-btn--lg"
                    style={{
                      background: reordering
                        ? '#ccc'
                        : 'linear-gradient(135deg, #f6a700 0%, #e09600 100%)',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(246, 167, 0, 0.2)'
                    }}
                  >
                    <i className="fi-rs-shopping-cart sf-icon-mr"></i>
                    {reordering ? 'Adding to Cart...' : 'Reorder'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}
