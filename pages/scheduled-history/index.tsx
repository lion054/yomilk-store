import Link from "next/link";
import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../contexts/AuthContext";
import apiClient from "../../config/api";
import SEO from "../../components/common/SEO";
import { pageSeoConfig } from "../../config/seo";
import { formatCurrency, formatDate } from "../../lib/formatters";
import { normalizeArray, normalizeInvoice, normalizeScheduledOrder } from "../../lib/normalizeApiResponse";
import StatusBadge from "../../components/common/StatusBadge";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Pagination from "../../components/common/Pagination";
import ScheduledGuard from "../../components/guards/ScheduledGuard";
import { logger } from "../../lib/logger";

const ScheduledHistory = () => {
    const { user, isAuthenticated } = useAuth();
    const [filterStatus, setFilterStatus] = useState("all");
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const seoConfig = pageSeoConfig['/scheduled-history'];

    // Fetch orders from API when user or page changes
    useEffect(() => {
        if (!isAuthenticated || user?.customer?.isVisitor) {
            setOrders([]);
            setLoading(false);
            return;
        }

        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch both regular invoices and scheduled orders
                const [invoicesRes, scheduledRes] = await Promise.allSettled([
                    ( apiClient as any).getStoreInvoices(20, page),
                    ( apiClient as any).getScheduledOrders()
                ]);

                // Process invoices
                const invoices = invoicesRes.status === 'fulfilled'
                    ? normalizeArray(invoicesRes.value)
                    : [];

                // Process scheduled orders
                const scheduled = scheduledRes.status === 'fulfilled'
                    ? normalizeArray(scheduledRes.value)
                    : [];

                // Normalize invoices to a common format
                const normalizedInvoices = invoices.map((inv: any) => ({
                    ...normalizeInvoice(inv),
                    deliveryDate: inv.DocDueDate || inv.docDueDate,
                    type: 'invoice'
                }));

                // Normalize scheduled orders
                const normalizedScheduled = scheduled.map((so: any) => normalizeScheduledOrder(so));

                // Combine and sort by date (newest first)
                const allOrders = [...normalizedInvoices, ...normalizedScheduled]
                    .sort((a: any, b: any) => new Date(b.date as any).getTime() - new Date(a.date as any).getTime());

                setOrders(allOrders);
                setTotalPages(invoicesRes.status === 'fulfilled' ? (invoicesRes.value?.pageCount || 1) : 1);
            } catch (err: any) {
                logger.error('Error fetching orders:', err);
                setError(err?.message || 'Failed to load orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user?.customer?.cardCode, isAuthenticated, page]);

    const filteredOrders = filterStatus === "all"
        ? orders
        : filterStatus === "Scheduled"
            ? orders.filter(o => o.type === 'scheduled')
            : orders.filter(o => (o.status || '').toLowerCase() === filterStatus.toLowerCase());

    const getStatusLabel = (status: any) => {
        const s = (status || '').toLowerCase();
        if (s === 'c' || s === 'closed') return 'Completed';
        if (s === 'o' || s === 'open') return 'Open';
        return status || 'Unknown';
    };

    return (
        <ScheduledGuard>
            <style>{shStyles}</style>
            <SEO {...seoConfig} />
            <Layout parent="Scheduled" sub="Orders" subChild="Management">
                <section className="page-content pt-150 pb-150">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                {/* Header */}
                                <div className="sf-card sf-card--flat sf-mb-6">
                                    <div className="sf-card__body sf-card__body--lg">
                                        <div className="sh-header-row">
                                            <div>
                                                <h2 className="sf-card__title sf-mb-2 sh-title-row">
                                                    🛒 Order Management
                                                </h2>
                                                <p className="sf-text-muted sf-mb-0 sh-subtitle">
                                                    Manage and track all your scheduled orders
                                                </p>
                                            </div>
                                            <Link href="/scheduled-orders" className="sf-btn sf-btn--green sf-btn--lg">
                                                + New Order
                                            </Link>
                                        </div>

                                        {/* Quick Stats */}
                                        <div className="sf-divider">
                                            <div className="sf-detail-grid">
                                                <div>
                                                    <p className="sf-stat__meta-label">Total Orders</p>
                                                    <p className="sf-detail-grid__value sf-detail-grid__value--green">{orders.length}</p>
                                                </div>
                                                <div>
                                                    <p className="sf-stat__meta-label">Open</p>
                                                    <p className="sf-detail-grid__value sf-detail-grid__value--purple">{orders.filter(o => ['open', 'o'].includes((o.status || '').toLowerCase())).length}</p>
                                                </div>
                                                <div>
                                                    <p className="sf-stat__meta-label">Completed</p>
                                                    <p className="sf-detail-grid__value sf-detail-grid__value--green">{orders.filter(o => ['closed', 'c', 'delivered'].includes((o.status || '').toLowerCase())).length}</p>
                                                </div>
                                                <div>
                                                    <p className="sf-stat__meta-label">Avg Order Value</p>
                                                    <p className="sf-detail-grid__value sf-detail-grid__value--purple">{formatCurrency(orders.length > 0 ? orders.reduce((sum, o) => sum + (o.amount || 0), 0) / orders.length : 0)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="sf-card sf-card--flat sf-mb-6">
                                    <div className="sf-card__body sh-filter-bar">
                                        <h3 className="sf-label--sm sf-mb-0">Filter by Status:</h3>
                                        <div className="sf-filter-tabs">
                                            {["all", "Open", "Closed", "Scheduled"].map((status: any) => (
                                                <button
                                                    type="button"
                                                    key={status}
                                                    onClick={() => setFilterStatus(status)}
                                                    className={`sf-filter-tab ${filterStatus === status ? 'sf-filter-tab--active' : ''}`}
                                                >
                                                    {status === "all" ? "All Orders" : status}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Loading State */}
                                {loading && (
                                    <LoadingSpinner text="Loading orders..." />
                                )}

                                {/* Error State */}
                                {!loading && error && (
                                    <div className="sf-empty">
                                        <p className="sf-text-danger sf-fw-600">Unable to Load Orders</p>
                                        <p className="sf-text-muted">We couldn&apos;t fetch your orders. Please try again or contact support if the problem persists.</p>
                                        <button type="button" onClick={() => window.location.reload()} className="sf-btn sf-btn--green sf-btn--md">
                                            Try Again
                                        </button>
                                    </div>
                                )}

                                {/* Orders Table */}
                                {!loading && !error && (
                                <div className="sf-card">
                                    <div className="table-responsive">
                                        <table className="sf-table">
                                            <thead>
                                                <tr>
                                                    <th>Order ID</th>
                                                    <th>PO Number</th>
                                                    <th>Order Date</th>
                                                    <th>Delivery</th>
                                                    <th className="text-center">Items</th>
                                                    <th className="text-right">Amount</th>
                                                    <th className="text-center">Status</th>
                                                    <th className="text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredOrders.map((order, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <Link href={`/scheduled-history/${order.id}`} className="sf-link">
                                                                {order.id}
                                                            </Link>
                                                        </td>
                                                        <td className="sf-table__cell--muted">
                                                            {order.poNumber}
                                                        </td>
                                                        <td className="sf-table__cell--muted">
                                                            {formatDate(order.date)}
                                                        </td>
                                                        <td className="sf-table__cell--muted">
                                                            {formatDate(order.deliveryDate)}
                                                        </td>
                                                        <td className="text-center sf-table__cell--muted">
                                                            {order.items}
                                                        </td>
                                                        <td className="text-right sf-table__cell--money">
                                                            {formatCurrency(order.amount)}
                                                        </td>
                                                        <td className="text-center">
                                                            <StatusBadge
                                                                status={order.status}
                                                                label={`${getStatusLabel(order.status)}${order.type === 'scheduled' ? ' (Scheduled)' : ''}`}
                                                            />
                                                        </td>
                                                        <td className="text-center">
                                                            <button type="button" className="sf-btn sf-btn--link-green">
                                                                View
                                                            </button>
                                                            <span className="sf-text-muted"> | </span>
                                                            <button type="button" className="sf-btn sf-btn--link">
                                                                PDF
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {filteredOrders.length === 0 && (
                                        <EmptyState
                                            icon="fi-rs-shopping-cart"
                                            title="No Orders Found"
                                            text={`You don't have any ${filterStatus !== "all" ? `${filterStatus.toLowerCase()} ` : ""}orders`}
                                        />
                                    )}

                                    <Pagination
                                        currentPage={page}
                                        totalPages={totalPages}
                                        onPageChange={setPage}
                                    />
                                </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </Layout>
        </ScheduledGuard>
    );
};

export default ScheduledHistory;

const shStyles = `
    .sh-header-row {
        display: flex; justify-content: space-between; align-items: flex-start;
        gap: 16px; flex-wrap: wrap; margin-bottom: 20px;
    }
    .sh-title-row { display: flex; align-items: center; gap: 12px; }
    .sh-subtitle { font-size: 15px; }
    .sh-filter-bar {
        display: flex; align-items: center; gap: 15px; flex-wrap: wrap;
    }
`;
