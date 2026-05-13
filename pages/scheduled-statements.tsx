import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../config/api";
import SEO from "../components/common/SEO";
import { pageSeoConfig } from "../config/seo";
import { formatCurrency, formatDate } from "../lib/formatters";
import { normalizeArray } from "../lib/normalizeApiResponse";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import AuthGuard from "../components/guards/AuthGuard";

const ScheduledStatements = () => {
    const { user, isAuthenticated } = useAuth();
    const [selectedFormat, setSelectedFormat] = useState("pdf");
    const seoConfig = pageSeoConfig['/scheduled-statements'];
    const [dateRange, setDateRange] = useState("all");
    const [statements, setStatements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Compute date range for API call
    const getDateRange = () => {
        const now = new Date();
        const end = now.toISOString();
        let start;
        switch (dateRange) {
            case "month":
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
                break;
            case "quarter":
                start = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString();
                break;
            case "year":
                start = new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString();
                break;
            default:
                start = '2000-01-01T00:00:00.000Z';
        }
        return { start, end };
    };

    // Re-fetch statements when profile switches or date range changes
    useEffect(() => {
        const cardCode = user?.customer?.cardCode;
        if (!isAuthenticated || user?.customer?.isVisitor || !cardCode) {
            setStatements([]);
            setLoading(false);
            return;
        }

        const fetchStatements = async () => {
            try {
                setLoading(true);
                setError(null);
                const { start, end } = getDateRange();
                const res = await ( apiClient as any).getStoreStatements(cardCode, 'Account', start, end);
                setStatements(normalizeArray(res));
            } catch (err: any) {
                setError(err?.message || 'Failed to load statements');
            } finally {
                setLoading(false);
            }
        };

        fetchStatements();
    }, [user?.customer?.cardCode, isAuthenticated, dateRange]);

    const handleDownload = (_statement: any, _format: any) => {
        // TODO: Implement download via API
    };

    return (
        <AuthGuard>
            <SEO {...seoConfig} />
            <Layout parent="Scheduled" sub="Statements" subChild="Account">
                <section className="page-content pt-150 pb-150">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                {/* Header */}
                                <div className="sf-card sf-card--flat sf-mb-6">
                                    <div className="sf-card__body sf-card__body--lg">
                                        <h2 className="sf-card__title sf-mb-2" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            📄 Account Statements
                                        </h2>
                                        <p className="sf-text-muted sf-mb-0">
                                            Download and view your detailed account statements for accounting and billing purposes
                                        </p>
                                    </div>
                                </div>

                                {/* Filter & Download Options */}
                                <div className="sf-card sf-card--flat sf-mb-6">
                                    <div className="sf-card__body sf-card__body--lg">
                                        <div className="row sf-mb-4">
                                            <div className="col-md-6">
                                                <h4 className="sf-label--sm sf-mb-2">Download Format</h4>
                                                <div className="sf-filter-tabs">
                                                    {[
                                                        { id: "pdf", label: "📄 PDF", ext: ".pdf" },
                                                        { id: "csv", label: "📊 CSV", ext: ".csv" },
                                                        { id: "excel", label: "📈 Excel", ext: ".xlsx" }
                                                    ].map((format: any) => (
                                                        <button
                                                            key={format.id}
                                                            onClick={() => setSelectedFormat(format.id)}
                                                            className={`sf-filter-tab ${selectedFormat === format.id ? 'sf-filter-tab--active' : ''}`}
                                                        >
                                                            {format.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <h4 className="sf-label--sm sf-mb-2">Date Range</h4>
                                                <select
                                                    value={dateRange}
                                                    onChange={(e) => setDateRange(e.target.value)}
                                                    className="sf-input"
                                                >
                                                    <option value="all">All Statements</option>
                                                    <option value="year">Last 12 Months</option>
                                                    <option value="quarter">Last 3 Months</option>
                                                    <option value="month">Last Month</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="sf-alert sf-alert--success">
                                            💡 Tip: Download statements in PDF for viewing or CSV/Excel for importing into accounting software
                                        </div>
                                    </div>
                                </div>

                                {/* Statements Grid */}
                                {loading ? (
                                    <LoadingSpinner text="Loading statements..." />
                                ) : error ? (
                                    <div className="sf-alert sf-alert--danger sf-mb-6">{error}</div>
                                ) : statements.length === 0 ? (
                                    <EmptyState
                                        icon="fi-rs-document"
                                        title="No Statements Found"
                                        text="No account statements are available for the selected period."
                                    />
                                ) : (
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                                    gap: "20px",
                                    marginBottom: "30px"
                                }}>
                                    {statements.map((statement, index) => {
                                        const debit = statement.Debit || statement.debit || 0;
                                        const credit = statement.Credit || statement.credit || 0;
                                        const balance = statement.Balance || statement.balance || 0;
                                        const ref = statement.Ref1 || statement.ref1 || statement.Reference || statement.reference || '';
                                        const memo = statement.Memo || statement.memo || statement.LineMemo || statement.lineMemo || '';
                                        const dueDate = statement.DueDate || statement.dueDate || '';
                                        const refDate = statement.RefDate || statement.refDate || statement.Date || statement.date || '';

                                        return (
                                        <div key={index} className="sf-card sf-card--hoverable">
                                            <div className="sf-card__header sf-card__header--purple" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <div>
                                                    <h4 className="sf-fw-700 sf-mb-0" style={{ color: "white", fontSize: "16px" }}>
                                                        {ref || `Entry #${index + 1}`}
                                                    </h4>
                                                    <p className="sf-mb-0" style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "12px" }}>
                                                        {refDate ? formatDate(refDate) : 'N/A'}
                                                        {dueDate ? ` — Due: ${formatDate(dueDate)}` : ''}
                                                    </p>
                                                </div>
                                                <span className="sf-btn sf-btn--ghost-white">
                                                    {balance === 0 ? 'Settled' : 'Open'}
                                                </span>
                                            </div>

                                            <div className="sf-card__body">
                                                {memo && (
                                                    <p className="sf-text-muted sf-mb-3" style={{ fontSize: "13px" }}>{memo}</p>
                                                )}

                                                {/* Summary Stats */}
                                                <div className="sf-detail-grid sf-mb-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                                                    <div>
                                                        <p className="sf-detail-grid__label">Debit</p>
                                                        <p className="sf-detail-grid__value">
                                                            {formatCurrency(debit)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="sf-detail-grid__label">Credit</p>
                                                        <p className="sf-detail-grid__value sf-detail-grid__value--purple">
                                                            {formatCurrency(credit)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Balance */}
                                                <div className="sf-alert sf-alert--info sf-mb-4" style={{ fontSize: "12px", padding: "12px" }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                        <span className="sf-text-muted">Balance:</span>
                                                        <span className="sf-fw-700 sf-text-green">{formatCurrency(balance)}</span>
                                                    </div>
                                                </div>

                                                {/* Download Button */}
                                                <button
                                                    onClick={() => handleDownload(statement, selectedFormat)}
                                                    className="sf-btn sf-btn--purple sf-btn--md sf-btn--full"
                                                >
                                                    Download {selectedFormat.toUpperCase()}
                                                </button>
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>
                                )}

                                {/* Additional Info */}
                                <div className="sf-alert sf-alert--success" style={{ padding: "30px", borderRadius: "15px" }}>
                                    <h3 className="sf-text-green sf-fw-700 sf-mb-4" style={{ fontSize: "16px" }}>
                                        📚 What's Included in Your Statement
                                    </h3>
                                    <div className="row">
                                        {[
                                            { title: "Order Details", text: "Complete list of all orders placed during the period" },
                                            { title: "Invoice Summary", text: "Summary of invoices with payment status" },
                                            { title: "Credit Transactions", text: "All credit usage and payments made" },
                                            { title: "Account Balance", text: "Opening and closing balances" }
                                        ].map((item, i) => (
                                            <div key={i} className="col-md-6" style={{ marginBottom: "15px" }}>
                                                <div style={{ display: "flex", gap: "10px" }}>
                                                    <span className="sf-btn sf-btn--green sf-btn--icon" style={{ width: "24px", height: "24px", fontSize: "12px", flexShrink: 0 }}>✓</span>
                                                    <div>
                                                        <p className="sf-text-green sf-fw-700 sf-mb-0" style={{ fontSize: "13px" }}>{item.title}</p>
                                                        <p className="sf-text-muted sf-mb-0" style={{ fontSize: "12px" }}>{item.text}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </Layout>
        </AuthGuard>
    );
};

export default ScheduledStatements;
