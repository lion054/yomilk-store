import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import AuthGuard from '../../components/guards/AuthGuard';
import Link from 'next/link';
import { toast } from 'react-toastify';
import apiClient from '../../config/api';
import { formatCurrency, formatDateTime } from '../../lib/formatters';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { logger } from '../../lib/logger';

export default function Payments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        const response = await ( apiClient as any).getIncomingPayments(pageSize, currentPage);
        const values = response.values || response.data || [];
        const sorted = [...values].sort((a, b) => {
          const dateA = new Date(a.DueDate || a.DocDate || a.docDate || 0).getTime();
          const dateB = new Date(b.DueDate || b.DocDate || b.docDate || 0).getTime();
          if (dateA !== dateB) return dateB - dateA;
          return (b.DocNum || b.docNum || 0) - (a.DocNum || a.docNum || 0);
        });
        setPayments(sorted);
        setTotalPages(response.pageCount || 1);
      } catch (error) {
        logger.error('Error loading payments:', error);
        toast.error('Failed to load payments');
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [currentPage]);

  return (
    <AuthGuard>
      <Layout parent="Account" sub="Payments">
        <div className="page-content pt-150 pb-150">
          <div className="container">
            <div className="row">
              <div className="col-lg-10 m-auto">
                {/* Header */}
                <div className="sf-card mb-40">
                  <div className="sf-card__header sf-card__header--green">
                    <div className="d-flex justify-content-between align-items-center">
                      <h3 className="sf-card__title sf-mb-0">
                        <i className="fi-rs-money sf-icon-mr"></i>
                        Incoming Payments
                      </h3>
                      <Link href="/profile">
                        <button className="sf-btn sf-btn--ghost-white">
                          <i className="fi-rs-arrow-left sf-icon-mr"></i>
                          Back to Profile
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Payments Table */}
                <div className="sf-card">
                  <div className="sf-card__body">
                    {loading ? (
                      <LoadingSpinner text="Loading payments..." />
                    ) : payments.length > 0 ? (
                      <>
                        <div className="table-responsive">
                          <table className="sf-table">
                            <thead>
                              <tr>
                                <th>Transaction ID</th>
                                <th>Total Sum</th>
                                <th>Date</th>
                                <th>Reference</th>
                              </tr>
                            </thead>
                            <tbody>
                              {payments.map((payment: any) => (
                                <tr key={payment.DocEntry || payment.docEntry}>
                                  <td>
                                    {payment.DocNum || payment.docNum || payment.DocEntry || payment.docEntry}
                                  </td>
                                  <td className="sf-table__cell--money">
                                    {formatCurrency(payment.TransferSum || payment.DocTotal || payment.docTotal || 0)}
                                  </td>
                                  <td>
                                    {formatDateTime(payment.DueDate || payment.docDate)}
                                  </td>
                                  <td className="sf-table__cell--muted">
                                    {payment.TransferReference || payment.reference || '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="sf-results-meta">
                          <strong>{payments.length}</strong> results
                          <strong style={{ marginLeft: '8px' }}>Page {currentPage} of {totalPages || 1}</strong>
                        </div>

                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={setCurrentPage}
                        />
                      </>
                    ) : (
                      <EmptyState
                        icon="fi-rs-money"
                        title="No Incoming Payments"
                        text="You don't have any incoming payments recorded yet."
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}
