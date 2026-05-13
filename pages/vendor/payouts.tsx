import { useState, useEffect } from 'react';
import VendorLayout from '../../components/vendor/VendorLayout';
import VendorGuard from '../../components/vendor/VendorGuard';
import { VendorAuthProvider, useVendorAuth } from '../../components/vendor/VendorAuthContext';
import apiClient from '../../config/api';
import { formatCurrency, formatDateShort as formatDate } from '../../lib/formatters';

function PayoutsContent() {
  const { vendor } = useVendorAuth();
  const [activeTab, setActiveTab] = useState('Payments');
  const [payments, setPayments] = useState<any[]>([]);
  const [statement, setStatement] = useState<any>(null);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loadingStatement, setLoadingStatement] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load payments
    try {
      const res = await ( apiClient as any).getVendorPayments(50, 1);
      const list = res?.values || res?.value || [];
      setPayments(list);
    } catch {}
    setLoadingPayments(false);

    // Load statement
    if (vendor?.cardCode) {
      try {
        const stmtRes = await ( apiClient as any).getVendorStatement(vendor.cardCode);
        setStatement(stmtRes);
      } catch {}
    }
    setLoadingStatement(false);
  };

  const totalPaid = payments.reduce((sum: any, p: any) => sum + (p.docTotal || p.cashSum || 0), 0);

  const getPaymentStatus = (p: any) => {
    if (p.cancelled === 'tYES' || p.cancelled === 'Y') return 'Cancelled';
    return 'Completed';
  };

  return (
    <VendorGuard>
      <VendorLayout title="Payouts" subtitle="Track your earnings and payment history"
        actions={<button className="vp-btn vp-btn-primary vp-btn-sm"><i className="fi-rs-download"></i> Download Statement</button>}
      >
        <div className="vp-stats-grid">
          <div className="vp-stat-card"><div className="vp-stat-icon green"><i className="fi-rs-wallet"></i></div><div className="vp-stat-value">{formatCurrency(totalPaid)}</div><div className="vp-stat-label">Total Payments</div></div>
          <div className="vp-stat-card"><div className="vp-stat-icon blue"><i className="fi-rs-money-check"></i></div><div className="vp-stat-value">{payments.length}</div><div className="vp-stat-label">Payment Count</div></div>
          <div className="vp-stat-card"><div className="vp-stat-icon orange"><i className="fi-rs-receipt"></i></div><div className="vp-stat-value">{payments.length > 0 ? formatCurrency(totalPaid / payments.length) : '$0.00'}</div><div className="vp-stat-label">Avg. Payment</div></div>
          <div className="vp-stat-card"><div className="vp-stat-icon green"><i className="fi-rs-chart-line-up"></i></div><div className="vp-stat-value">{payments.length > 0 ? formatCurrency(payments[0]?.docTotal || payments[0]?.cashSum || 0) : '$0.00'}</div><div className="vp-stat-label">Last Payment</div></div>
        </div>

        <div className="vp-tabs">
          {['Payments', 'Statement'].map((tab: any) => (
            <button key={tab} className={`vp-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
          ))}
        </div>

        {activeTab === 'Payments' && (
          <div className="vp-card">
            <div className="vp-card-header"><h3 className="vp-card-title">Payment History</h3></div>
            <div className="vp-table-wrap">
              <table className="vp-table">
                <thead><tr><th>Doc #</th><th>Amount</th><th>Payment Method</th><th>Date</th><th>Reference</th><th>Status</th></tr></thead>
                <tbody>
                  {loadingPayments ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Loading payments...</td></tr>
                  ) : payments.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No payments found</td></tr>
                  ) : payments.map((p: any) => {
                    const status = getPaymentStatus(p);
                    return (
                      <tr key={p.docEntry || p.docNum}>
                        <td><strong>#{p.docNum || p.docEntry}</strong></td>
                        <td><strong>{formatCurrency(p.docTotal || p.cashSum || 0)}</strong></td>
                        <td>{p.transferAccount || p.cashAccount || p.paymentMethod || '-'}</td>
                        <td>{formatDate(p.docDate)}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.reference1 || p.reference2 || '-'}</td>
                        <td><span className={`vp-badge ${status === 'Cancelled' ? 'vp-badge-red' : 'vp-badge-green'}`}><span className="vp-badge-dot"></span> {status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Statement' && (
          <div className="vp-card">
            <div className="vp-card-header"><h3 className="vp-card-title">Vendor Statement</h3></div>
            {loadingStatement ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Loading statement...</div>
            ) : !statement ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No statement data available</div>
            ) : (
              <div>
                {statement.openingBalance != null && (
                  <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
                    <div style={{ padding: 16, background: '#f7f8fa', borderRadius: 12, flex: 1, minWidth: 160 }}>
                      <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, marginBottom: 4 }}>OPENING BALANCE</div>
                      <div style={{ fontWeight: 800, fontSize: 20 }}>{formatCurrency(statement.openingBalance)}</div>
                    </div>
                    <div style={{ padding: 16, background: '#f7f8fa', borderRadius: 12, flex: 1, minWidth: 160 }}>
                      <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, marginBottom: 4 }}>CLOSING BALANCE</div>
                      <div style={{ fontWeight: 800, fontSize: 20 }}>{formatCurrency(statement.closingBalance)}</div>
                    </div>
                  </div>
                )}
                {Array.isArray(statement.transactions || statement.lines) && (
                  <div className="vp-table-wrap">
                    <table className="vp-table">
                      <thead><tr><th>Date</th><th>Reference</th><th>Description</th><th>Debit</th><th>Credit</th><th>Balance</th></tr></thead>
                      <tbody>
                        {(statement.transactions || statement.lines).map((t: any, i: any) => (
                          <tr key={i}>
                            <td>{formatDate(t.date || t.dueDate)}</td>
                            <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{t.reference || t.ref1 || '-'}</td>
                            <td>{t.description || t.memo || t.remarks || '-'}</td>
                            <td>{t.debit ? formatCurrency(t.debit) : '-'}</td>
                            <td style={{ color: '#1a5c38' }}>{t.credit ? formatCurrency(t.credit) : '-'}</td>
                            <td><strong>{formatCurrency(t.balance || t.cumulativeBalance || 0)}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </VendorLayout>
    </VendorGuard>
  );
}

export default function VendorPayouts() {
  return <VendorAuthProvider><PayoutsContent /></VendorAuthProvider>;
}
