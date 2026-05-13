import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../../components/layout/Layout";
import apiClient from "../../config/api";
import { useAuth } from "../../contexts/AuthContext";
import SEO from "../../components/common/SEO";
import { pageSeoConfig } from "../../config/seo";
import { formatCurrency, formatDate } from "../../lib/formatters";
import { logger } from "../../lib/logger";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import AuthGuard from "../../components/guards/AuthGuard";
import { getProductImageUrl, PRODUCT_FALLBACK_IMAGE } from "../../lib/imageProxy";

const ScheduledOrderDetail = () => {
    const router = useRouter();
    const { id } = router.query;
    const { user, isAuthenticated } = useAuth();
    const seoConfig = pageSeoConfig['/scheduled-history/detail'];

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [productImages, setProductImages] = useState({});

    useEffect(() => {
        if (!router.isReady || !id || !isAuthenticated || user?.customer?.isVisitor) {
            setLoading(false);
            return;
        }

        const fetchOrder = async () => {
            try {
                setLoading(true);
                setError(null);
                const [response, productsRes] = await Promise.all([
                    ( apiClient as any).getScheduledOrder(id),
                    ( apiClient as any).getProducts(200).catch(() => null),
                ]);
                setOrder(response);

                // Build image lookup map from products
                if (productsRes) {
                    const raw = productsRes?.values || productsRes?.data || productsRes?.message || [];
                    const imgMap: any = {};
                    (Array.isArray(raw) ? raw : []).forEach((p: any) => {
                        const code = p.itemCode || p.ItemCode;
                        const img = getProductImageUrl(p, '');
                        if (code && img) imgMap[code] = img;
                    });
                    setProductImages(imgMap);
                }
            } catch (err: any) {
                logger.error('Failed to fetch scheduled order:', err);
                setError(err?.message || 'Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [router.isReady, id, user?.customer?.isVisitor, isAuthenticated]);

    const getStatusColor = (status: any) => {
        const s = (status || '').toLowerCase();
        if (s.includes('paid') || s === 'invoicedandpaid' || s === 'orderedandpaid') return '#22863a';
        if (s === 'invoiced') return '#2b6cb0';
        if (s === 'ordered') return '#d97706';
        if (s === 'failed') return '#e53e3e';
        return '#718096';
    };

    const getPaymentStatusColor = (status: any) => {
        const s = (status || '').toLowerCase();
        if (s === 'paid') return '#22863a';
        if (s === 'partial') return '#d97706';
        if (s === 'pending') return '#a0aec0';
        return '#718096';
    };

    // Normalize field access for inconsistent API casing
    const getField = (obj: any, ...keys: any[]) => {
        if (!obj) return null;
        for (const k of keys) {
            if (obj[k] !== undefined && obj[k] !== null) return obj[k];
        }
        return null;
    };

    if (loading || !router.isReady) {
        return (
            <AuthGuard>
                <SEO {...seoConfig} />
                <Layout parent="Scheduled" sub="Order Detail">
                    <style>{styles}</style>
                    <div style={{ padding: '80px 0' }}>
                        <LoadingSpinner text="Loading order details..." />
                    </div>
                </Layout>
            </AuthGuard>
        );
    }

    if (error || !order) {
        return (
            <AuthGuard>
                <SEO {...seoConfig} />
                <Layout parent="Scheduled" sub="Order Detail">
                    <style>{styles}</style>
                    <div className="sod-page">
                        <div className="container">
                            <div className="sod-error">
                                <div className="sod-error-icon">
                                    <i className="fi-rs-exclamation"></i>
                                </div>
                                <h2>{error ? 'Unable to Load Order' : 'Order Not Found'}</h2>
                                <p>{error || 'The order you are looking for does not exist or has been removed.'}</p>
                                <Link href="/scheduled-history" className="sod-btn-primary">
                                    Back to Order History
                                </Link>
                            </div>
                        </div>
                    </div>
                </Layout>
            </AuthGuard>
        );
    }

    const docNum = getField(order, 'DocNum', 'docNum');
    const docEntry = getField(order, 'DocEntry', 'docEntry');
    const status = getField(order, 'U_Status', 'u_Status', 'Status', 'status') || 'Ordered';
    const paymentStatus = getField(order, 'U_PaymentStatus', 'u_PaymentStatus') || 'Pending';
    const paymentMethod = getField(order, 'U_PaymentMethod', 'u_PaymentMethod') || 'COD';
    const cardName = getField(order, 'U_CardName', 'u_CardName') || '';
    const cardCode = getField(order, 'U_CardCode', 'u_CardCode') || '';
    const slpName = getField(order, 'U_SlpName', 'u_SlpName') || '';
    const dlvryName = getField(order, 'U_DlvryPsnName', 'u_DlvryPsnName') || '';
    const docDate = getField(order, 'U_DocumentDate', 'u_DocumentDate', 'CreateDate', 'createDate');
    const deliveryDate = getField(order, 'U_DeliveryDate', 'u_DeliveryDate');
    const currency = getField(order, 'U_DocCurrency', 'u_DocCurrency') || 'USD';
    const total = Number(getField(order, 'U_DocTotal', 'u_DocTotal')) || 0;
    const amountPaid = Number(getField(order, 'U_AmountPaid', 'u_AmountPaid')) || 0;
    const comments = getField(order, 'Remark', 'remark', 'Comments', 'comments') || '';
    const invoiceType = getField(order, 'U_InvoiceType', 'u_InvoiceType') || '';
    const sapDocEntry = Number(getField(order, 'U_SAPDocEntry', 'u_SAPDocEntry')) || 0;
    const foDocEntry = getField(order, 'U_FODocEntry', 'u_FODocEntry') || '';
    const paymentRef = getField(order, 'U_PaymentReference', 'u_PaymentReference') || '';
    const createTime = getField(order, 'CreateTime', 'createTime') || '';

    const lines = (order as any)?.ONA_SPOR1Collection || (order as any)?.ona_SPOR1Collection || (order as any)?.documentLines || [];

    return (
        <AuthGuard>
            <SEO title={`Order #${docNum} | Snappy Fresh Business`} description="View scheduled order details" noindex />
            <Layout parent="Scheduled" sub="Order Detail">
                <style>{styles}</style>
                <div className="sod-page">
                    <div className="container">
                        {/* Back Link */}
                        <Link href="/scheduled-history" className="sod-back">
                            &larr; Back to Order History
                        </Link>

                        {/* Header */}
                        <div className="sod-header">
                            <div className="sod-header-left">
                                <h1>Order #{docNum}</h1>
                                <p className="sod-header-meta">
                                    Placed on {formatDate(docDate)}{createTime ? ` at ${createTime}` : ''}
                                    {cardName && <span> by <strong>{cardName}</strong></span>}
                                </p>
                            </div>
                            <div className="sod-header-right">
                                <StatusBadge status={status.toLowerCase()} label={status} />
                            </div>
                        </div>

                        {/* Status + Payment Summary Cards */}
                        <div className="sod-summary-grid">
                            <div className="sod-summary-card">
                                <span className="sod-summary-label">Order Status</span>
                                <span className="sod-summary-value" style={{ color: getStatusColor(status) }}>
                                    {status}
                                </span>
                            </div>
                            <div className="sod-summary-card">
                                <span className="sod-summary-label">Delivery Date</span>
                                <span className="sod-summary-value sod-summary-highlight">
                                    {deliveryDate ? formatDate(deliveryDate) : 'TBD'}
                                </span>
                            </div>
                            <div className="sod-summary-card">
                                <span className="sod-summary-label">Payment Status</span>
                                <span className="sod-summary-value" style={{ color: getPaymentStatusColor(paymentStatus) }}>
                                    {paymentStatus}
                                </span>
                            </div>
                            <div className="sod-summary-card">
                                <span className="sod-summary-label">Order Total</span>
                                <span className="sod-summary-value sod-summary-total">
                                    {formatCurrency(total)}
                                </span>
                            </div>
                        </div>

                        <div className="sod-content-grid">
                            {/* Left: Order Items */}
                            <div className="sod-main">
                                <div className="sod-card">
                                    <div className="sod-card-header">
                                        <h3>Order Items ({lines.length})</h3>
                                    </div>
                                    {lines.length === 0 ? (
                                        <div className="sod-card-empty">
                                            <p>No items found for this order.</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="sod-items-header">
                                                <span>Product</span>
                                                <span>Qty Ordered</span>
                                                <span>Qty Committed</span>
                                                <span>Price</span>
                                                <span>Subtotal</span>
                                            </div>
                                            {lines.map((line: any, i: any) => {
                                                const itemCode = getField(line, 'U_ItemCode', 'u_ItemCode', 'ItemCode');
                                                const itemName = getField(line, 'U_ItemName', 'u_ItemName', 'ItemName');
                                                const price = Number(getField(line, 'U_PriceAfterVAT', 'u_PriceAfterVAT', 'PriceAfterVAT')) || 0;
                                                const qtyOrdered = Number(getField(line, 'U_QuantityOrdered', 'u_QuantityOrdered', 'Quantity')) || 0;
                                                const qtyCommitted = Number(getField(line, 'U_QuantityCommited', 'u_QuantityCommited')) || 0;
                                                const warehouse = getField(line, 'U_Warehouse', 'u_Warehouse', 'WarehouseCode') || '';
                                                const lineTotal = price * qtyOrdered;

                                                const itemImage = (productImages as any)[itemCode] || PRODUCT_FALLBACK_IMAGE;

                                                return (
                                                    <div key={itemCode || i} className="sod-item-row">
                                                        <div className="sod-item-product">
                                                            <div className="sod-item-thumb">
                                                                <img
                                                                    src={itemImage}
                                                                    alt={itemName || 'Product'}
                                                                    onError={(e: any) => { e.target.src = PRODUCT_FALLBACK_IMAGE; }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <span className="sod-item-name">{itemName}</span>
                                                                <span className="sod-item-code">{itemCode}</span>
                                                                {warehouse && <span className="sod-item-wh">WH: {warehouse}</span>}
                                                            </div>
                                                        </div>
                                                        <span className="sod-item-qty">{qtyOrdered}</span>
                                                        <span className={`sod-item-qty ${qtyCommitted > 0 ? 'sod-qty-committed' : 'sod-qty-zero'}`}>
                                                            {qtyCommitted}
                                                        </span>
                                                        <span className="sod-item-price">{formatCurrency(price)}</span>
                                                        <span className="sod-item-subtotal">{formatCurrency(lineTotal)}</span>
                                                    </div>
                                                );
                                            })}
                                            <div className="sod-items-total">
                                                <span>Grand Total</span>
                                                <span className="sod-grand-total">{formatCurrency(total)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Comments */}
                                {comments && (
                                    <div className="sod-card">
                                        <div className="sod-card-header">
                                            <h3>Order Notes</h3>
                                        </div>
                                        <div className="sod-card-body">
                                            <p className="sod-comments">{comments}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right: Order Info Sidebar */}
                            <div className="sod-sidebar">
                                {/* Order Info */}
                                <div className="sod-card">
                                    <div className="sod-card-header">
                                        <h3>Order Information</h3>
                                    </div>
                                    <div className="sod-info-list">
                                        <div className="sod-info-row">
                                            <span className="sod-info-label">Order Number</span>
                                            <span className="sod-info-value">#{docNum}</span>
                                        </div>
                                        <div className="sod-info-row">
                                            <span className="sod-info-label">Doc Entry</span>
                                            <span className="sod-info-value">{docEntry}</span>
                                        </div>
                                        <div className="sod-info-row">
                                            <span className="sod-info-label">Order Date</span>
                                            <span className="sod-info-value">{formatDate(docDate)}</span>
                                        </div>
                                        <div className="sod-info-row">
                                            <span className="sod-info-label">Delivery Date</span>
                                            <span className="sod-info-value sod-info-highlight">{deliveryDate ? formatDate(deliveryDate) : 'TBD'}</span>
                                        </div>
                                        {foDocEntry && (
                                            <div className="sod-info-row">
                                                <span className="sod-info-label">Schedule Ref</span>
                                                <span className="sod-info-value">#{foDocEntry}</span>
                                            </div>
                                        )}
                                        <div className="sod-info-row">
                                            <span className="sod-info-label">Currency</span>
                                            <span className="sod-info-value">{currency}</span>
                                        </div>
                                        {invoiceType && (
                                            <div className="sod-info-row">
                                                <span className="sod-info-label">Invoice Type</span>
                                                <span className="sod-info-value">{invoiceType}</span>
                                            </div>
                                        )}
                                        {sapDocEntry > 0 && (
                                            <div className="sod-info-row">
                                                <span className="sod-info-label">SAP Doc Entry</span>
                                                <span className="sod-info-value">{sapDocEntry}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="sod-card">
                                    <div className="sod-card-header">
                                        <h3>Customer</h3>
                                    </div>
                                    <div className="sod-info-list">
                                        <div className="sod-info-row">
                                            <span className="sod-info-label">Name</span>
                                            <span className="sod-info-value">{cardName}</span>
                                        </div>
                                        <div className="sod-info-row">
                                            <span className="sod-info-label">Code</span>
                                            <span className="sod-info-value">{cardCode}</span>
                                        </div>
                                        {slpName && (
                                            <div className="sod-info-row">
                                                <span className="sod-info-label">Sales Person</span>
                                                <span className="sod-info-value">{slpName}</span>
                                            </div>
                                        )}
                                        {dlvryName && (
                                            <div className="sod-info-row">
                                                <span className="sod-info-label">Delivery Person</span>
                                                <span className="sod-info-value">{dlvryName}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Payment Info */}
                                <div className="sod-card">
                                    <div className="sod-card-header">
                                        <h3>Payment</h3>
                                    </div>
                                    <div className="sod-info-list">
                                        <div className="sod-info-row">
                                            <span className="sod-info-label">Method</span>
                                            <span className="sod-info-value">{paymentMethod === 'COD' ? 'Cash on Delivery' : paymentMethod}</span>
                                        </div>
                                        <div className="sod-info-row">
                                            <span className="sod-info-label">Status</span>
                                            <span className="sod-info-value" style={{ color: getPaymentStatusColor(paymentStatus) }}>
                                                {paymentStatus}
                                            </span>
                                        </div>
                                        <div className="sod-info-row">
                                            <span className="sod-info-label">Amount Paid</span>
                                            <span className="sod-info-value">{formatCurrency(amountPaid)}</span>
                                        </div>
                                        {amountPaid < total && (
                                            <div className="sod-info-row">
                                                <span className="sod-info-label">Balance Due</span>
                                                <span className="sod-info-value" style={{ color: '#e53e3e', fontWeight: 700 }}>
                                                    {formatCurrency(total - amountPaid)}
                                                </span>
                                            </div>
                                        )}
                                        {paymentRef && (
                                            <div className="sod-info-row">
                                                <span className="sod-info-label">Reference</span>
                                                <span className="sod-info-value">{paymentRef}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="sod-actions">
                                    <Link href="/scheduled-orders" className="sod-btn-primary sod-btn-full">
                                        <i className="fi-rs-plus"></i> Place New Order
                                    </Link>
                                    <Link href="/scheduled-history" className="sod-btn-outline sod-btn-full">
                                        <i className="fi-rs-list"></i> All Orders
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </AuthGuard>
    );
};

const styles = `
    .sod-page { padding: 30px 0 80px; min-height: 60vh; }

    .sod-back {
        display: inline-flex; align-items: center; gap: 6px; font-size: 14px;
        color: #718096; text-decoration: none; margin-bottom: 20px; font-weight: 600;
        transition: color 0.2s;
    }
    .sod-back:hover { color: #1a5c38; }

    .sod-header {
        display: flex; justify-content: space-between; align-items: flex-start;
        margin-bottom: 24px; gap: 16px; flex-wrap: wrap;
    }
    .sod-header h1 { font-size: 28px; font-weight: 800; color: #1a202c; margin: 0 0 4px; }
    .sod-header-meta { font-size: 14px; color: #718096; margin: 0; }
    .sod-header-meta strong { color: #4a5568; }

    .sod-summary-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 14px; margin-bottom: 28px;
    }
    .sod-summary-card {
        background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px;
    }
    .sod-summary-label {
        font-size: 11px; font-weight: 700; color: #a0aec0; text-transform: uppercase;
        letter-spacing: 0.5px; display: block; margin-bottom: 6px;
    }
    .sod-summary-value { font-size: 18px; font-weight: 700; color: #1a202c; }
    .sod-summary-highlight { color: #1a5c38; }
    .sod-summary-total { color: #1a5c38; font-size: 20px; }

    .sod-content-grid { display: grid; grid-template-columns: 1fr 340px; gap: 24px; }
    @media (max-width: 960px) { .sod-content-grid { grid-template-columns: 1fr; } }

    .sod-card {
        background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
        overflow: hidden; margin-bottom: 20px;
    }
    .sod-card-header {
        padding: 16px 24px; border-bottom: 1px solid #f0f0f0;
    }
    .sod-card-header h3 { font-size: 15px; font-weight: 700; color: #1a202c; margin: 0; }
    .sod-card-body { padding: 20px 24px; }
    .sod-card-empty { padding: 40px 24px; text-align: center; color: #a0aec0; font-size: 14px; }

    /* Items Table */
    .sod-items-header {
        display: grid; grid-template-columns: 2fr 0.7fr 0.7fr 0.8fr 0.8fr; gap: 12px;
        padding: 12px 24px; background: #f7fafc; font-size: 11px; font-weight: 700;
        color: #718096; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .sod-item-row {
        display: grid; grid-template-columns: 2fr 0.7fr 0.7fr 0.8fr 0.8fr; gap: 12px;
        padding: 14px 24px; border-bottom: 1px solid #f7fafc; align-items: center;
    }
    .sod-item-row:last-child { border-bottom: none; }
    .sod-item-product { display: flex; align-items: center; gap: 12px; min-width: 0; }
    .sod-item-thumb {
        width: 48px; height: 48px; border-radius: 8px; background: #f7fafc;
        overflow: hidden; flex-shrink: 0;
    }
    .sod-item-thumb img {
        width: 100%; height: 100%; object-fit: contain; padding: 2px;
    }
    .sod-item-name {
        font-size: 13px; font-weight: 600; color: #1a202c; display: block;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .sod-item-code { font-size: 11px; color: #a0aec0; display: block; }
    .sod-item-wh { font-size: 10px; color: #cbd5e0; display: block; }
    .sod-item-qty { font-size: 14px; color: #4a5568; font-weight: 600; }
    .sod-qty-committed { color: #22863a; }
    .sod-qty-zero { color: #cbd5e0; }
    .sod-item-price { font-size: 13px; color: #4a5568; }
    .sod-item-subtotal { font-size: 14px; font-weight: 700; color: #1a202c; }

    .sod-items-total {
        display: flex; justify-content: space-between; align-items: center;
        padding: 16px 24px; background: #f7fafc; border-top: 1px solid #e2e8f0;
    }
    .sod-items-total span:first-child { font-size: 15px; font-weight: 700; color: #1a202c; }
    .sod-grand-total { font-size: 22px; font-weight: 800; color: #1a5c38; }

    @media (max-width: 640px) {
        .sod-items-header { display: none; }
        .sod-item-row {
            grid-template-columns: 1fr 1fr; gap: 8px;
        }
        .sod-item-product { grid-column: 1 / -1; }
        .sod-item-qty::before { content: 'Qty: '; font-weight: 400; color: #a0aec0; }
        .sod-item-price::before { content: 'Price: '; font-weight: 400; color: #a0aec0; }
        .sod-item-subtotal::before { content: 'Total: '; font-weight: 400; color: #a0aec0; }
    }

    .sod-comments { font-size: 14px; color: #4a5568; line-height: 1.6; margin: 0; }

    /* Sidebar Info */
    .sod-info-list { padding: 8px 0; }
    .sod-info-row {
        display: flex; justify-content: space-between; align-items: center;
        padding: 10px 24px; font-size: 13px;
    }
    .sod-info-row:not(:last-child) { border-bottom: 1px solid #f7fafc; }
    .sod-info-label { color: #718096; }
    .sod-info-value { color: #1a202c; font-weight: 600; text-align: right; }
    .sod-info-highlight { color: #1a5c38; }

    /* Actions */
    .sod-actions { display: flex; flex-direction: column; gap: 10px; }
    .sod-btn-primary {
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        background: #1a5c38; color: #fff; border: none; padding: 12px 24px;
        border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer;
        transition: all 0.2s; text-decoration: none;
    }
    .sod-btn-primary:hover { background: #236b43; color: #fff; }
    .sod-btn-outline {
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        background: #fff; color: #4a5568; border: 1px solid #e2e8f0; padding: 12px 24px;
        border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer;
        transition: all 0.2s; text-decoration: none;
    }
    .sod-btn-outline:hover { border-color: #1a5c38; color: #1a5c38; }
    .sod-btn-full { width: 100%; }

    /* Error State */
    .sod-error {
        text-align: center; padding: 80px 20px; max-width: 440px; margin: 0 auto;
    }
    .sod-error-icon {
        width: 80px; height: 80px; border-radius: 50%; background: #fff5f5;
        display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;
        font-size: 32px; color: #e53e3e;
    }
    .sod-error h2 { font-size: 22px; font-weight: 700; color: #1a202c; margin: 0 0 8px; }
    .sod-error p { font-size: 15px; color: #718096; margin: 0 0 24px; line-height: 1.6; }
`;

export default ScheduledOrderDetail;
