import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import { toast } from 'react-toastify';
import apiClient from '../config/api';
import paymentService from '../services/paymentService';
import { formatCurrency, formatDate } from '../lib/formatters';
import { normalizeArray } from '../lib/normalizeApiResponse';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

const StatusBadge = ({ status }: any) => {
  const map: any = {
    'Paid': 'sf-badge--success',
    'Pending': 'sf-badge--warning',
    'Cancelled': 'sf-badge--danger',
    'Processing': 'sf-badge--purple'
  };
  const badgeClass = map[status] || 'sf-badge--muted';
  return (
    <span className={`sf-badge ${badgeClass}`}>
      {status || 'Pending'}
    </span>
  );
};

const OrderCard = ({ order }: any) => (
  <div className="sf-card sf-card--hoverable sf-card--accent-green sf-mb-4">
    <div className="sf-card__body">
      <div className="co-order-row">
        <div className="co-order-info">
          <span className="sf-fw-700 sf-text-dark">Order #{order.docNum || order.docEntry}</span>
          <span className="sf-text-muted" style={{ fontSize: 'var(--sf-text-sm)' }}>{formatDate(order.docDate)}</span>
        </div>
        <div className="co-order-total">
          <span className="sf-label--sm">Total</span>
          <span className="sf-fw-700 sf-text-dark">{formatCurrency(order.docTotal)}</span>
        </div>
        <div className="co-order-status">
          <span className="sf-label--sm">Status</span>
          <StatusBadge status={order.documentStatus || 'Pending'} />
        </div>
        <Link href={`/profile/invoices?docNum=${order.docNum}`} className="sf-btn sf-btn--green sf-btn--sm">
          View Details <i className="fi-rs-arrow-small-right"></i>
        </Link>
      </div>
      {order.comments && (
        <div className="sf-divider" style={{ fontSize: 'var(--sf-text-sm)' }}>
          <span className="sf-text-muted">Note: {order.comments}</span>
        </div>
      )}
    </div>
  </div>
);

export default function CheckOrder() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [searchDocNum, setSearchDocNum] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null); // 'success' | 'error' | null
  const paymentProcessedRef = useRef(false);

  // Handle PayNow return: read activeOrder from localStorage and finalize
  useEffect(() => {
    if (paymentProcessedRef.current) return;
    const processActiveOrder = async () => {
      try {
        const activeOrderStr = localStorage.getItem('activeOrder');
        const isAccountFunding = localStorage.getItem('accountFunding');
        if (!activeOrderStr) return;

        paymentProcessedRef.current = true;
        setProcessingPayment(true);

        const activeOrder = JSON.parse(activeOrderStr);

        if (isAccountFunding) {
          // Account funding payment
          const result = await paymentService.createIncomingPayment(activeOrder);
          if (result?.success) {
            toast.success('Payment processed successfully!');
            setPaymentResult('success');
          } else {
            throw new Error(result?.error || 'Payment processing failed');
          }
          localStorage.removeItem('accountFunding');
        } else {
          // Standard order creation from payment response
          const result = await paymentService.createOrderFromCart(activeOrder);
          if (result?.success) {
            toast.success('Order placed successfully!');
            setPaymentResult('success');
          } else {
            throw new Error(result?.error || 'Order creation failed');
          }
        }

        localStorage.removeItem('activeOrder');
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Payment processing failed';
        toast.error(msg);
        setPaymentResult('error');
        localStorage.removeItem('activeOrder');
        localStorage.removeItem('accountFunding');
      } finally {
        setProcessingPayment(false);
      }
    };

    processActiveOrder();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) fetchOrders();
    else setLoading(false);
  }, [isAuthenticated, user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ( apiClient as any).getStoreInvoices(50, 1);
      const invoiceList = normalizeArray(response);
      setOrders(Array.isArray(invoiceList) ? invoiceList : []);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally { setLoading(false); }
  };

  const handleSearch = async (e: any) => {
    e.preventDefault();
    if (!searchDocNum.trim()) { toast.error('Please enter an order number'); return; }
    try {
      setLoading(true);
      const response = await ( apiClient as any).getSingleInvoice(Number(searchDocNum));
      if (response) { setSearchResult(response); toast.success('Order found!'); }
      else { setSearchResult(null); toast.error('Order not found'); }
    } catch { setSearchResult(null); toast.error('Order not found'); }
    finally { setLoading(false); }
  };

  return (
    <Layout parent="Home" sub="Check Order">
      <style jsx>{`
        .co-page { background: #f4f9f6; min-height: 60vh; }
        .co-hero {
          background: linear-gradient(135deg, #1a5c38, #1a5c38);
          padding: 52px 0 48px; text-align: center;
          position: relative; overflow: hidden;
        }
        .co-hero::after {
          content: ''; position: absolute;
          bottom: -60px; right: -60px;
          width: 240px; height: 240px; border-radius: 50%;
          background: radial-gradient(circle, rgba(26,92,56,0.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .co-hero-eyebrow { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #7debb1; margin-bottom: 10px; position: relative; z-index: 1; }
        .co-hero h1 { font-size: 2.2rem; font-weight: 900; color: #fff; letter-spacing: -0.04em; margin-bottom: 10px; position: relative; z-index: 1; }
        .co-hero p { color: rgba(255,255,255,0.55); font-size: 0.9rem; position: relative; z-index: 1; }
        .co-body { padding: 40px 0 60px; }
        .co-search-row { display: flex; gap: 12px; }
        .co-search-input {
          flex: 1; padding: 11px 14px;
          border: 1.5px solid #dae8d8; border-radius: var(--sf-radius-lg);
          font-size: 0.9rem; font-family: inherit;
          color: var(--sf-gray-900); background: #fff; outline: none;
          transition: var(--sf-transition-fast);
        }
        .co-search-input::placeholder { color: #b8ccb8; }
        .co-search-input:focus { border-color: var(--sf-green-500); box-shadow: 0 0 0 3.5px rgba(26,92,56,0.12); background: #fafffc; }
        .co-section-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 18px; padding-bottom: 14px;
          border-bottom: 3px solid #f4f9f6; position: relative;
        }
        .co-section-header::after {
          content: ''; position: absolute; bottom: -3px; left: 0;
          width: 48px; height: 3px; background: var(--sf-green-500); border-radius: 3px;
        }
        .co-section-title { font-size: 1.1rem; font-weight: 800; color: var(--sf-gray-900); letter-spacing: -0.025em; }
        .co-view-all { font-size: 13px; font-weight: 700; color: var(--sf-green-500); text-decoration: none; transition: color 0.2s; }
        .co-view-all:hover { color: var(--sf-green-900); }
        .co-order-row {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
        }
        .co-order-info, .co-order-total, .co-order-status {
          display: flex; flex-direction: column; gap: 4px;
        }
        .co-order-total, .co-order-status { align-items: center; }
        .co-guest-card { text-align: center; }
        .co-guest-icon { font-size: 3rem; margin-bottom: 18px; opacity: 0.3; }
        .co-guest-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .co-success-alert {
          display: flex; align-items: center; gap: 10px;
          margin-top: 24px;
        }
        .co-processing-spinner {
          width: 40px; height: 40px; margin: 0 auto;
          border: 3px solid #dae8d8; border-top-color: #1a5c38;
          border-radius: 50%; animation: co-spin 0.8s linear infinite;
        }
        @keyframes co-spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="co-page">
        <div className="co-hero">
          <div className="container">
            <div className="co-hero-eyebrow">Order Tracking</div>
            <h1>Check Your Order</h1>
            <p>Track your order status and view your order history</p>
          </div>
        </div>

        <div className="co-body">
          <div className="container">
            <div className="col-xl-9 col-lg-11 m-auto">

              {/* Payment processing indicator */}
              {processingPayment && (
                <div className="sf-card sf-mb-6">
                  <div className="sf-card__body" style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{ marginBottom: 16 }}>
                      <div className="co-processing-spinner"></div>
                    </div>
                    <h5 className="sf-fw-700 sf-text-dark" style={{ marginBottom: 8 }}>Processing Your Payment</h5>
                    <p className="sf-text-muted">Please wait while we confirm your payment and create your order...</p>
                  </div>
                </div>
              )}

              {/* Payment result */}
              {paymentResult === 'success' && (
                <div className="sf-alert sf-alert--success sf-mb-6" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <i className="fi-rs-checkbox"></i>
                  Your payment has been processed and your order has been placed successfully!
                </div>
              )}
              {paymentResult === 'error' && (
                <div className="sf-alert sf-alert--danger sf-mb-6" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <i className="fi-rs-cross-circle"></i>
                  There was an issue processing your payment. Please contact support if you were charged.
                </div>
              )}

              {/* Search */}
              <div className="sf-card sf-mb-6">
                <div className="sf-card__body">
                  <h4 className="sf-card__section-title">Search by Order Number</h4>
                  <form onSubmit={handleSearch} noValidate>
                    <div className="co-search-row">
                      <input type="text" className="co-search-input" placeholder="Enter your order number (e.g. 10042)" value={searchDocNum} onChange={(e) => setSearchDocNum(e.target.value)} />
                      <button type="submit" className="sf-btn sf-btn--green sf-btn--md" disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
                    </div>
                  </form>
                  {searchResult && (
                    <div style={{ marginTop: 24 }}>
                      <p className="sf-label--sm sf-text-green sf-mb-2">Search Result</p>
                      <OrderCard order={searchResult} />
                    </div>
                  )}
                </div>
              </div>

              {/* Order History */}
              {isAuthenticated && (
                <div>
                  <div className="co-section-header">
                    <span className="co-section-title">Your Recent Orders</span>
                    <Link href="/profile/invoice" className="co-view-all">View all <i className="fi-rs-angle-right"></i></Link>
                  </div>
                  {loading ? (
                    <LoadingSpinner text="Loading orders..." />
                  ) : orders.length > 0 ? (
                    orders.slice(0, 5).map((order: any, i: any) => <OrderCard key={order.docEntry || i} order={order} />)
                  ) : (
                    <div className="sf-card">
                      <div className="sf-card__body">
                        <EmptyState
                          icon="fi-rs-box"
                          title="No orders found"
                          text="You haven't placed any orders yet."
                        />
                        <div className="sf-flex-end" style={{ justifyContent: 'center', marginTop: '16px' }}>
                          <Link href="/store" className="sf-btn sf-btn--green sf-btn--md">Start Shopping</Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Guest CTA */}
              {!isAuthenticated && !searchResult && (
                <div className="sf-card">
                  <div className="sf-card__body co-guest-card">
                    <div className="co-guest-icon">&#128100;</div>
                    <h5 className="sf-card__section-title" style={{ justifyContent: 'center' }}>Track All Your Orders</h5>
                    <p className="sf-text-muted sf-mb-6">Sign in to your account to view your complete order history and track your orders in real-time.</p>
                    <div className="co-guest-btns">
                      <Link href="/login" className="sf-btn sf-btn--green sf-btn--lg">Sign In</Link>
                      <Link href="/register" className="sf-btn sf-btn--outline-gray sf-btn--lg">Create Account</Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Success alert */}
              {router.query['success'] && (
                <div className="sf-alert sf-alert--success co-success-alert">
                  <i className="fi-rs-checkbox"></i>
                  Your order has been placed successfully! You will receive a confirmation email shortly.
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
