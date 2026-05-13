import { useState, useEffect } from 'react';
import VendorLayout from '../../components/vendor/VendorLayout';
import VendorGuard from '../../components/vendor/VendorGuard';
import { VendorAuthProvider } from '../../components/vendor/VendorAuthContext';
import apiClient from '../../config/api';
import { formatCurrency, formatDateShort as formatDate } from '../../lib/formatters';
import { orderStatusBadge } from '../../lib/vendorUtils';

const ORDER_TABS = ['All', 'Open', 'Closed', 'Cancelled'];
const PAGE_SIZE = 20;

function OrdersContent() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [pageNumber]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await ( apiClient as any).getVendorInvoices(PAGE_SIZE, pageNumber);
      const list = res?.values || res?.value || [];
      setOrders(list);
      setTotalCount(res?.recordCount || res?.['odata.count'] || list.length);
      setPageCount(res?.pageCount || res?.PageCount || 1);
    } catch {
      setOrders([]);
    }
    setLoading(false);
  };

  const getStatusLabel = (inv: any) => {
    if (inv.cancelled === 'tYES' || inv.cancelled === 'Y') return 'Cancelled';
    if (inv.documentStatus === 'bost_Close' || inv.documentStatus === 'Closed') return 'Closed';
    return 'Open';
  };

  const filteredOrders = orders.filter((o: any) => {
    const label = getStatusLabel(o);
    const matchesTab = activeTab === 'All' || label === activeTab;
    const matchesSearch = !searchQuery ||
      (o.cardName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(o.docNum || o.docEntry).includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  const statusBadge = orderStatusBadge;

  const viewOrderDetail = async (order: any) => {
    setSelectedOrder(order);
    if (!order.documentLines) {
      setDetailLoading(true);
      try {
        const detail = await ( apiClient as any).getVendorInvoice(order.docEntry);
        setSelectedOrder(detail);
      } catch {}
      setDetailLoading(false);
    }
  };

  return (
    <VendorGuard>
      <VendorLayout title="Orders" subtitle={`${totalCount} total orders`}
        actions={<button className="vp-btn vp-btn-secondary vp-btn-sm"><i className="fi-rs-download"></i> Export</button>}
      >
        <div className="vp-tabs">
          {ORDER_TABS.map((tab: any) => (
            <button key={tab} className={`vp-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>

        <div className="vp-filter-bar">
          <div className="vp-filter-search">
            <i className="fi-rs-search"></i>
            <input type="text" placeholder="Search orders by customer or doc #..." value={searchQuery} onChange={(e: any) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div className="vp-card">
          <div className="vp-table-wrap">
            <table className="vp-table">
              <thead><tr><th>Doc #</th><th>Customer</th><th>Total</th><th>Paid</th><th>Date</th><th>Due Date</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Loading orders...</td></tr>
                ) : filteredOrders.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No orders found</td></tr>
                ) : filteredOrders.map((order: any) => {
                  const label = getStatusLabel(order);
                  return (
                    <tr key={order.docEntry}>
                      <td><strong>#{order.docNum || order.docEntry}</strong></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.cardName || '-'}</div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>{order.cardCode}</div>
                      </td>
                      <td><strong>{formatCurrency(order.docTotal)}</strong></td>
                      <td style={{ color: '#1a5c38' }}>{formatCurrency(order.paidToDate || 0)}</td>
                      <td>{formatDate(order.docDate)}</td>
                      <td>{formatDate(order.docDueDate)}</td>
                      <td><span className={`vp-badge ${statusBadge(label)}`}><span className="vp-badge-dot"></span> {label}</span></td>
                      <td><button className="vp-btn vp-btn-secondary vp-btn-sm" onClick={() => viewOrderDetail(order)}>View</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="vp-pagination">
            <div className="vp-pagination-info">Page {pageNumber} of {pageCount} ({totalCount} total)</div>
            <div className="vp-pagination-btns">
              <button className="vp-pagination-btn" disabled={pageNumber <= 1} onClick={() => setPageNumber((p: any) => p - 1)}>
                <i className="fi-rs-angle-left" style={{ fontSize: 11 }}></i>
              </button>
              <button className="vp-pagination-btn active">{pageNumber}</button>
              <button className="vp-pagination-btn" disabled={pageNumber >= pageCount} onClick={() => setPageNumber((p: any) => p + 1)}>
                <i className="fi-rs-angle-right" style={{ fontSize: 11 }}></i>
              </button>
            </div>
          </div>
        </div>

        {selectedOrder && (
          <div className="vp-modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="vp-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
              <div className="vp-modal-header">
                <h3 className="vp-modal-title">Invoice #{selectedOrder.docNum || selectedOrder.docEntry}</h3>
                <button className="vp-modal-close" onClick={() => setSelectedOrder(null)}><i className="fi-rs-cross-small"></i></button>
              </div>
              <div className="vp-modal-body">
                {detailLoading ? (
                  <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>Loading details...</div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                      <div><div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, marginBottom: 4 }}>CUSTOMER</div><div style={{ fontWeight: 700 }}>{selectedOrder.cardName || '-'}</div><div style={{ fontSize: 13, color: '#6b7280' }}>{selectedOrder.cardCode}</div></div>
                      <div><div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, marginBottom: 4 }}>STATUS</div><span className={`vp-badge ${statusBadge(getStatusLabel(selectedOrder))}`}><span className="vp-badge-dot"></span> {getStatusLabel(selectedOrder)}</span></div>
                      <div><div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, marginBottom: 4 }}>INVOICE DATE</div><div style={{ fontWeight: 600 }}>{formatDate(selectedOrder.docDate)}</div></div>
                      <div><div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, marginBottom: 4 }}>DUE DATE</div><div style={{ fontWeight: 600 }}>{formatDate(selectedOrder.docDueDate)}</div></div>
                    </div>

                    {/* Line items */}
                    {selectedOrder.documentLines && selectedOrder.documentLines.length > 0 && (
                      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16, marginBottom: 16 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Line Items</div>
                        <table className="vp-table" style={{ fontSize: 13 }}>
                          <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                          <tbody>
                            {selectedOrder.documentLines.map((line: any, idx: any) => (
                              <tr key={idx}>
                                <td><div style={{ fontWeight: 600 }}>{line.itemDescription || line.itemCode}</div><div style={{ fontSize: 11, color: '#9ca3af' }}>{line.itemCode}</div></td>
                                <td>{line.quantity}</td>
                                <td>{formatCurrency(line.unitPrice || line.price)}</td>
                                <td><strong>{formatCurrency(line.lineTotal)}</strong></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: '#6b7280' }}>Total Amount</span><strong>{formatCurrency(selectedOrder.docTotal)}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: '#6b7280' }}>Paid</span><strong style={{ color: '#1a5c38' }}>{formatCurrency(selectedOrder.paidToDate || 0)}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Balance</span><strong style={{ color: (selectedOrder.docTotal - (selectedOrder.paidToDate || 0)) > 0.01 ? '#e74c3c' : '#1a5c38' }}>{formatCurrency(selectedOrder.docTotal - (selectedOrder.paidToDate || 0))}</strong></div>
                    </div>
                  </>
                )}
              </div>
              <div className="vp-modal-footer">
                <button className="vp-btn vp-btn-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </VendorLayout>
    </VendorGuard>
  );
}

export default function VendorOrders() {
  return <VendorAuthProvider><OrdersContent /></VendorAuthProvider>;
}
