import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';
import AuthGuard from '../../components/guards/AuthGuard';
import Link from 'next/link';
import { toast } from 'react-toastify';
import apiClient from '../../config/api';
import { formatAmount, formatDate } from '../../lib/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { logger } from '../../lib/logger';

export default function Statements() {
  const { user } = useAuth();
  const [statements, setStatements] = useState<any>({
    journalLines: [],
    openingBalance: 0,
    closingBalance: 0,
    currency: 'USD'
  });
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (user?.customer?.cardCode) {
      fetchStatements();
    }
  }, [user?.customer?.cardCode]);

  const fetchStatements = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both date range');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date must be before end date');
      return;
    }

    try {
      setLoading(true);
      setError(false);
      const cardCode = user?.customer?.cardCode;
      if (!cardCode) {
        toast.error('User card code not found');
        return;
      }

      const response = await ( apiClient as any).getStoreStatements(
        cardCode,
        'local',
        `${startDate}T00:00:00.946Z`,
        `${endDate}T00:00:00.946Z`
      );

      const journalLinesRaw = Array.isArray(response?.journalLines) ? response.journalLines : [];
      const journalLines = [...journalLinesRaw].sort((a, b) => {
        const dateA = new Date(a.referenceDate || a.refDate || 0).getTime();
        const dateB = new Date(b.referenceDate || b.refDate || 0).getTime();
        if (dateA !== dateB) return dateB - dateA;
        return (b.transId || 0) - (a.transId || 0);
      });
      setStatements({
        journalLines,
        openingBalance: response?.openingBalance || 0,
        closingBalance: response?.closingBalance || 0,
        currency: response?.currency || 'USD'
      });
    } catch (error) {
      logger.error('Error loading statements:', error);
      setStatements({ journalLines: [], openingBalance: 0, closingBalance: 0, currency: 'USD' });
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const hasStatements = statements.journalLines && statements.journalLines.length > 0;

  return (
    <AuthGuard>
      <Layout parent="Account" sub="Statements">
        <div className="page-content pt-150 pb-150">
          <div className="container">
            <div className="row">
              <div className="col-lg-10 m-auto">
                {/* Header */}
                <div className="sf-card mb-40">
                  <div className="sf-card__header sf-card__header--green">
                    <div className="d-flex justify-content-between align-items-center">
                      <h3 className="sf-card__title sf-mb-0">
                        <i className="fi-rs-document sf-icon-mr"></i>
                        Statements
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

                {/* Filters */}
                <div className="sf-card mb-40">
                  <div className="sf-card__header sf-card__header--muted">
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: '20px' }}>
                        <div>
                          <label className="sf-label--sm" style={{ display: 'block', marginBottom: '6px' }}>Opening Balance</label>
                          <div className="sf-fw-700">{statements.currency} {formatAmount(statements.openingBalance)}</div>
                        </div>
                        <div>
                          <label className="sf-label--sm" style={{ display: 'block', marginBottom: '6px' }}>Closing Balance</label>
                          <div className="sf-fw-700">{statements.currency} {formatAmount(statements.closingBalance)}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div>
                          <label className="sf-label" style={{ marginBottom: '8px' }}>Start Date</label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="sf-input"
                          />
                        </div>
                        <div>
                          <label className="sf-label" style={{ marginBottom: '8px' }}>End Date</label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="sf-input"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={fetchStatements}
                          disabled={loading}
                          className="sf-btn sf-btn--green sf-btn--md"
                        >
                          {loading ? 'Loading...' : 'Apply'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="sf-card__body">
                    {loading ? (
                      <LoadingSpinner text="Fetching statements..." />
                    ) : error ? (
                      <EmptyState
                        icon="fi-rs-document"
                        title="No Statements"
                        text="You do not have any statements."
                      />
                    ) : hasStatements ? (
                      <div className="table-responsive">
                        <table className="sf-table">
                          <thead>
                            <tr>
                              <th>Memo</th>
                              <th>Transaction ID</th>
                              <th>Debit</th>
                              <th>Credit</th>
                              <th>Balance</th>
                              <th>Created</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="sf-table__cell--bold">Opening Balance</td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td>{statements.currency} {formatAmount(statements.openingBalance)}</td>
                              <td></td>
                            </tr>

                            {statements.journalLines.map((line: any, index: any) => (
                              <tr key={`${line.transId || 'line'}-${index}`}>
                                <td>{line.lineMemo || ''}</td>
                                <td>{line.transId || ''}</td>
                                <td>{statements.currency} {formatAmount(line.debit)}</td>
                                <td>{statements.currency} {formatAmount(line.credit)}</td>
                                <td>{statements.currency} {formatAmount(line.balance)}</td>
                                <td>{formatDate(line.referenceDate)}</td>
                              </tr>
                            ))}

                            <tr>
                              <td className="sf-table__cell--bold">Closing Balance</td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td>{statements.currency} {formatAmount(statements.closingBalance)}</td>
                              <td></td>
                            </tr>
                          </tbody>
                        </table>

                        <div className="sf-results-meta">
                          <strong>{statements.journalLines.length}</strong> results
                        </div>
                      </div>
                    ) : (
                      <EmptyState
                        icon="fi-rs-document"
                        title="No Statements"
                        text="You do not have any statements."
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
