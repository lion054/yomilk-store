import Link from "next/link";
import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import apiClient from "../config/api";
import { useAuth } from "../contexts/AuthContext";
import SEO from "../components/common/SEO";
import { pageSeoConfig } from "../config/seo";
import { formatCurrency, formatDate } from "../lib/formatters";
import { normalizeArray, normalizeScheduledOrder } from "../lib/normalizeApiResponse";
import { logger } from "../lib/logger";
import ScheduledGuard from "../components/guards/ScheduledGuard";

const ScheduledDashboard = () => {
    const { user, isAuthenticated } = useAuth();
    const seoConfig = pageSeoConfig['/scheduled-dashboard'];

    const [schedules, setSchedules] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isAuthenticated || user?.customer?.isVisitor) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [schedulesRes, ordersRes] = await Promise.allSettled([
                    ( apiClient as any).getStoreOrderSchedules(),
                    ( apiClient as any).getScheduledOrders(),
                ]);

                if (schedulesRes.status === 'fulfilled') {
                    const raw = normalizeArray(schedulesRes.value);
                    setSchedules(raw.map((s: any) => ({
                        docEntry: s.DocEntry ?? s.docEntry,
                        docNum: s.DocNum ?? s.docNum,
                        remark: s.Remark ?? s.remark ?? '',
                        status: s.Status ?? s.status ?? 'Open',
                        endDate: s.EndDate ?? s.endDate,
                        availableDeliveryDates: s.AvailableDeliveryDates ?? s.availableDeliveryDates ?? [],
                    })));
                }

                if (ordersRes.status === 'fulfilled') {
                    const raw = normalizeArray(ordersRes.value);
                    setOrders(raw.map((o: any) => normalizeScheduledOrder(o)));
                }
            } catch (err: any) {
                logger.error('Dashboard fetch error:', err);
                setError(err.message || 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.customer?.cardCode, isAuthenticated]);

    const openSchedules = schedules.filter(s => s.status === 'Open');
    const recentOrders = orders.slice(0, 5);
    const totalOrderValue = orders.reduce((sum: any, o: any) => sum + (o.amount || 0), 0);
    const orderedCount = orders.filter(o => o.status === 'Ordered' || o.status === 'OrderedAndPaid').length;

    return (
        <ScheduledGuard>
            <SEO {...seoConfig} />
            <Layout parent="Scheduled" sub="Dashboard">
                <style>{styles}</style>
                <div className="sd-page">
                    <div className="container">
                        {/* Header */}
                        <div className="sd-header">
                            <div>
                                <h1>Scheduled Orders Dashboard</h1>
                                <p>Overview of your delivery schedules and orders</p>
                            </div>
                            <Link href="/scheduled-orders" className="sd-btn-primary">
                                <i className="fi-rs-plus"></i> New Order
                            </Link>
                        </div>

                        {loading ? (
                            <div className="sd-loading">
                                <div className="sd-spinner" />
                                <p>Loading dashboard...</p>
                            </div>
                        ) : error ? (
                            <div className="sd-error-banner">
                                <p>We couldn&apos;t load your dashboard. Please try again.</p>
                                <button type="button" onClick={() => window.location.reload()} className="sd-btn-outline">
                                    Retry
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Stats Grid */}
                                <div className="sd-stats-grid">
                                    <div className="sd-stat-card sd-stat-green">
                                        <div className="sd-stat-icon"><i className="fi-rs-calendar"></i></div>
                                        <div className="sd-stat-info">
                                            <span className="sd-stat-num">{openSchedules.length}</span>
                                            <span className="sd-stat-label">Open Schedules</span>
                                        </div>
                                    </div>
                                    <div className="sd-stat-card sd-stat-blue">
                                        <div className="sd-stat-icon"><i className="fi-rs-shopping-cart"></i></div>
                                        <div className="sd-stat-info">
                                            <span className="sd-stat-num">{orders.length}</span>
                                            <span className="sd-stat-label">Total Orders</span>
                                        </div>
                                    </div>
                                    <div className="sd-stat-card sd-stat-orange">
                                        <div className="sd-stat-icon"><i className="fi-rs-time-fast"></i></div>
                                        <div className="sd-stat-info">
                                            <span className="sd-stat-num">{orderedCount}</span>
                                            <span className="sd-stat-label">Pending Orders</span>
                                        </div>
                                    </div>
                                    <div className="sd-stat-card sd-stat-purple">
                                        <div className="sd-stat-icon"><i className="fi-rs-dollar"></i></div>
                                        <div className="sd-stat-info">
                                            <span className="sd-stat-num">{formatCurrency(totalOrderValue)}</span>
                                            <span className="sd-stat-label">Total Value</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="sd-content-grid">
                                    {/* Open Schedules */}
                                    <div className="sd-card">
                                        <div className="sd-card-header">
                                            <h3>Open Schedules</h3>
                                            <Link href="/scheduled-orders" className="sd-card-link">View All</Link>
                                        </div>
                                        {openSchedules.length === 0 ? (
                                            <div className="sd-card-empty">
                                                <i className="fi-rs-calendar"></i>
                                                <p>No open schedules available</p>
                                            </div>
                                        ) : (
                                            <div className="sd-card-body">
                                                {openSchedules.map(s => (
                                                    <Link
                                                        key={s.docEntry}
                                                        href={`/scheduled-new-order?schedule=${s.docEntry}`}
                                                        className="sd-schedule-item"
                                                    >
                                                        <div className="sd-schedule-info">
                                                            <span className="sd-schedule-name">
                                                                {s.remark || `Schedule #${s.docNum || s.docEntry}`}
                                                            </span>
                                                            <span className="sd-schedule-meta">
                                                                {s.availableDeliveryDates.length} delivery date{s.availableDeliveryDates.length !== 1 ? 's' : ''}
                                                                {s.endDate && ` | Closes ${formatDate(s.endDate)}`}
                                                            </span>
                                                        </div>
                                                        <span className="sd-schedule-arrow">&rarr;</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Recent Orders */}
                                    <div className="sd-card">
                                        <div className="sd-card-header">
                                            <h3>Recent Orders</h3>
                                            <Link href="/scheduled-history" className="sd-card-link">View All</Link>
                                        </div>
                                        {recentOrders.length === 0 ? (
                                            <div className="sd-card-empty">
                                                <i className="fi-rs-shopping-bag"></i>
                                                <p>No orders placed yet</p>
                                            </div>
                                        ) : (
                                            <div className="sd-card-body">
                                                {recentOrders.map((o, i) => (
                                                    <Link
                                                        key={o.docEntry || i}
                                                        href={`/scheduled-history/${o.docEntry || o.id}`}
                                                        className="sd-order-item"
                                                    >
                                                        <div className="sd-order-info">
                                                            <span className="sd-order-num">#{o.docNum || o.id}</span>
                                                            <span className="sd-order-meta">
                                                                {formatDate(o.date)} | {o.items} item{o.items !== 1 ? 's' : ''}
                                                            </span>
                                                        </div>
                                                        <div className="sd-order-right">
                                                            <span className="sd-order-amount">{formatCurrency(o.amount)}</span>
                                                            <span className={`sd-order-status sd-status-${(o.status || '').toLowerCase()}`}>
                                                                {o.status}
                                                            </span>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="sd-quick-actions">
                                    <h3>Quick Actions</h3>
                                    <div className="sd-actions-grid">
                                        {[
                                            { href: "/scheduled-orders", icon: "fi-rs-shopping-bag", label: "Place Order", desc: "Browse schedules and order products", color: "#1a5c38" },
                                            { href: "/scheduled-history", icon: "fi-rs-list", label: "Order History", desc: "View all past and pending orders", color: "#2b6cb0" },
                                            { href: "/scheduled-billing", icon: "fi-rs-credit-card", label: "Billing", desc: "Credit limits and payment info", color: "#d97706" },
                                            { href: "/scheduled-statements", icon: "fi-rs-document", label: "Statements", desc: "Download account statements", color: "#805ad5" },
                                        ].map((a, i) => (
                                            <Link key={i} href={a.href} className="sd-action-card">
                                                <div className="sd-action-icon" style={{ '--sd-icon-bg': `${a.color}15`, '--sd-icon-color': a.color } as React.CSSProperties}>
                                                    <i className={a.icon}></i>
                                                </div>
                                                <div className="sd-action-info">
                                                    <span className="sd-action-label">{a.label}</span>
                                                    <span className="sd-action-desc">{a.desc}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </Layout>
        </ScheduledGuard>
    );
};

const styles = `
    .sd-page { padding: 30px 0; min-height: auto; }

    .sd-header {
        display: flex; justify-content: space-between; align-items: flex-start;
        margin-bottom: 28px; gap: 16px; flex-wrap: wrap;
    }
    .sd-header h1 { font-size: 28px; font-weight: 800; color: #1a202c; margin: 0 0 4px; }
    .sd-header p { font-size: 15px; color: #718096; margin: 0; }
    .sd-btn-primary {
        display: inline-flex; align-items: center; gap: 8px;
        background: #1a5c38; color: #fff; border: none; padding: 12px 24px;
        border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer;
        transition: all 0.2s; text-decoration: none;
    }
    .sd-btn-primary:hover { background: #236b43; color: #fff; }
    .sd-btn-outline {
        background: #fff; color: #4a5568; border: 1px solid #e2e8f0; padding: 10px 20px;
        border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
    }

    /* Stats */
    .sd-stats-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px; margin-bottom: 28px;
    }
    .sd-stat-card {
        background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
        padding: 20px; display: flex; align-items: center; gap: 16px;
        transition: all 0.2s;
    }
    .sd-stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .sd-stat-icon {
        width: 48px; height: 48px; border-radius: 12px;
        display: flex; align-items: center; justify-content: center;
        font-size: 20px; flex-shrink: 0;
    }
    .sd-stat-green .sd-stat-icon { background: #f0faf4; color: #1a5c38; }
    .sd-stat-blue .sd-stat-icon { background: #ebf8ff; color: #2b6cb0; }
    .sd-stat-orange .sd-stat-icon { background: #fffbeb; color: #d97706; }
    .sd-stat-purple .sd-stat-icon { background: #faf5ff; color: #805ad5; }
    .sd-stat-info { display: flex; flex-direction: column; }
    .sd-stat-num { font-size: 22px; font-weight: 800; color: #1a202c; line-height: 1.2; }
    .sd-stat-label { font-size: 13px; color: #718096; font-weight: 500; }

    /* Content Grid */
    .sd-content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
    @media (max-width: 768px) { .sd-content-grid { grid-template-columns: 1fr; } }

    .sd-card {
        background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden;
    }
    .sd-card-header {
        display: flex; justify-content: space-between; align-items: center;
        padding: 16px 24px; border-bottom: 1px solid #f0f0f0;
    }
    .sd-card-header h3 { font-size: 15px; font-weight: 700; color: #1a202c; margin: 0; }
    .sd-card-link { font-size: 13px; color: #1a5c38; font-weight: 600; text-decoration: none; }
    .sd-card-link:hover { text-decoration: underline; }
    .sd-card-body { padding: 0; }
    .sd-card-empty {
        padding: 40px 24px; text-align: center; color: #a0aec0;
    }
    .sd-card-empty i { font-size: 28px; display: block; margin-bottom: 8px; }
    .sd-card-empty p { font-size: 13px; margin: 0; }

    /* Schedule Items */
    .sd-schedule-item {
        display: flex; justify-content: space-between; align-items: center;
        padding: 14px 24px; border-bottom: 1px solid #f7fafc;
        text-decoration: none; transition: background 0.15s;
    }
    .sd-schedule-item:hover { background: #f7fafc; }
    .sd-schedule-item:last-child { border-bottom: none; }
    .sd-schedule-info { display: flex; flex-direction: column; gap: 2px; }
    .sd-schedule-name { font-size: 14px; font-weight: 600; color: #1a202c; }
    .sd-schedule-meta { font-size: 12px; color: #718096; }
    .sd-schedule-arrow { color: #a0aec0; font-size: 16px; }

    /* Order Items */
    .sd-order-item {
        display: flex; justify-content: space-between; align-items: center;
        padding: 14px 24px; border-bottom: 1px solid #f7fafc;
        text-decoration: none; transition: background 0.15s;
    }
    .sd-order-item:hover { background: #f7fafc; }
    .sd-order-item:last-child { border-bottom: none; }
    .sd-order-info { display: flex; flex-direction: column; gap: 2px; }
    .sd-order-num { font-size: 14px; font-weight: 600; color: #1a202c; }
    .sd-order-meta { font-size: 12px; color: #718096; }
    .sd-order-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
    .sd-order-amount { font-size: 14px; font-weight: 700; color: #1a202c; }
    .sd-order-status {
        font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 10px;
    }
    .sd-status-ordered { background: #fffbeb; color: #d97706; }
    .sd-status-orderedandpaid { background: #f0faf4; color: #22863a; }
    .sd-status-invoiced { background: #ebf8ff; color: #2b6cb0; }
    .sd-status-invoicedandpaid { background: #f0faf4; color: #22863a; }
    .sd-status-failed { background: #fff5f5; color: #e53e3e; }

    /* Quick Actions */
    .sd-quick-actions { margin-bottom: 28px; }
    .sd-quick-actions h3 { font-size: 18px; font-weight: 700; color: #1a202c; margin: 0 0 16px; }
    .sd-actions-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px;
    }
    .sd-action-card {
        display: flex; align-items: center; gap: 16px; padding: 18px 20px;
        background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
        text-decoration: none; transition: all 0.2s;
    }
    .sd-action-card:hover { border-color: #1a5c38; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .sd-action-icon {
        width: 44px; height: 44px; border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        font-size: 18px; flex-shrink: 0;
        background: var(--sd-icon-bg, #f0faf4);
        color: var(--sd-icon-color, #1a5c38);
    }
    .sd-action-info { display: flex; flex-direction: column; }
    .sd-action-label { font-size: 14px; font-weight: 700; color: #1a202c; }
    .sd-action-desc { font-size: 12px; color: #718096; }

    /* Loading */
    .sd-loading { text-align: center; padding: 80px 20px; min-height: 60vh; }
    .sd-spinner {
        width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #1a5c38;
        border-radius: 50%; animation: sd-spin 0.8s linear infinite; margin: 0 auto 16px;
    }
    .sd-loading p { font-size: 14px; color: #718096; }
    @keyframes sd-spin { to { transform: rotate(360deg); } }

    .sd-error-banner {
        background: #fff5f5; border: 1px solid #feb2b2; border-radius: 12px;
        padding: 24px; text-align: center; margin-bottom: 30px;
    }
    .sd-error-banner p { font-size: 14px; color: #c53030; margin: 0 0 12px; }

    .sd-not-approved {
        text-align: center; padding: 80px 20px; max-width: 480px; margin: 0 auto;
    }
    .sd-not-approved-icon { font-size: 48px; margin-bottom: 20px; }
    .sd-not-approved h2 { font-size: 22px; font-weight: 700; color: #1a202c; margin: 0 0 12px; }
    .sd-not-approved p { font-size: 15px; color: #718096; line-height: 1.6; margin: 0 0 28px; }
    .sd-not-approved-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

    /* Prevent overflow and endless scroll */
    .sd-page { overflow-x: hidden; }
    .container { max-width: 100%; overflow-x: hidden; }

    @media (max-width: 480px) {
        body { overflow-x: hidden; }
    }
`;

export default ScheduledDashboard;
