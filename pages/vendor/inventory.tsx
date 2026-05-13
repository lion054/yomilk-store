import { useState, useEffect } from 'react';
import VendorLayout from '../../components/vendor/VendorLayout';
import VendorGuard from '../../components/vendor/VendorGuard';
import { VendorAuthProvider } from '../../components/vendor/VendorAuthContext';
import apiClient from '../../config/api';
import { toast } from 'react-toastify';
import { normalizeVendorItem, getStockLevel as getLevel, inventoryBadgeClass, inventoryBadgeLabel, inventoryBarColor } from '../../lib/vendorUtils';
import { normalizeArray } from '../../lib/normalizeApiResponse';

function InventoryContent() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('All');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editStock, setEditStock] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await ( apiClient as any).getVendorItems();
      setInventory(normalizeArray(res).map(normalizeVendorItem));
    } catch {
      setInventory([]);
    }
    setLoading(false);
  };

  const filtered = inventory.filter((item: any) => {
    const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const level = getLevel(item.stock);
    let matchesFilter = true;
    if (stockFilter === 'In Stock') matchesFilter = level === 'good';
    if (stockFilter === 'Low Stock') matchesFilter = level === 'low' || level === 'medium';
    if (stockFilter === 'Out of Stock') matchesFilter = level === 'out';
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: inventory.length,
    inStock: inventory.filter((i: any) => getLevel(i.stock) === 'good').length,
    lowStock: inventory.filter((i: any) => ['low', 'medium'].includes(getLevel(i.stock))).length,
    outOfStock: inventory.filter((i: any) => getLevel(i.stock) === 'out').length,
  };

  const handleSaveStock = async () => {
    if (!editingItem) return;
    const val = parseInt(editStock);
    if (isNaN(val) || val < 0) { toast.error('Please enter a valid quantity'); return; }
    setSaving(true);
    try {
      await ( apiClient as any).updateVendorItem((editingItem as any).id, { quantityOnStock: val });
      setInventory((prev) => prev.map((i: any) => i.id === (editingItem as any).id ? { ...i, stock: val } : i));
      toast.success(`Stock updated for ${(editingItem as any).name}`);
      setEditingItem(null);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update stock');
    }
    setSaving(false);
  };

  const badgeClass = inventoryBadgeClass;
  const badgeLabel = inventoryBadgeLabel;
  const barColor = inventoryBarColor;

  return (
    <VendorGuard>
      <VendorLayout title="Inventory" subtitle="Track and manage your stock levels"
        actions={<button className="vp-btn vp-btn-secondary vp-btn-sm" onClick={loadInventory}><i className="fi-rs-refresh"></i> Refresh</button>}
      >
        <div className="vp-stats-grid">
          <div className="vp-stat-card"><div className="vp-stat-icon blue"><i className="fi-rs-box"></i></div><div className="vp-stat-value">{stats.total}</div><div className="vp-stat-label">Total Products</div></div>
          <div className="vp-stat-card"><div className="vp-stat-icon green"><i className="fi-rs-check"></i></div><div className="vp-stat-value">{stats.inStock}</div><div className="vp-stat-label">In Stock</div></div>
          <div className="vp-stat-card"><div className="vp-stat-icon orange"><i className="fi-rs-exclamation"></i></div><div className="vp-stat-value">{stats.lowStock}</div><div className="vp-stat-label">Low Stock</div></div>
          <div className="vp-stat-card"><div className="vp-stat-icon red"><i className="fi-rs-cross-circle"></i></div><div className="vp-stat-value">{stats.outOfStock}</div><div className="vp-stat-label">Out of Stock</div></div>
        </div>

        <div className="vp-filter-bar">
          <div className="vp-filter-search"><i className="fi-rs-search"></i><input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
          <select className="vp-filter-select" value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
            <option>All</option><option>In Stock</option><option>Low Stock</option><option>Out of Stock</option>
          </select>
        </div>

        <div className="vp-card">
          <div className="vp-table-wrap">
            <table className="vp-table">
              <thead><tr><th>Product</th><th>SKU</th><th>On Hand</th><th>Committed</th><th>Available</th><th>Stock Level</th><th>Action</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Loading inventory...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No products found</td></tr>
                ) : filtered.map((item: any) => {
                  const level = getLevel(item.stock);
                  return (
                    <tr key={item.id}>
                      <td><div className="vp-table-product"><div className="vp-table-product-img"><i className="fi-rs-box" style={{ color: '#9ca3af' }}></i></div><div className="vp-table-product-info"><div className="vp-table-product-name">{item.name}</div><div className="vp-table-product-sku">{item.category}</div></div></div></td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{item.id}</td>
                      <td><strong>{item.stock}</strong> {item.uom}</td>
                      <td>{item.committed}</td>
                      <td><strong>{Math.max(0, item.stock - item.committed)}</strong></td>
                      <td>
                        <span className={`vp-badge ${badgeClass(level)}`}><span className="vp-badge-dot"></span> {badgeLabel(level)}</span>
                        <div className="vp-stock-bar"><div className={`vp-stock-bar-fill ${barColor(level)}`} style={{ width: `${Math.min((item.stock / item.maxStock) * 100, 100)}%` }} /></div>
                      </td>
                      <td><button className="vp-btn vp-btn-secondary vp-btn-sm" onClick={() => { setEditingItem(item); setEditStock(String(item.stock)); }}><i className="fi-rs-edit"></i> Update</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {editingItem && (
          <div className="vp-modal-overlay" onClick={() => setEditingItem(null)}>
            <div className="vp-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
              <div className="vp-modal-header"><h3 className="vp-modal-title">Update Stock</h3><button className="vp-modal-close" onClick={() => setEditingItem(null)}><i className="fi-rs-cross-small"></i></button></div>
              <div className="vp-modal-body">
                <div style={{ marginBottom: 16 }}><div style={{ fontWeight: 700, fontSize: 15 }}>{editingItem.name}</div><div style={{ fontSize: 13, color: '#9ca3af' }}>{editingItem.id}</div></div>
                <div className="vp-form-group"><label className="vp-form-label">Current Stock: <strong>{editingItem.stock}</strong> {editingItem.uom}</label></div>
                <div className="vp-form-group"><label className="vp-form-label">New Stock Quantity</label><input type="number" className="vp-input" min="0" value={editStock} onChange={(e) => setEditStock(e.target.value)} autoFocus /></div>
              </div>
              <div className="vp-modal-footer"><button className="vp-btn vp-btn-secondary" onClick={() => setEditingItem(null)}>Cancel</button><button className="vp-btn vp-btn-primary" onClick={handleSaveStock} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button></div>
            </div>
          </div>
        )}
      </VendorLayout>
    </VendorGuard>
  );
}

export default function VendorInventory() {
  return <VendorAuthProvider><InventoryContent /></VendorAuthProvider>;
}
