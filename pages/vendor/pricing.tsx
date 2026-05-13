import { useState, useEffect } from 'react';
import VendorLayout from '../../components/vendor/VendorLayout';
import VendorGuard from '../../components/vendor/VendorGuard';
import { VendorAuthProvider } from '../../components/vendor/VendorAuthContext';
import apiClient from '../../config/api';
import { toast } from 'react-toastify';
import { formatCurrency } from '../../lib/formatters';
import { normalizeVendorItem } from '../../lib/vendorUtils';
import { normalizeArray } from '../../lib/normalizeApiResponse';

function PricingContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await (apiClient as any).getVendorItems();
      setProducts(normalizeArray(res).map(normalizeVendorItem));
    } catch {
      setProducts([]);
    }
    setLoading(false);
  };

  const filtered = products.filter((p: any) => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase()));

  const getMargin = (price: any, cost: any) => cost > 0 ? ((price - cost) / price * 100).toFixed(1) : null;

  return (
    <VendorGuard>
      <VendorLayout title="Pricing" subtitle="Your product prices (managed by Snappy Fresh)">
        <div className="vp-filter-bar">
          <div className="vp-filter-search"><i className="fi-rs-search"></i><input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
        </div>

        <div className="vp-card">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>Loading products...</div>
          ) : (
            <div className="vp-table-wrap">
              <table className="vp-table">
                <thead><tr><th>Product</th><th>SKU</th><th>Cost Price</th><th>Selling Price</th><th>Margin</th></tr></thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>No products found</td></tr>
                  ) : filtered.map((p: any) => {
                    const margin = getMargin(p.price, p.costPrice);
                    return (
                      <tr key={p.id}>
                        <td><div className="vp-table-product"><div className="vp-table-product-img"><i className="fi-rs-box" style={{ color: '#9ca3af' }}></i></div><div className="vp-table-product-info"><div className="vp-table-product-name">{p.name}</div><div className="vp-table-product-sku">{p.uom}</div></div></div></td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.id}</td>
                        <td style={{ color: '#9ca3af' }}>{formatCurrency(p.costPrice)}</td>
                        <td><strong style={{ color: '#1a5c38', fontSize: 15 }}>{formatCurrency(p.price)}</strong></td>
                        <td>{margin ? <span className={`vp-badge ${parseFloat(margin) >= 20 ? 'vp-badge-green' : parseFloat(margin) >= 10 ? 'vp-badge-orange' : 'vp-badge-red'}`}>{margin}%</span> : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </VendorLayout>
    </VendorGuard>
  );
}

export default function VendorPricing() {
  return <VendorAuthProvider><PricingContent /></VendorAuthProvider>;
}
