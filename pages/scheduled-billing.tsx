import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Layout from "../components/layout/Layout";
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../config/api";
import SEO from "../components/common/SEO";
import { pageSeoConfig } from "../config/seo";
import { formatCurrency } from "../lib/formatters";
import { normalizeArray, normalizeInvoice } from "../lib/normalizeApiResponse";
import StatusBadge from "../components/common/StatusBadge";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import AuthGuard from "../components/guards/AuthGuard";

const ScheduledBilling = () => {
    const { user, isAuthenticated } = useAuth();
    const [showRequestCredit, setShowRequestCredit] = useState(false);
    const seoConfig = pageSeoConfig['/scheduled-billing'];
    const [creditRequest, setCreditRequest] = useState({
        requestedAmount: "",
        reason: ""
    });
    const [billingData, setBillingData] = useState<any>(null);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch billing data and invoices when profile switches
    useEffect(() => {
        const cardCode = user?.customer?.cardCode;
        if (!isAuthenticated || user?.customer?.isVisitor || !cardCode) {
            setBillingData(null);
            setInvoices([]);
            setLoading(false);
            return;
        }

        const fetchBillingData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [partnerRes, invoicesRes] = await Promise.allSettled([
                    ( apiClient as any).getBusinessPartnerDetails(cardCode),
                    ( apiClient as any).getStoreInvoices(20, 1)
                ]);

                // Process business partner details for billing info
                if (partnerRes.status === 'fulfilled' && partnerRes.value) {
                    const bp = partnerRes.value;
                    const creditLimit = bp.CreditLimit || bp.creditLimit || 0;
                    const balance = bp.CurrentAccountBalance || bp.currentAccountBalance || bp.Balance || bp.balance || 0;
                    const openDeliveryNotesBalance = bp.OpenDeliveryNotesBalance || bp.openDeliveryNotesBalance || 0;
                    const usedCredit = Math.abs(balance) + openDeliveryNotesBalance;

                    setBillingData({
                        creditLimit,
                        usedCredit,
                        paymentTerms: bp.PayTermsGrpCode || bp.payTermsGrpCode || bp.PeymentMethodCode || 'N/A',
                        outstandingAmount: Math.abs(balance),
                        nextDueDate: bp.NextDueDate || bp.nextDueDate || '',
                        complianceStatus: bp.Valid || bp.valid === 'Y' ? 'Good' : 'Review'
                    });
                }

                // Process invoices
                if (invoicesRes.status === 'fulfilled') {
                    const rawInvoices = normalizeArray(invoicesRes.value);
                    setInvoices(rawInvoices.map((inv: any) => normalizeInvoice(inv)));
                }
            } catch (err: any) {
                setError(err?.message || 'Failed to load billing data');
            } finally {
                setLoading(false);
            }
        };

        fetchBillingData();
    }, [user?.customer?.cardCode, isAuthenticated]);

    const handleRequestCredit = async (e: any) => {
        e.preventDefault();
        if (!creditRequest.requestedAmount || !creditRequest.reason) {
            toast.error("Please fill all fields");
            return;
        }
        // TODO: Implement credit request API call
        toast.success("Credit request submitted successfully!");
        setCreditRequest({ requestedAmount: "", reason: "" });
        setShowRequestCredit(false);
    };

    return (
        <AuthGuard>
            <SEO {...seoConfig} />
            <Layout parent="Scheduled" sub="Billing" subChild="Credit & Payments">
                <section className="page-content pt-150 pb-150">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                {loading ? (
                                    <LoadingSpinner text="Loading billing data..." />
                                ) : error ? (
                                    <div className="sf-alert sf-alert--danger sf-mb-6">{error}</div>
                                ) : !billingData ? (
                                    <EmptyState
                                        icon="fi-rs-credit-card"
                                        title="No Billing Data"
                                        text="Billing information is not available for your account."
                                    />
                                ) : (<>
                                {/* Main Credit Card */}
                                <div className="sf-hero-card sf-hero-card--purple">
                                    <div className="sf-hero-card__orb" />

                                    <div className="sf-hero-card__content">
                                        <p className="sf-hero-card__eyebrow">Available Credit</p>
                                        <h1 className="sf-hero-card__value">
                                            ${(billingData.creditLimit - billingData.usedCredit).toFixed(2)}
                                        </h1>

                                        <div className="sf-hero-card__actions">
                                            <button
                                                onClick={() => setShowRequestCredit(!showRequestCredit)}
                                                className="sf-btn sf-btn--white sf-btn--lg"
                                            >
                                                Request More Credit
                                            </button>
                                            <button className="sf-btn sf-btn--outline-white sf-btn--lg">
                                                Make Payment
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Credit Request Form */}
                                {showRequestCredit && (
                                    <div className="sf-card sf-card--flat sf-mb-6">
                                        <div className="sf-card__body sf-card__body--lg">
                                            <h3 className="sf-card__section-title">Request Additional Credit</h3>
                                            <form onSubmit={handleRequestCredit}>
                                                <div className="row">
                                                    <div className="col-md-6 mb-3">
                                                        <label className="sf-label">Requested Amount</label>
                                                        <div className="sf-input-prefix">
                                                            <span className="sf-input-prefix__symbol">$</span>
                                                            <input
                                                                type="number"
                                                                placeholder="Enter amount"
                                                                value={creditRequest.requestedAmount}
                                                                onChange={(e) => setCreditRequest({ ...creditRequest, requestedAmount: e.target.value })}
                                                                className="sf-input"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="sf-label">Your Account Status</label>
                                                        <div className="sf-status-field">
                                                            {billingData.complianceStatus}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="sf-form-group">
                                                    <label className="sf-label">Reason for Request</label>
                                                    <textarea
                                                        placeholder="Please tell us why you need additional credit..."
                                                        value={creditRequest.reason}
                                                        onChange={(e) => setCreditRequest({ ...creditRequest, reason: e.target.value })}
                                                        className="sf-textarea"
                                                    />
                                                </div>

                                                <div className="sf-flex-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowRequestCredit(false)}
                                                        className="sf-btn sf-btn--ghost sf-btn--lg"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="sf-btn sf-btn--purple sf-btn--lg"
                                                    >
                                                        Submit Request
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )}

                                {/* Summary Cards */}
                                <div className="row mb-4">
                                    <div className="col-md-6 mb-3">
                                        <div className="sf-card sf-card--flat sf-card--hoverable sf-card--accent-purple">
                                            <div className="sf-stat">
                                                <p className="sf-stat__meta-label">Credit Limit</p>
                                                <h3 className="sf-stat__value sf-stat__value--purple">{formatCurrency(billingData.creditLimit)}</h3>
                                                <p className="sf-stat__sublabel">Your maximum credit line</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <div className="sf-card sf-card--flat sf-card--hoverable sf-card--accent-warning">
                                            <div className="sf-stat">
                                                <p className="sf-stat__meta-label">Outstanding Amount</p>
                                                <h3 className="sf-stat__value sf-stat__value--warning">{formatCurrency(billingData.outstandingAmount)}</h3>
                                                <p className="sf-stat__sublabel">Due by {billingData.nextDueDate}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Details */}
                                <div className="sf-card sf-card--flat sf-mb-6">
                                    <div className="sf-card__body sf-card__body--lg">
                                        <h3 className="sf-section-header">Account Details</h3>
                                        <div className="sf-detail-grid">
                                            <div>
                                                <p className="sf-detail-grid__label">Payment Terms</p>
                                                <p className="sf-detail-grid__value">{billingData.paymentTerms}</p>
                                            </div>
                                            <div>
                                                <p className="sf-detail-grid__label">Credit Used</p>
                                                <p className="sf-detail-grid__value sf-detail-grid__value--warning">{formatCurrency(billingData.usedCredit)}</p>
                                            </div>
                                            <div>
                                                <p className="sf-detail-grid__label">Compliance Status</p>
                                                <p className="sf-detail-grid__value sf-detail-grid__value--green">{billingData.complianceStatus}</p>
                                            </div>
                                        </div>

                                        <div className="sf-divider">
                                            <p className="sf-stat__meta-label">Credit Utilization</p>
                                            <div className="sf-progress">
                                                <div
                                                    className="sf-progress__bar sf-progress__bar--warning"
                                                    style={{ width: `${billingData.creditLimit > 0 ? ((billingData.usedCredit / billingData.creditLimit) * 100).toFixed(1) : 0}%` }}
                                                />
                                            </div>
                                            <p className="sf-fw-700 sf-text-dark" style={{ fontSize: '12px', marginTop: '10px' }}>
                                                {billingData.creditLimit > 0 ? ((billingData.usedCredit / billingData.creditLimit) * 100).toFixed(1) : 0}% of {formatCurrency(billingData.creditLimit)} limit
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Invoices */}
                                <div className="sf-card">
                                    <div className="sf-card__header sf-card__header--gradient">
                                        <h3 className="sf-card__section-title sf-mb-0">
                                            Recent Invoices
                                        </h3>
                                    </div>
                                    {invoices.length === 0 ? (
                                        <div className="sf-card__body">
                                            <EmptyState
                                                icon="fi-rs-receipt"
                                                title="No Invoices"
                                                text="No invoices found for your account."
                                            />
                                        </div>
                                    ) : (
                                    <div className="table-responsive">
                                        <table className="sf-table">
                                            <thead>
                                                <tr>
                                                    <th>Invoice</th>
                                                    <th>Supplier</th>
                                                    <th>Date</th>
                                                    <th className="text-right">Amount</th>
                                                    <th className="text-center">Status</th>
                                                    <th className="text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoices.map((invoice, index) => (
                                                    <tr key={invoice.docEntry || index}>
                                                        <td className="sf-table__cell--bold">
                                                            {invoice.docNum || invoice.id}
                                                        </td>
                                                        <td className="sf-table__cell--accent">
                                                            {invoice.cardName || invoice.supplier}
                                                        </td>
                                                        <td className="sf-table__cell--muted">
                                                            {invoice.date ? new Date(invoice.date).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                        <td className="text-right sf-table__cell--money">
                                                            {formatCurrency(invoice.amount)}
                                                        </td>
                                                        <td className="text-center">
                                                            <StatusBadge status={invoice.status.toLowerCase()} label={invoice.status} />
                                                        </td>
                                                        <td className="text-center">
                                                            <button className="sf-btn sf-btn--link">
                                                                Download
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    )}
                                </div>
                                </>)}
                            </div>
                        </div>
                    </div>
                </section>
            </Layout>
        </AuthGuard>
    );
};

export default ScheduledBilling;
