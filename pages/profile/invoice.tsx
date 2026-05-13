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

export default function Invoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);
        const response = await ( apiClient as any).getStoreInvoices(pageSize, currentPage);

        if (!response) {
          logger.warn('[Invoices] API returned null response');
          toast.error('Failed to load invoices - no response from server');
          setInvoices([]);
          setTotalPages(1);
          return;
        }

        const values = response.values || response.data || [];

        if (!Array.isArray(values)) {
          logger.error('[Invoices] Response values is not an array:', values);
          toast.error('Invalid invoice response format');
          setInvoices([]);
          setTotalPages(1);
          return;
        }

        const sorted = [...values].sort((a, b) => {
          const dateA = new Date(a.DocDate || a.docDate || 0).getTime();
          const dateB = new Date(b.DocDate || b.docDate || 0).getTime();
          if (dateA !== dateB) return dateB - dateA;
          return (b.DocNum || b.docNum || 0) - (a.DocNum || a.docNum || 0);
        });

        setInvoices(sorted);
        setTotalPages(response.pageCount || response.PageCount || 1);

      } catch (error: any) {
        logger.error('[Invoices] Error loading invoices:', {
          message: error?.message,
          status: error?.status,
          fullError: error
        });
        toast.error(error?.message || 'Failed to load invoices');
        setInvoices([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, [currentPage]);

  return (
    <AuthGuard>
      <Layout parent="Account" sub="Invoices">
        <div className="page-content pt-150 pb-150">
          <div className="container">
            <div className="row">
              <div className="col-lg-10 m-auto">
                {/* Header */}
                <div className="sf-card mb-40">
                  <div className="sf-card__header sf-card__header--green">
                    <div className="d-flex justify-content-between align-items-center">
                      <h3 className="sf-card__title sf-mb-0">
                        <i className="fi-rs-shopping-bag sf-icon-mr"></i>
                        Your Invoices
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

                {/* Invoices Table */}
                <div className="sf-card">
                  <div className="sf-card__body">
                    {loading ? (
                      <LoadingSpinner text="Loading invoices..." />
                    ) : invoices.length > 0 ? (
                      <>
                        <div className="table-responsive">
                          <table className="sf-table">
                            <thead>
                              <tr>
                                <th>Invoice #</th>
                                <th>Amount</th>
                                <th>Due</th>
                                <th>Created</th>
                                <th className="text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {invoices.map((invoice: any) => (
                                <tr key={invoice.DocEntry || invoice.docEntry}>
                                  <td className="sf-table__cell--primary">
                                    #{invoice.DocNum || invoice.docNum || invoice.DocEntry || invoice.docEntry}
                                  </td>
                                  <td className="sf-table__cell--bold">
                                    {formatCurrency(invoice.DocTotalSys || invoice.DocTotal || invoice.docTotal)}
                                  </td>
                                  <td>
                                    {formatDateTime(invoice.DocDueDate || invoice.docDueDate)}
                                  </td>
                                  <td>
                                    {formatDateTime(invoice.DocDate || invoice.docDate)}
                                  </td>
                                  <td className="text-center">
                                    <Link href={`/profile/invoice/${invoice.DocEntry || invoice.docEntry}`}>
                                      <button className="sf-btn sf-btn--green sf-btn--sm">
                                        View
                                      </button>
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="sf-results-meta">
                          <strong>{invoices.length}</strong> results
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
                        icon="fi-rs-inbox"
                        title="No Invoices Found"
                        text="You don't have any invoices yet."
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
