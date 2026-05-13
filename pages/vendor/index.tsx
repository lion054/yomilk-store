import { useState, useEffect } from 'react';
import Link from 'next/link';
import VendorLayout from '../../components/vendor/VendorLayout';
import VendorGuard from '../../components/vendor/VendorGuard';
import { VendorAuthProvider, useVendorAuth } from '../../components/vendor/VendorAuthContext';
import apiClient from '../../config/api';
import { formatCurrency, formatDateShort as formatDate } from '../../lib/formatters';

function DashboardContent() {
  const { vendor } = useVendorAuth();
  const vendorName = vendor?.name || 'Vendor';

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, activeProducts: 0, lowStockItems: 0 });
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // Load recent invoices
    try {
      const invoicesRes = await ( apiClient as any).getVendorInvoices(5, 1);
      const invoices = invoicesRes?.values || invoicesRes?.value || [];
      setRecentOrders(invoices.slice(0, 5));
      setStats((prev) => ({
        ...prev,
        totalOrders: invoicesRes?.recordCount || invoicesRes?.['odata.count'] || invoices.length,
        totalRevenue: invoices.reduce((sum: any, inv: any) => sum + (inv.docTotal || 0), 0),
      }));
    } catch {}
    setLoadingOrders(false);

    // Load items for product/stock stats
    try {
      const items = await ( apiClient as any).getVendorItems();
      const itemList = Array.isArray(items) ? items : items?.values || items?.value || [];
      const lowStock = itemList.filter((i: any) => (i.inStock ?? i.quantityOnStock ?? i.onHand ?? 0) <= 10);
      setStats((prev) => ({
        ...prev,
        activeProducts: itemList.length,
        lowStockItems: lowStock.length,
      }));
    } catch {}
  };

  const statusBadge = (s: any) => {
    const status = (s || '').toLowerCase();
    if (status === 'open' || status === 'pending') return 'vp-badge-orange';
    if (status === 'closed' || status === 'completed' || status === 'delivered') return 'vp-badge-green';
    if (status === 'cancelled' || status === 'canceled') return 'vp-badge-red';
    return 'vp-badge-blue';
  };

  const getStatusLabel = (inv: any) => {
    if (inv.documentStatus === 'bost_Close' || inv.documentStatus === 'Closed') return 'Completed';
    if (inv.documentStatus === 'bost_Open' || inv.documentStatus === 'Open') return inv.paidToDate >= inv.docTotal ? 'Paid' : 'Pending';
    if (inv.cancelled === 'tYES' || inv.cancelled === 'Y') return 'Cancelled';
    return inv.documentStatus || 'Open';
  };

  return (
    <VendorGuard>
      <VendorLayout title="Dashboard">
        {/* Welcome Banner */}
        <div className="vp-card vp-animate-in" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)', color: '#fff', border: 'none', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 4 }}>
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},
              </p>
              <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>{vendorName}</h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                Here's what's happening with your store today.
              </p>
            </div>
            <Link href="/vendor/product/new" className="vp-btn vp-btn-primary">
              <i className="fi-rs-plus"></i> Add Product
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="vp-stats-grid">
          <div className="vp-stat-card vp-animate-in vp-delay-1">
            <div className="vp-stat-icon green"><i className="fi-rs-shopping-bag"></i></div>
            <div className="vp-stat-value">{stats.totalOrders}</div>
            <div className="vp-stat-label">Total Orders</div>
          </div>
          <div className="vp-stat-card vp-animate-in vp-delay-2">
            <div className="vp-stat-icon blue"><i className="fi-rs-dollar"></i></div>
            <div className="vp-stat-value">{formatCurrency(stats.totalRevenue)}</div>
            <div className="vp-stat-label">Recent Revenue</div>
          </div>
          <div className="vp-stat-card vp-animate-in vp-delay-3">
            <div className="vp-stat-icon orange"><i className="fi-rs-box"></i></div>
            <div className="vp-stat-value">{stats.activeProducts}</div>
            <div className="vp-stat-label">Active Products</div>
          </div>
          <div className="vp-stat-card vp-animate-in vp-delay-4">
            <div className="vp-stat-icon red"><i className="fi-rs-exclamation"></i></div>
            <div className="vp-stat-value">{stats.lowStockItems}</div>
            <div className="vp-stat-label">Low Stock Items</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          {/* Recent Orders */}
          <div className="vp-card vp-animate-in">
            <div className="vp-card-header">
              <h3 className="vp-card-title">Recent Orders</h3>
              <Link href="/vendor/orders" className="vp-btn vp-btn-secondary vp-btn-sm">
                View All <i className="fi-rs-arrow-right" style={{ fontSize: 11 }}></i>
              </Link>
            </div>
            <div className="vp-table-wrap">
              <table className="vp-table">
                <thead>
                  <tr><th>Doc #</th><th>Customer</th><th>Amount</th><th>Date</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {loadingOrders ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>Loading orders...</td></tr>
                  ) : recentOrders.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>No orders yet</td></tr>
                  ) : recentOrders.map((inv: any) => {
                    const label = getStatusLabel(inv);
                    return (
                      <tr key={inv.docEntry || inv.docNum}>
                        <td><strong>#{inv.docNum || inv.docEntry}</strong></td>
                        <td>{inv.cardName || inv.customerName || '-'}</td>
                        <td><strong>{formatCurrency(inv.docTotal)}</strong></td>
                        <td>{formatDate(inv.docDate || inv.docDueDate)}</td>
                        <td>
                          <span className={`vp-badge ${statusBadge(label)}`}>
                            <span className="vp-badge-dot"></span> {label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="vp-card vp-animate-in" style={{ marginBottom: 20 }}>
              <h3 className="vp-card-title" style={{ marginBottom: 16 }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: 'fi-rs-plus', label: 'Add New Product', href: '/vendor/product/new', bg: '#e8f5ef', color: '#1a5c38' },
                  { icon: 'fi-rs-cloud-upload', label: 'Upload Catalogue', href: '/vendor/products', bg: '#eef0ff', color: '#667eea' },
                  { icon: 'fi-rs-database', label: 'Update Stock', href: '/vendor/inventory', bg: '#fff3e0', color: '#f5a623' },
                  { icon: 'fi-rs-dollar', label: 'Manage Pricing', href: '/vendor/pricing', bg: '#fde8e8', color: '#e74c3c' },
                ].map((action, i) => (
                  <Link key={i} href={action.href} className="vp-quick-card" style={{ marginBottom: 0 }}>
                    <div className="vp-quick-card-icon" style={{ background: action.bg, color: action.color }}>
                      <i className={action.icon}></i>
                    </div>
                    <span className="vp-quick-card-text">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </VendorLayout>
    </VendorGuard>
  );
}

export default function VendorDashboard() {
  return (
    <VendorAuthProvider>
      <DashboardContent />
    </VendorAuthProvider>
  );
}
