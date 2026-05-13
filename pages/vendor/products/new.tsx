import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import VendorLayout from '../../../components/vendor/VendorLayout';
import VendorGuard from '../../../components/vendor/VendorGuard';
import { VendorAuthProvider } from '../../../components/vendor/VendorAuthContext';
import apiClient from '../../../config/api';
import { toast } from 'react-toastify';

const CATEGORIES = ['Dairy', 'Beverages', 'Bakery', 'Produce', 'Meat & Poultry', 'Frozen', 'Snacks', 'Pantry', 'Household', 'Other'];
const UOM_OPTIONS = ['EA', 'BOX', 'PKG', 'KG', 'L', 'BTL', 'CRT', 'DOZ'];

function AddProductContent() {
  const router = useRouter();
  const fileInputRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<any>(null);
  const [form, setForm] = useState({
    itemName: '', description: '', category: '', price: '', costPrice: '',
    uom: 'EA', barcode: '', weight: '', minOrderQty: '1', stock: '', vatGroup: 'O1', isActive: true,
  });

  const handleChange = (field: any, value: any) => setForm((prev: any) => ({ ...prev, [field]: value }));

  const handleImageSelect = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
      const reader = new FileReader();
      reader.onload = (ev: any) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.itemName.trim()) { toast.error('Product name is required'); return; }
    if (!form.category) { toast.error('Please select a category'); return; }
    if (!form.price || parseFloat(form.price) <= 0) { toast.error('Please enter a valid price'); return; }

    setLoading(true);
    try {
      const payload: any = {
        itemName: form.itemName.trim(),
        itemDescription: form.description.trim() || form.itemName.trim(),
        itemsGroupCode: form.category,
        salesUnit: form.uom,
        inventoryUOM: form.uom,
        price: parseFloat(form.price),
        barCode: form.barcode || undefined,
        quantityOnStock: form.stock ? parseInt(form.stock) : 0,
      };
      if (form.costPrice) payload.costPrice = parseFloat(form.costPrice);

      await ( apiClient as any).updateVendorItem('', payload);
      toast.success('Product created successfully!');
      router.push('/vendor/products');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create product');
      setLoading(false);
    }
  };

  return (
    <VendorGuard>
      <VendorLayout title="Add Product" subtitle="Add a new product to your catalogue"
        actions={<Link href="/vendor/products" className="vp-btn vp-btn-secondary vp-btn-sm"><i className="fi-rs-arrow-left"></i> Back to Products</Link>}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
            <div>
              <div className="vp-card">
                <h3 className="vp-card-title" style={{ marginBottom: 20 }}>Product Information</h3>
                <div className="vp-form-group"><label className="vp-form-label">Product Name *</label><input type="text" className="vp-input" placeholder="e.g. Full Cream Milk 1L" value={form.itemName} onChange={(e: any) => handleChange('itemName', e.target.value)} /></div>
                <div className="vp-form-group"><label className="vp-form-label">Description</label><textarea className="vp-input" placeholder="Describe your product..." value={form.description} onChange={(e: any) => handleChange('description', e.target.value)} rows={4} /></div>
                <div className="vp-form-row">
                  <div className="vp-form-group"><label className="vp-form-label">Category *</label><select className="vp-input vp-select" value={form.category} onChange={(e: any) => handleChange('category', e.target.value)}><option value="">Select category</option>{CATEGORIES.map((c: any) => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div className="vp-form-group"><label className="vp-form-label">Unit of Measure</label><select className="vp-input vp-select" value={form.uom} onChange={(e: any) => handleChange('uom', e.target.value)}>{UOM_OPTIONS.map((u: any) => <option key={u} value={u}>{u}</option>)}</select></div>
                </div>
                <div className="vp-form-row">
                  <div className="vp-form-group"><label className="vp-form-label">Barcode</label><input type="text" className="vp-input" placeholder="e.g. 1234567890" value={form.barcode} onChange={(e) => handleChange('barcode', e.target.value)} /></div>
                  <div className="vp-form-group"><label className="vp-form-label">Weight / Size</label><input type="text" className="vp-input" placeholder="e.g. 500g, 1L" value={form.weight} onChange={(e) => handleChange('weight', e.target.value)} /></div>
                </div>
              </div>

              <div className="vp-card">
                <h3 className="vp-card-title" style={{ marginBottom: 20 }}>Pricing</h3>
                <div className="vp-form-row">
                  <div className="vp-form-group"><label className="vp-form-label">Selling Price (USD) *</label><input type="number" className="vp-input" placeholder="0.00" step="0.01" min="0" value={form.price} onChange={(e) => handleChange('price', e.target.value)} /></div>
                  <div className="vp-form-group"><label className="vp-form-label">Cost Price (USD)</label><input type="number" className="vp-input" placeholder="0.00" step="0.01" min="0" value={form.costPrice} onChange={(e) => handleChange('costPrice', e.target.value)} /><p className="vp-form-hint">For your records only. Not shown to customers.</p></div>
                </div>
                <div className="vp-form-row">
                  <div className="vp-form-group"><label className="vp-form-label">VAT Group</label><select className="vp-input vp-select" value={form.vatGroup} onChange={(e) => handleChange('vatGroup', e.target.value)}><option value="O1">O1 - Standard Rate</option><option value="E1">E1 - Exempt</option><option value="Z1">Z1 - Zero Rated</option></select></div>
                  <div className="vp-form-group"><label className="vp-form-label">Min Order Quantity</label><input type="number" className="vp-input" min="1" value={form.minOrderQty} onChange={(e) => handleChange('minOrderQty', e.target.value)} /></div>
                </div>
              </div>
            </div>

            <div>
              <div className="vp-card">
                <h3 className="vp-card-title" style={{ marginBottom: 16 }}>Product Image</h3>
                <div className={`vp-dropzone ${imagePreview ? 'active' : ''}`} onClick={() => fileInputRef.current?.click()} style={{ padding: imagePreview ? 16 : 48 }}>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
                  {imagePreview ? (
                    <div style={{ textAlign: 'center' }}><img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 10, marginBottom: 12 }} /><p style={{ fontSize: 13, color: '#6b7280' }}>Click to change image</p></div>
                  ) : (
                    <><i className="fi-rs-picture" style={{ fontSize: 32, color: '#9ca3af', marginBottom: 12 }}></i><p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', marginBottom: 4 }}>Upload image</p><span style={{ fontSize: 12, color: '#9ca3af' }}>PNG, JPG up to 5MB</span></>
                  )}
                </div>
              </div>

              <div className="vp-card">
                <h3 className="vp-card-title" style={{ marginBottom: 16 }}>Inventory</h3>
                <div className="vp-form-group"><label className="vp-form-label">Stock Quantity</label><input type="number" className="vp-input" placeholder="0" min="0" value={form.stock} onChange={(e) => handleChange('stock', e.target.value)} /><p className="vp-form-hint">Current available stock for this product.</p></div>
              </div>

              <div className="vp-card">
                <h3 className="vp-card-title" style={{ marginBottom: 16 }}>Status</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div><div style={{ fontWeight: 600, fontSize: 14 }}>Active</div><div style={{ fontSize: 12, color: '#9ca3af' }}>Product visible to customers</div></div>
                  <label className="vp-toggle"><input type="checkbox" checked={form.isActive} onChange={(e) => handleChange('isActive', e.target.checked)} /><span className="vp-toggle-slider"></span></label>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
                <button type="submit" className="vp-btn vp-btn-primary vp-btn-full vp-btn-lg" disabled={loading}>{loading ? 'Creating...' : 'Create Product'}</button>
                <Link href="/vendor/products" className="vp-btn vp-btn-secondary vp-btn-full">Cancel</Link>
              </div>
            </div>
          </div>
        </form>
      </VendorLayout>
    </VendorGuard>
  );
}

export default function AddProduct() {
  return <VendorAuthProvider><AddProductContent /></VendorAuthProvider>;
}
