import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';
import AuthGuard from '../../components/guards/AuthGuard';
import ProfileSwitcher from '../../components/ProfileSwitcher';
import Link from 'next/link';
import { toast } from 'react-toastify';
import apiClient from '../../config/api';
import { logger } from '../../lib/logger';
import SEO from '../../components/common/SEO';
import { pageSeoConfig } from '../../config/seo';
import { formatCurrency } from '../../lib/formatters';

export default function Profile() {
  const { user, logout, businessPartners } = useAuth();
  const seoConfig = pageSeoConfig['/profile'];
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingInvoices: 0
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        if (!user || user.customer?.isVisitor) {
          return;
        }

        // Use current cardCode from user context
        const cardCode = user.customer?.cardCode;
        if (!cardCode) {
          logger.warn('No cardCode available in user context');
          return;
        }

        // Profile loaded from user context in earlier fixes
        await ( apiClient as any).getProfile().catch((profileError: any) => {
          logger.warn('Failed to load full profile details:', profileError?.message);
        });

        try {
          const invoicesData = await ( apiClient as any).getStoreInvoices(1000, 1);
          const invoices = invoicesData.values || invoicesData.data || [];

          const totalOrders = invoices.length;
          const totalSpent = invoices.reduce((sum: any, inv: any) => {
            const total = inv.DocTotalSys ?? inv.DocTotal ?? inv.docTotal ?? 0;
            return sum + total;
          }, 0);
          const pending = invoices.filter((inv: any) => {
            const status = inv.DocStatus ?? inv.docStatus;
            const docTotal = inv.DocTotal ?? inv.docTotal ?? 0;
            const paidToDate = inv.PaidToDate ?? inv.paidToDate ?? null;
            if (paidToDate !== null) {
              return paidToDate < docTotal;
            }
            return status === 'O';
          }).length;

          setStats({
            totalOrders,
            totalSpent,
            pendingInvoices: pending
          });
        } catch (invoicesError: any) {
          logger.warn('Failed to load invoices:', invoicesError?.message);
          // Continue without invoice data
          setStats({
            totalOrders: 0,
            totalSpent: 0,
            pendingInvoices: 0
          });
        }
      } catch (error) {
        logger.error('Error loading profile:', error);
        toast.error('Failed to load some profile data. Using cached information.');
      }
    };

    if (user && !user.customer?.isVisitor) {
      loadProfileData();
    }
  }, [user?.customer?.cardCode]);

  const userName = user?.customer?.cardName || user?.userName || 'User';
  const userEmail = (user?.customer as any)?.email || 'N/A';

  return (
    <AuthGuard>
      <SEO {...seoConfig} />
      <Layout parent="Account" sub="My Shop">

        <style jsx global>{`
          .myshop-page { padding: 32px 0 60px; background: #f8f9fa; min-height: 70vh; }

          /* Sidebar */
          .myshop-sidebar {
            background: #fff;
            border-radius: 16px;
            padding: 28px 24px;
            border: 1px solid #eee;
          }
          .myshop-sidebar-title {
            font-size: 22px;
            font-weight: 800;
            color: #1a1a2e;
            margin-bottom: 24px;
            letter-spacing: -0.02em;
          }
          .myshop-sidebar-section {
            font-size: 11px;
            font-weight: 800;
            color: #636363;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            margin-bottom: 12px;
            margin-top: 24px;
          }
          .myshop-sidebar-section:first-of-type { margin-top: 0; }
          .myshop-sidebar-link {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 0;
            text-decoration: none;
            color: #333;
            font-size: 14px;
            font-weight: 600;
            border-bottom: 1px solid #f0f0f0;
            transition: color 0.2s;
          }
          .myshop-sidebar-link:last-child { border-bottom: none; }
          .myshop-sidebar-link:hover { color: #42af57; }
          .myshop-sidebar-link i { font-size: 14px; }
          .myshop-sidebar-link-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .myshop-sidebar-link-icon {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: #f4f9f6;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #42af57;
            font-size: 14px;
          }

          /* Action Cards (Sixty60-style colorful cards) */
          .myshop-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
          .myshop-card {
            border-radius: 16px;
            padding: 28px 24px;
            min-height: 180px;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            text-decoration: none;
            position: relative;
            overflow: hidden;
            transition: transform 0.25s, box-shadow 0.25s;
          }
          .myshop-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.12); }
          .myshop-card-icon {
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 48px;
            opacity: 0.3;
          }
          .myshop-card-title {
            font-size: 18px;
            font-weight: 800;
            line-height: 1.2;
            letter-spacing: -0.02em;
          }
          .myshop-card-title strong { font-weight: 900; display: block; }

          /* Stats row */
          .myshop-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 24px; }
          .myshop-stat {
            background: #fff;
            border-radius: 14px;
            padding: 20px;
            border: 1px solid #eee;
            text-align: center;
          }
          .myshop-stat-value {
            font-size: 24px;
            font-weight: 800;
            color: #1a1a2e;
            letter-spacing: -0.02em;
          }
          .myshop-stat-label { font-size: 12px; font-weight: 600; color: #636363; margin-top: 4px; }

          /* Profile switcher card */
          .myshop-profile-card {
            background: #fff;
            border-radius: 16px;
            padding: 20px 24px;
            border: 1px solid #eee;
          }
          .myshop-profile-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
          }
          .myshop-profile-name {
            font-size: 11px;
            font-weight: 800;
            color: #636363;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          .myshop-logout-btn {
            background: none;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 6px 14px;
            font-size: 12px;
            font-weight: 600;
            color: #595959;
            cursor: pointer;
            transition: all 0.2s;
          }
          .myshop-logout-btn:hover { border-color: #e74c3c; color: #e74c3c; }

          @media(max-width:768px) {
            .myshop-cards { grid-template-columns: 1fr 1fr; gap: 12px; }
            .myshop-card { min-height: 140px; padding: 20px 16px; }
            .myshop-card-icon { font-size: 36px; }
            .myshop-card-title { font-size: 14px; }

            .myshop-stats { grid-template-columns: repeat(3, 1fr); gap: 8px; }
            .myshop-stat { padding: 12px 8px; }
            .myshop-stat-value { font-size: 18px; }
            .myshop-stat-label { font-size: 10px; }

            .myshop-sidebar { margin-bottom: 24px; }
          }

          /* Logout confirmation modal */
          .myshop-logout-confirm-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.4);
            z-index: 1000;
            display: flex;
            align-items: flex-end;
          }

          .myshop-logout-confirm-sheet {
            width: 100%;
            background: #fff;
            border-radius: 20px 20px 0 0;
            padding: 20px 16px;
            box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.15);
            animation: logoutSheetSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          @keyframes logoutSheetSlideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }

          .myshop-logout-confirm-handle {
            width: 36px;
            height: 4px;
            background: #d1d5db;
            border-radius: 2px;
            margin: 0 auto 16px;
          }

          .myshop-logout-confirm-title {
            font-size: 18px;
            font-weight: 800;
            color: #1a1a2e;
            margin-bottom: 4px;
          }

          .myshop-logout-confirm-email {
            font-size: 13px;
            color: #636363;
            margin-bottom: 16px;
          }

          .myshop-logout-confirm-actions {
            display: flex;
            gap: 10px;
          }

          .myshop-logout-confirm-btn {
            flex: 1;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            min-height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fff;
            color: #333;
          }

          .myshop-logout-confirm-btn:hover {
            border-color: #636363;
          }

          .myshop-logout-confirm-btn.confirm {
            background: #e74c3c;
            color: #fff;
            border-color: #e74c3c;
          }

          .myshop-logout-confirm-btn.confirm:hover {
            background: #c0392b;
            border-color: #c0392b;
          }
        `}</style>

        <div className="myshop-page">
          <div className="container">
            <div className="row">
              {/* Main Content - Full Width */}
              <div className="col-12">
                {/* Account Switcher - Show First if Multiple Accounts */}
                {businessPartners?.length > 1 && (
                  <div className="myshop-profile-card" style={{ marginBottom: '24px' }}>
                    <ProfileSwitcher />
                  </div>
                )}

                {/* Profile Header */}
                <div className="myshop-profile-card" style={{ marginBottom: '24px' }}>
                  <div className="myshop-profile-header">
                    <div>
                      <div className="myshop-profile-name">ACCOUNT</div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e' }}>
                        Welcome, {userName}
                      </div>
                      <div style={{ fontSize: '13px', color: '#999', marginTop: '2px' }}>{userEmail}</div>
                    </div>
                    <button onClick={() => setShowLogoutConfirm(true)} className="myshop-logout-btn">
                      <i className="fi-rs-sign-out" style={{ marginRight: '6px' }}></i>
                      Logout
                    </button>
                  </div>
                </div>

                {/* Action Cards - Sixty60 style */}
                <div className="myshop-cards">
                  <Link href="/store" className="myshop-card" style={{ background: 'linear-gradient(135deg, #f5a623, #f7c948)', color: '#fff' }}>
                    <div className="myshop-card-icon">🛒</div>
                    <div className="myshop-card-title">
                      SHOP YOUR<strong>REGULARS</strong>
                    </div>
                  </Link>
                  <Link href="/profile/invoice" className="myshop-card" style={{ background: 'linear-gradient(135deg, #1abcb0, #17a89e)', color: '#fff' }}>
                    <div className="myshop-card-icon">🔄</div>
                    <div className="myshop-card-title">
                      RAPID<strong>REORDER</strong>
                    </div>
                  </Link>
                  {!user?.customer?.isVisitor && (
                    <Link href="/scheduled-orders" className="myshop-card" style={{ background: 'linear-gradient(135deg, #42af57, #2d8a3e)', color: '#fff' }}>
                      <div className="myshop-card-icon">📅</div>
                      <div className="myshop-card-title">
                        SCHEDULED<strong>ORDERS</strong>
                      </div>
                    </Link>
                  )}
                  <Link href="/wallet" className="myshop-card" style={{ background: 'linear-gradient(135deg, #e8687d, #d94f66)', color: '#fff' }}>
                    <div className="myshop-card-icon">💳</div>
                    <div className="myshop-card-title">
                      MY<strong>WALLET</strong>
                    </div>
                  </Link>
                </div>

                {/* Stats */}
                <div className="myshop-stats">
                  <div className="myshop-stat">
                    <div className="myshop-stat-value">{stats.totalOrders}</div>
                    <div className="myshop-stat-label">Total Orders</div>
                  </div>
                  <div className="myshop-stat">
                    <div className="myshop-stat-value">{formatCurrency(stats.totalSpent)}</div>
                    <div className="myshop-stat-label">Total Spent</div>
                  </div>
                  <div className="myshop-stat">
                    <div className="myshop-stat-value">{stats.pendingInvoices}</div>
                    <div className="myshop-stat-label">Pending Invoices</div>
                  </div>
                </div>

                {/* Quick Access Links */}
                <div style={{ background: '#fff', borderRadius: '16px', padding: '20px 24px', border: '1px solid #eee' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
                    QUICK ACCESS
                  </div>
                  <div className="row g-3">
                    {[
                      { icon: 'fi-rs-shopping-bag', label: 'Invoices', desc: 'View all invoices', href: '/profile/invoice', color: '#42af57' },
                      { icon: 'fi-rs-money', label: 'Payments', desc: 'Payment history', href: '/profile/payments', color: '#1abcb0' },
                      { icon: 'fi-rs-document', label: 'Statements', desc: 'Account statements', href: '/profile/statements', color: '#f5a623' },
                    ].map((link, i) => (
                      <div key={i} className="col-md-4">
                        <Link href={link.href} style={{
                          display: 'flex', alignItems: 'center', gap: '12px', padding: '14px',
                          borderRadius: '12px', border: '1px solid #f0f0f0', textDecoration: 'none',
                          transition: 'all 0.2s', background: '#fff'
                        }}>
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '10px',
                            background: `${link.color}15`, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: link.color, fontSize: '16px', flexShrink: 0
                          }}>
                            <i className={link.icon}></i>
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a2e' }}>{link.label}</div>
                            <div style={{ fontSize: '11px', color: '#999' }}>{link.desc}</div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Confirmation Bottom Sheet */}
        {showLogoutConfirm && (
          <div className="myshop-logout-confirm-backdrop" onClick={() => setShowLogoutConfirm(false)}>
            <div className="myshop-logout-confirm-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="myshop-logout-confirm-handle" />
              <div className="myshop-logout-confirm-title">Sign Out?</div>
              <div className="myshop-logout-confirm-email">{userEmail}</div>
              <div className="myshop-logout-confirm-actions">
                <button
                  className="myshop-logout-confirm-btn"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="myshop-logout-confirm-btn confirm"
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    logout();
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

      </Layout>
    </AuthGuard>
  );
}
