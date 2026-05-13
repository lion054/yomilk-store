import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../components/layout/Layout';
import apiClient from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import SEO from '../components/common/SEO';
import { pageSeoConfig } from '../config/seo';
import { formatDateTime } from '../lib/formatters';
import { normalizeArray } from '../lib/normalizeApiResponse';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { logger } from '../lib/logger';

function Wallet() {
    const router = useRouter();
    const { user, isAuthenticated, handleProfileFetchError } = useAuth();
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const [currency, setCurrency] = useState('USD');
    const [incomingPayments, setIncomingPayments] = useState<any[]>([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        if (!isAuthenticated || !user?.customer || user.customer.isVisitor) {
            toast.error('Please log in to view your wallet');
            router.push('/login');
            return;
        }
        setCurrency(user.customer.currency || 'USD');
    }, [isAuthenticated, user, router]);

    useEffect(() => {
        if (user?.customer?.cardCode) {
            fetchBusinessPartnerBalance();
            fetchIncomingPayments();
        }
    }, [user, currentPage, pageSize]);

    const fetchBusinessPartnerBalance = async () => {
        try {
            const response = await ( apiClient as any).getBusinessPartnerDetails((user as any)?.customer?.cardCode);
            if (response) {
                setBalance(response.currentAccountBalance || 0);
            }
        } catch (error: any) {
            logger.error('Error fetching balance:', error);

            // Check if this is an authentication error
            if (error?.status === 401 || error?.status === 403 || (error?.message && (error.message.includes('unauthorized') || error.message.includes('expired')))) {
                logger.warn('Session expired while fetching balance - logging out');
                handleProfileFetchError();
                return;
            }

            toast.error('Failed to load account balance');
        }
    };

    const fetchIncomingPayments = async () => {
        setLoading(true);
        try {
            const response = await ( apiClient as any).getIncomingPayments(pageSize, currentPage);

            if (response) {
                let payments = normalizeArray(response);

                // Filter out empty/invalid payments
                payments = payments.filter((p: any) => p && (p.DocNum || p.docNum || p.docEntry || p.DocEntry));

                // Sort by DocNum in descending order
                payments.sort((a: any, b: any) => {
                    const aNum = b.DocNum || b.docNum || 0;
                    const bNum = a.DocNum || a.docNum || 0;
                    return aNum - bNum;
                });

                setIncomingPayments(payments);
                setTotalRecords(response.recordCount || response.total || payments.length || 0);
                setTotalPages(response.pageCount || Math.ceil((response.recordCount || payments.length || 0) / pageSize) || 1);
            } else {
                setIncomingPayments([]);
            }
        } catch (error: any) {
            logger.error('Error fetching incoming payments:', error);

            // Check if this is an authentication error
            if (error?.status === 401 || error?.status === 403 || (error?.message && (error.message.includes('unauthorized') || error.message.includes('expired')))) {
                console.warn('Session expired while fetching payments - logging out');
                handleProfileFetchError();
                setIncomingPayments([]);
            } else {
                toast.error('Failed to load payment history');
                setIncomingPayments([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: any) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handlePageSizeChange = (e: any) => {
        setPageSize(parseInt(e.target.value));
        setCurrentPage(1);
    };

    const formatLocalCurrency = (amount: any) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount || 0);
    };


    const walletSeoConfig = pageSeoConfig['/wallet'];

    return (
        <>
            <SEO {...walletSeoConfig} noindex={true} />
            <Head>
                <link rel="stylesheet" href="/assets/css/wallet-modern.css" />
            </Head>
            <Layout parent="Home" sub="Pages" subChild="Wallet">
                <div className="page-content pt-50 pb-50">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12 m-auto">
                                {/* Wallet Header */}
                                <div className="wallet-header">
                                    <div className="wallet-balance-card">
                                        <div className="balance-content">
                                            <p className="balance-label">Available Balance</p>
                                            <h2 className="balance-amount">{formatLocalCurrency(balance)}</h2>
                                            <p className="balance-currency">{currency}</p>
                                        </div>
                                        <div className="balance-actions">
                                            <button
                                                className="btn btn-primary btn-fund-wallet"
                                                onClick={() => router.push('/wallet/fund')}
                                            >
                                                <i className="fi-rs-wallet mr-10"></i>
                                                Fund Wallet
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment History Section */}
                                <div className="wallet-history-section">
                                    <div className="section-header">
                                        <h3 className="section-title">Payment History</h3>
                                        <div className="section-controls">
                                            <label className="page-size-label">
                                                Show:
                                                <select
                                                    className="page-size-select"
                                                    value={pageSize}
                                                    onChange={handlePageSizeChange}
                                                >
                                                    <option value="10">10</option>
                                                    <option value="20">20</option>
                                                    <option value="50">50</option>
                                                    <option value="100">100</option>
                                                </select>
                                            </label>
                                        </div>
                                    </div>

                                    {loading ? (
                                        <LoadingSpinner text="Loading payment history..." />
                                    ) : incomingPayments.length === 0 ? (
                                        <div className="sf-card">
                                            <div className="sf-card__body">
                                                <EmptyState
                                                    icon="fi-rs-wallet"
                                                    title="No Payment History"
                                                    text="You haven't made any payments yet. Fund your wallet to get started."
                                                />
                                                <div className="sf-flex-end" style={{ justifyContent: 'center', marginTop: '16px' }}>
                                                    <button
                                                        className="sf-btn sf-btn--green sf-btn--md"
                                                        onClick={() => router.push('/wallet/fund')}
                                                    >
                                                        Fund Wallet
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="table-responsive">
                                                <table className="wallet-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Transaction ID</th>
                                                            <th>Total Sum</th>
                                                            <th>Date</th>
                                                            <th>Reference</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {incomingPayments.map((payment, index) => {
                                                            // Handle different field name variations
                                                            const docNum = payment.DocNum || payment.docNum || payment.docEntry || payment.DocEntry || '-';
                                                            const amount = payment.TransferSum || payment.transferSum || payment.SumApplied || payment.sumApplied || 0;
                                                            const docCurrency = payment.DocCurrency || payment.docCurrency || currency;
                                                            const date = payment.DueDate || payment.dueDate || payment.DocDate || payment.docDate || '-';
                                                            const reference = payment.TransferReference || payment.transferReference || payment.PaymentReference || payment.paymentReference || '-';

                                                            return (
                                                                <tr key={index}>
                                                                    <td className="reference-cell">
                                                                        <span className="reference-badge">
                                                                            {docNum}
                                                                        </span>
                                                                    </td>
                                                                    <td className="amount-cell">
                                                                        <strong>{docCurrency} {(amount || 0).toFixed(2)}</strong>
                                                                    </td>
                                                                    <td>{formatDateTime(date)}</td>
                                                                    <td className="remarks-cell">
                                                                        {reference}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Pagination */}
                                            {totalPages > 1 && (
                                                <div className="wallet-pagination">
                                                    <div className="pagination-info">
                                                        Page {currentPage} of {totalPages} | Showing {((currentPage - 1) * pageSize) + 1} to{' '}
                                                        {Math.min(currentPage * pageSize, totalRecords)} of{' '}
                                                        {totalRecords} results
                                                    </div>
                                                    <div className="pagination-controls">
                                                        <button
                                                            className="btn btn-pagination"
                                                            onClick={() => handlePageChange(currentPage - 1)}
                                                            disabled={currentPage === 1}
                                                        >
                                                            <i className="fi-rs-angle-left"></i>
                                                            Previous
                                                        </button>
                                                        <div className="page-numbers">
                                                            {[...Array(totalPages)].map((_, idx) => {
                                                                const pageNum = idx + 1;
                                                                // Show first, last, current, and adjacent pages
                                                                if (
                                                                    pageNum === 1 ||
                                                                    pageNum === totalPages ||
                                                                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                                                ) {
                                                                    return (
                                                                        <button
                                                                            key={pageNum}
                                                                            className={`btn btn-page-number ${
                                                                                currentPage === pageNum ? 'active' : ''
                                                                            }`}
                                                                            onClick={() => handlePageChange(pageNum)}
                                                                        >
                                                                            {pageNum}
                                                                        </button>
                                                                    );
                                                                } else if (
                                                                    pageNum === currentPage - 2 ||
                                                                    pageNum === currentPage + 2
                                                                ) {
                                                                    return <span key={pageNum} className="pagination-ellipsis">...</span>;
                                                                }
                                                                return null;
                                                            })}
                                                        </div>
                                                        <button
                                                            className="btn btn-pagination"
                                                            onClick={() => handlePageChange(currentPage + 1)}
                                                            disabled={currentPage === totalPages}
                                                        >
                                                            Next
                                                            <i className="fi-rs-angle-right"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
}

export default Wallet;
