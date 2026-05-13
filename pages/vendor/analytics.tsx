import { useState, useEffect } from 'react';
import VendorLayout from '../../components/vendor/VendorLayout';
import VendorGuard from '../../components/vendor/VendorGuard';
import { VendorAuthProvider } from '../../components/vendor/VendorAuthContext';
import apiClient from '../../config/api';
import { formatCurrency } from '../../lib/formatters';

function AnalyticsContent() {
  const [_period, _setPeriod] = useState('This Month');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [_items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [invRes, itemRes] = await Promise.all([
        ( apiClient as any).getVendorInvoices(100, 1).catch(() => null),
        ( apiClient as any).getVendorItems().catch(() => null),
      ]);
      const invList = invRes?.values || invRes?.value || [];
      setInvoices(invList);
      const itemList = Array.isArray(itemRes) ? itemRes : itemRes?.values || itemRes?.value || [];
      setItems(itemList);
    } catch {}
    setLoading(false);
  };

  // Calculate stats from invoices
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.docTotal || 0), 0);
  const totalOrders = invoices.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Get unique customers
  const uniqueCustomers = new Set(invoices.map((inv: any) => inv.cardCode).filter(Boolean)).size;

  // Build top products from invoice line items
  const productMap: any = {};
  invoices.forEach((inv: any ) => {
    (inv.documentLines || []).forEach((line: any ) => {
      const key = line.itemCode || line.itemDescription;
      if (!key) return;
      if (!productMap[key]) {
        productMap[key] = { name: line.itemDescription || line.itemCode, code: line.itemCode, quantity: 0, revenue: 0 };
      }
      productMap[key].quantity += line.quantity || 0;
      productMap[key].revenue += line.lineTotal || 0;
    });
  });
  const topProducts: any[] = Object.values(productMap).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, 10);
  const topTotalRev: number = topProducts.reduce((s: any, p: any) => s + p.revenue, 0);

  return (
    <VendorGuard>
      <VendorLayout title="Analytics" subtitle="Track your store performance"
        actions={<button className="vp-btn vp-btn-secondary vp-btn-sm" onClick={loadAnalytics}><i className="fi-rs-refresh"></i> Refresh</button>}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>Loading analytics...</div>
        ) : (
          <>
            <div className="vp-stats-grid">
              <div className="vp-stat-card vp-animate-in vp-delay-1"><div className="vp-stat-icon green"><i className="fi-rs-dollar"></i></div><div className="vp-stat-value">{formatCurrency(totalRevenue)}</div><div className="vp-stat-label">Total Revenue</div></div>
              <div className="vp-stat-card vp-animate-in vp-delay-2"><div className="vp-stat-icon blue"><i className="fi-rs-shopping-bag"></i></div><div className="vp-stat-value">{totalOrders}</div><div className="vp-stat-label">Total Orders</div></div>
              <div className="vp-stat-card vp-animate-in vp-delay-3"><div className="vp-stat-icon orange"><i className="fi-rs-receipt"></i></div><div className="vp-stat-value">{formatCurrency(avgOrderValue)}</div><div className="vp-stat-label">Avg. Order Value</div></div>
              <div className="vp-stat-card vp-animate-in vp-delay-4"><div className="vp-stat-icon blue"><i className="fi-rs-users"></i></div><div className="vp-stat-value">{uniqueCustomers}</div><div className="vp-stat-label">Unique Customers</div></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="vp-card"><div className="vp-card-header"><h3 className="vp-card-title">Revenue Trend</h3></div><div className="vp-chart-placeholder"><div style={{ textAlign: 'center' }}><i className="fi-rs-chart-line-up" style={{ fontSize: 32, marginBottom: 8, display: 'block' }}></i>Revenue chart coming soon</div></div></div>
              <div className="vp-card"><div className="vp-card-header"><h3 className="vp-card-title">Orders Trend</h3></div><div className="vp-chart-placeholder"><div style={{ textAlign: 'center' }}><i className="fi-rs-chart-histogram" style={{ fontSize: 32, marginBottom: 8, display: 'block' }}></i>Orders chart coming soon</div></div></div>
            </div>

            <div className="vp-card" style={{ marginTop: 20 }}>
              <div className="vp-card-header"><h3 className="vp-card-title">Top Selling Products</h3></div>
              <div className="vp-table-wrap">
                <table className="vp-table">
                  <thead><tr><th>#</th><th>Product</th><th>Units Sold</th><th>Revenue</th><th>Share</th></tr></thead>
                  <tbody>
                    {topProducts.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>No sales data yet</td></tr>
                    ) : topProducts.map((p, i) => {
                      const share = topTotalRev > 0 ? (p.revenue / topTotalRev * 100).toFixed(1) : '0.0';
                      return (
                        <tr key={i}>
                          <td><strong>{i + 1}</strong></td>
                          <td><div className="vp-table-product"><div className="vp-table-product-img"><i className="fi-rs-box" style={{ color: '#9ca3af' }}></i></div><div className="vp-table-product-info"><div className="vp-table-product-name">{p.name}</div><div className="vp-table-product-sku">{p.code}</div></div></div></td>
                          <td><strong>{p.quantity}</strong></td>
                          <td><strong>{formatCurrency(p.revenue)}</strong></td>
                          <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 60, height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}><div style={{ height: '100%', background: '#1a5c38', borderRadius: 3, width: `${share}%` }}></div></div><span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>{share}%</span></div></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </VendorLayout>
    </VendorGuard>
  );
}

export default function VendorAnalytics() {
  return <VendorAuthProvider><AnalyticsContent /></VendorAuthProvider>;
}
