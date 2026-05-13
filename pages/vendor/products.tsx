import { useState, useEffect } from 'react';
import Link from 'next/link';
import VendorLayout from '../../components/vendor/VendorLayout';
import VendorGuard from '../../components/vendor/VendorGuard';
import { VendorAuthProvider } from '../../components/vendor/VendorAuthContext';
import apiClient from '../../config/api';
import { formatCurrency } from '../../lib/formatters';
import { normalizeVendorItem, vendorStatusBadge } from '../../lib/vendorUtils';
import { normalizeArray } from '../../lib/normalizeApiResponse';
import ProductImage from '../../components/common/ProductImage';

function ProductsContent() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await ( apiClient as any).getVendorItems();
      setProducts(normalizeArray(res).map(normalizeVendorItem));
    } catch {
      setProducts([]);
    }
    setLoading(false);
  };

  const TABS = ['All', 'Active', 'Inactive', 'Out of Stock'];

  const filtered = products.filter((p: any) => {
    const matchesTab = activeTab === 'All' || p.status === activeTab;
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const statusBadge = vendorStatusBadge;

  return (
    <VendorGuard>
      <VendorLayout title="Products" subtitle={`${products.length} products in your catalogue`}
        actions={<>
          <Link href="/vendor/products" className="vp-btn vp-btn-secondary vp-btn-sm"><i className="fi-rs-cloud-upload"></i> Bulk Upload</Link>
          <Link href="/vendor/product/new" className="vp-btn vp-btn-primary vp-btn-sm"><i className="fi-rs-plus"></i> Add Product</Link>
        </>}
      >
        <div className="vp-tabs">
          {TABS.map((tab: any) => <button key={tab} className={`vp-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>)}
        </div>

        <div className="vp-filter-bar">
          <div className="vp-filter-search"><i className="fi-rs-search"></i><input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            <button className={`vp-btn vp-btn-sm ${viewMode === 'table' ? 'vp-btn-primary' : 'vp-btn-secondary'}`} onClick={() => setViewMode('table')} style={{ padding: '7px 10px' }}><i className="fi-rs-list"></i></button>
            <button className={`vp-btn vp-btn-sm ${viewMode === 'grid' ? 'vp-btn-primary' : 'vp-btn-secondary'}`} onClick={() => setViewMode('grid')} style={{ padding: '7px 10px' }}><i className="fi-rs-apps"></i></button>
          </div>
        </div>

        <div className="vp-card">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>Loading products...</div>
          ) : viewMode === 'table' ? (
            <>
              <div className="vp-table-wrap">
                <table className="vp-table">
                  <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th></tr></thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>No products found</td></tr>
                    ) : filtered.map((p: any) => (
                      <tr key={p.id}>
                        <td><div className="vp-table-product"><div className="vp-table-product-img">{p.image ? <ProductImage src={p.image} alt={p.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 8 }} /> : <i className="fi-rs-box" style={{ color: '#9ca3af' }}></i>}</div><div className="vp-table-product-info"><div className="vp-table-product-name">{p.name}</div><div className="vp-table-product-sku">{p.uom}</div></div></div></td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.id}</td>
                        <td>{p.category}</td>
                        <td><strong>{formatCurrency(p.price)}</strong></td>
                        <td><div style={{ fontWeight: 700, color: p.stock <= 10 ? '#e74c3c' : '#1a1a2e' }}>{p.stock}</div>{p.stock <= 10 && p.stock > 0 && <span style={{ fontSize: 11, color: '#f5a623' }}>Low stock</span>}</td>
                        <td><span className={`vp-badge ${statusBadge(p.status)}`}><span className="vp-badge-dot"></span> {p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="vp-pagination"><div className="vp-pagination-info">Showing {filtered.length} of {products.length}</div></div>
            </>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {filtered.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 32, color: '#9ca3af' }}>No products found</div>
              ) : filtered.map((p: any) => (
                <div key={p.id} style={{ border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ height: 140, background: '#f7f8fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.image ? <ProductImage src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <i className="fi-rs-box" style={{ fontSize: 36, color: '#d1d5db' }}></i>}
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>{p.id}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: 16, color: '#1a5c38' }}>{formatCurrency(p.price)}</strong>
                      <span className={`vp-badge ${statusBadge(p.status)}`} style={{ fontSize: 11, padding: '2px 8px' }}>{p.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </VendorLayout>
    </VendorGuard>
  );
}

export default function VendorProducts() {
  return <VendorAuthProvider><ProductsContent /></VendorAuthProvider>;
}
