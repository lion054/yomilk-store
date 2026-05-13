/**
 * Pay Invoice Page
 * Matches original Angular route: /profile/pay-invoice
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';
import apiClient from '../../config/api';
import { toast } from 'react-toastify';
import { logger } from '../../lib/logger';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PayNowModal from '../../components/PayNowModal';
// Lazy load payment modals (code splitting optimization)
const InnBucksPaymentModal = lazy(() => import('../../components/InnBucksPaymentModal'));
const EcocashPaymentModal = lazy(() => import('../../components/EcocashPaymentModal'));

export default function PayInvoice() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { invoiceId } = router.query;

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('paynow');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push('/login');
    }
  }, [isAuthenticated, loading]);

  // Load invoice data
  useEffect(() => {
    if (!invoiceId) return;

    const loadInvoice = async () => {
      try {
        const data = await ( apiClient as any).getInvoiceDetail(invoiceId);
        setInvoice(data);
      } catch (error) {
        logger.error('Failed to load invoice:', error);
        toast.error('Could not load invoice details');
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [invoiceId]);

  if (!isAuthenticated) {
    return null; // Redirect handled by useEffect
  }

  if (loading || !invoice) {
    return (
      <Layout>
        <div className="container py-5">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  const amountDue = (invoice as any).docTotal || (invoice as any).amountDue || 0;
  const invoiceNumber = (invoice as any).docNum || (invoice as any).invoiceNumber || invoiceId;
  const invoiceDate = (invoice as any).docDate || (invoice as any).createdDate || '';

  const handlePayNow = () => {
    setPaymentMethod('paynow');
    setShowPaymentModal(true);
  };

  const handleInnBucks = () => {
    setPaymentMethod('innbucks');
    setShowPaymentModal(true);
  };

  const handleEcocash = () => {
    setPaymentMethod('ecocash');
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    toast.success('Payment initiated successfully!');
    setShowPaymentModal(false);
    setTimeout(() => {
      router.push('/profile/payments');
    }, 2000);
  };

  const handlePaymentError = (error: any) => {
    toast.error(error || 'Payment failed');
  };

  return (
    <Layout>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h3 className="card-title mb-0">
                  <i className="fi-rs-document me-2"></i>
                  Pay Invoice
                </h3>
              </div>

              <div className="card-body">
                {/* Invoice Details */}
                <div className="invoice-summary mb-4 p-3 bg-light rounded">
                  <div className="row mb-2">
                    <div className="col-6">
                      <span className="text-muted">Invoice #:</span>
                    </div>
                    <div className="col-6 text-end">
                      <strong>{invoiceNumber}</strong>
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-6">
                      <span className="text-muted">Date:</span>
                    </div>
                    <div className="col-6 text-end">
                      {new Date(invoiceDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-6">
                      <span className="text-muted">Status:</span>
                    </div>
                    <div className="col-6 text-end">
                      <span className="badge bg-warning">Pending Payment</span>
                    </div>
                  </div>

                  <hr />

                  <div className="row">
                    <div className="col-6">
                      <h5>Amount Due:</h5>
                    </div>
                    <div className="col-6 text-end">
                      <h4 className="text-primary mb-0">
                        ${Number(amountDue).toFixed(2)}
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <h5 className="mb-3">Select Payment Method</h5>

                <div className="payment-methods mb-4">
                  {/* PayNow Option */}
                  <button
                    className="payment-option btn btn-outline-primary w-100 mb-3 py-3 text-start"
                    onClick={handlePayNow}
                  >
                    <div className="d-flex align-items-center">
                      <div className="payment-icon me-3">
                        <i className="fi-rs-bank"></i>
                      </div>
                      <div>
                        <h6 className="mb-1">PayNow</h6>
                        <small className="text-muted">Instant bank transfer</small>
                      </div>
                      <div className="ms-auto">
                        <i className="fi-rs-arrow-small-right"></i>
                      </div>
                    </div>
                  </button>

                  {/* InnBucks Option */}
                  <button
                    className="payment-option btn btn-outline-primary w-100 mb-3 py-3 text-start"
                    onClick={handleInnBucks}
                  >
                    <div className="d-flex align-items-center">
                      <div className="payment-icon me-3">
                        <i className="fi-rs-dollar"></i>
                      </div>
                      <div>
                        <h6 className="mb-1">InnBucks</h6>
                        <small className="text-muted">Mobile money payment</small>
                      </div>
                      <div className="ms-auto">
                        <i className="fi-rs-arrow-small-right"></i>
                      </div>
                    </div>
                  </button>

                  {/* EcoCash Option */}
                  <button
                    className="payment-option btn btn-outline-primary w-100 mb-3 py-3 text-start"
                    onClick={handleEcocash}
                  >
                    <div className="d-flex align-items-center">
                      <div className="payment-icon me-3">
                        <i className="fi-rs-smartphone"></i>
                      </div>
                      <div>
                        <h6 className="mb-1">EcoCash</h6>
                        <small className="text-muted">Mobile money wallet</small>
                      </div>
                      <div className="ms-auto">
                        <i className="fi-rs-arrow-small-right"></i>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Back Button */}
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-light"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modals */}
      {showPaymentModal && paymentMethod === 'paynow' && (
        <PayNowModal
          amount={amountDue}
          invoiceId={invoiceId}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}

      {showPaymentModal && paymentMethod === 'innbucks' && (
        <Suspense fallback={null}>
          <InnBucksPaymentModal
            {...({
              amount: amountDue,
              invoiceId: invoiceId,
              isOpen: showPaymentModal,
              onClose: () => setShowPaymentModal(false),
              onSuccess: handlePaymentSuccess,
              onError: handlePaymentError
            } as any)}
          />
        </Suspense>
      )}

      {showPaymentModal && paymentMethod === 'ecocash' && (
        <Suspense fallback={null}>
          <EcocashPaymentModal
            {...({
              amount: amountDue,
              invoiceId: invoiceId,
              isOpen: showPaymentModal,
              onClose: () => setShowPaymentModal(false),
              onSuccess: handlePaymentSuccess,
              onError: handlePaymentError
            } as any)}
          />
        </Suspense>
      )}
    </Layout>
  );
}
