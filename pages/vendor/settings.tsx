import { useState } from 'react';
import VendorLayout from '../../components/vendor/VendorLayout';
import VendorGuard from '../../components/vendor/VendorGuard';
import { VendorAuthProvider, useVendorAuth } from '../../components/vendor/VendorAuthContext';
import { toast } from 'react-toastify';

function SettingsContent() {
  const { vendor } = useVendorAuth();
  const [activeTab, setActiveTab] = useState('Profile');
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    businessName: vendor?.name || '',
    email: vendor?.email || '',
    phone: vendor?.phone || '',
    address: '',
    city: '',
    country: 'Zimbabwe',
    description: '',
  });

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [notifications, setNotifications] = useState({ newOrders: true, lowStock: true, payouts: true, marketing: false, emailDigest: true });

  const handleSave = (msg: any) => { setLoading(true); setTimeout(() => { toast.success(msg || 'Saved!'); setLoading(false); }, 500); };

  return (
    <VendorGuard>
      <VendorLayout title="Settings" subtitle="Manage your account and preferences">
        <div className="vp-tabs">
          {['Profile', 'Security', 'Notifications', 'Business'].map((tab: any) => (
            <button key={tab} className={`vp-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
          ))}
        </div>

        {activeTab === 'Profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
            <div className="vp-card">
              <h3 className="vp-card-title" style={{ marginBottom: 20 }}>Business Profile</h3>
              <form onSubmit={(e: any) => { e.preventDefault(); handleSave('Profile updated'); }}>
                <div className="vp-form-group"><label className="vp-form-label">Business Name</label><input type="text" className="vp-input" value={profile.businessName} onChange={(e: any) => setProfile({ ...profile, businessName: e.target.value })} /></div>
                <div className="vp-form-row">
                  <div className="vp-form-group"><label className="vp-form-label">Email Address</label><input type="email" className="vp-input" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></div>
                  <div className="vp-form-group"><label className="vp-form-label">Phone Number</label><input type="tel" className="vp-input" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
                </div>
                <div className="vp-form-group"><label className="vp-form-label">Business Address</label><input type="text" className="vp-input" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} /></div>
                <div className="vp-form-row">
                  <div className="vp-form-group"><label className="vp-form-label">City</label><input type="text" className="vp-input" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} /></div>
                  <div className="vp-form-group"><label className="vp-form-label">Country</label><input type="text" className="vp-input" value={profile.country} disabled /></div>
                </div>
                <div className="vp-form-group"><label className="vp-form-label">Business Description</label><textarea className="vp-input" rows={4} value={profile.description} onChange={(e) => setProfile({ ...profile, description: e.target.value })} /></div>
                <button type="submit" className="vp-btn vp-btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
              </form>
            </div>

            <div>
              <div className="vp-card" style={{ textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg, #1a5c38, #667eea)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28, fontWeight: 800, margin: '0 auto 16px' }}>
                  {vendor?.initials || 'V'}
                </div>
                <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 4 }}>{profile.businessName}</div>
                <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 16 }}>{profile.email}</div>
                <div className="vp-badge vp-badge-green" style={{ margin: '0 auto' }}><span className="vp-badge-dot"></span> Active Vendor</div>
              </div>
              <div className="vp-card" style={{ marginTop: 16 }}>
                <h3 className="vp-card-title" style={{ marginBottom: 12, fontSize: 14 }}>Account Info</h3>
                <div style={{ fontSize: 13 }}>
                  {[{ label: 'Vendor ID', value: vendor?.cardCode || '-' }, { label: 'Card Type', value: vendor?.cardType || 'Vendor' }].map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <span style={{ color: '#9ca3af' }}>{r.label}</span>
                      <span style={{ fontWeight: 600, fontFamily: r.label === 'Vendor ID' ? 'monospace' : 'inherit' }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Security' && (
          <div style={{ maxWidth: 600 }}>
            <div className="vp-card">
              <h3 className="vp-card-title" style={{ marginBottom: 20 }}>Change Password</h3>
              <form onSubmit={(e: any) => { e.preventDefault(); if (passwords.newPassword.length < 8) { toast.error('Min 8 characters'); return; } if (passwords.newPassword !== passwords.confirmPassword) { toast.error('Passwords do not match'); return; } handleSave('Password updated'); setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}>
                <div className="vp-form-group"><label className="vp-form-label">Current Password</label><input type="password" className="vp-input" value={passwords.currentPassword} onChange={(e: any) => setPasswords({ ...passwords, currentPassword: e.target.value })} /></div>
                <div className="vp-form-group"><label className="vp-form-label">New Password</label><input type="password" className="vp-input" placeholder="At least 8 characters" value={passwords.newPassword} onChange={(e: any) => setPasswords({ ...passwords, newPassword: e.target.value })} /></div>
                <div className="vp-form-group"><label className="vp-form-label">Confirm New Password</label><input type="password" className={`vp-input ${passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword ? 'error' : ''}`} value={passwords.confirmPassword} onChange={(e: any) => setPasswords({ ...passwords, confirmPassword: e.target.value })} /></div>
                <button type="submit" className="vp-btn vp-btn-primary" disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</button>
              </form>
            </div>
            <div className="vp-card" style={{ marginTop: 20, borderColor: '#fde8e8' }}>
              <h3 className="vp-card-title" style={{ marginBottom: 12, color: '#e74c3c' }}>Danger Zone</h3>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>Once you deactivate your vendor account, your products will be removed from the marketplace.</p>
              <button className="vp-btn vp-btn-danger vp-btn-sm">Deactivate Account</button>
            </div>
          </div>
        )}

        {activeTab === 'Notifications' && (
          <div style={{ maxWidth: 600 }}>
            <div className="vp-card">
              <h3 className="vp-card-title" style={{ marginBottom: 20 }}>Notification Preferences</h3>
              {[
                { key: 'newOrders', label: 'New Orders', desc: 'Get notified when a customer places an order' },
                { key: 'lowStock', label: 'Low Stock Alerts', desc: 'Receive alerts when products are running low' },
                { key: 'payouts', label: 'Payout Notifications', desc: 'Get notified when payouts are processed' },
                { key: 'emailDigest', label: 'Daily Email Digest', desc: 'Receive a daily summary of your store activity' },
                { key: 'marketing', label: 'Marketing & Tips', desc: 'Receive tips on how to grow your sales' },
              ].map((item: any) => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <div><div style={{ fontWeight: 700, fontSize: 14 }}>{item.label}</div><div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{item.desc}</div></div>
                  <label className="vp-toggle"><input type="checkbox" checked={(notifications as any)[item.key]} onChange={(e: any) => setNotifications({ ...notifications, [item.key]: e.target.checked })} /><span className="vp-toggle-slider"></span></label>
                </div>
              ))}
              <div style={{ marginTop: 20 }}><button className="vp-btn vp-btn-primary" onClick={() => handleSave('Preferences saved')}>Save Preferences</button></div>
            </div>
          </div>
        )}

        {activeTab === 'Business' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="vp-card">
              <h3 className="vp-card-title" style={{ marginBottom: 20 }}>Business Hours</h3>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day: any) => (
                <div key={day} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontWeight: 600, fontSize: 13, minWidth: 90 }}>{day}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="time" className="vp-input" defaultValue="08:00" style={{ width: 110, padding: '6px 10px', fontSize: 12 }} />
                    <span style={{ color: '#9ca3af' }}>to</span>
                    <input type="time" className="vp-input" defaultValue="17:00" style={{ width: 110, padding: '6px 10px', fontSize: 12 }} />
                  </div>
                </div>
              ))}
              <button className="vp-btn vp-btn-primary vp-btn-sm" style={{ marginTop: 16 }} onClick={() => handleSave('Hours saved')}>Save Hours</button>
            </div>

            <div>
              <div className="vp-card">
                <h3 className="vp-card-title" style={{ marginBottom: 20 }}>Delivery Settings</h3>
                <div className="vp-form-group"><label className="vp-form-label">Delivery Radius (km)</label><input type="number" className="vp-input" defaultValue="15" min="1" /></div>
                <div className="vp-form-group"><label className="vp-form-label">Min. Order for Free Delivery</label><input type="number" className="vp-input" defaultValue="20" min="0" step="0.01" /><p className="vp-form-hint">Set to 0 for always-free delivery.</p></div>
                <div className="vp-form-group"><label className="vp-form-label">Delivery Fee</label><input type="number" className="vp-input" defaultValue="2.00" min="0" step="0.01" /></div>
                <button className="vp-btn vp-btn-primary vp-btn-sm" onClick={() => handleSave('Delivery settings saved')}>Save Settings</button>
              </div>

              <div className="vp-card" style={{ marginTop: 16 }}>
                <h3 className="vp-card-title" style={{ marginBottom: 12 }}>Payment Methods Accepted</h3>
                {['EcoCash', 'InnBucks', 'Bank Transfer', 'Cash on Delivery'].map((method: any) => (
                  <div key={method} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{method}</span>
                    <label className="vp-toggle"><input type="checkbox" defaultChecked /><span className="vp-toggle-slider"></span></label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </VendorLayout>
    </VendorGuard>
  );
}

export default function VendorSettings() {
  return <VendorAuthProvider><SettingsContent /></VendorAuthProvider>;
}
