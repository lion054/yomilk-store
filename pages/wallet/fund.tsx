import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/layout/Layout';
import paymentService from '../../services/paymentService';
import PhoneInput from '../../components/PhoneInput';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { logger } from '../../lib/logger';

function FundWallet() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [currency, setCurrency] = useState('USD');
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('InnBucks');
    const [phoneNumber, setPhoneNumber] = useState('');

    // InnBucks state
    const [innbucksCode, setInnbucksCode] = useState('');
    const [innbucksQRCode, setInnbucksQRCode] = useState('');
    const [showInnbucksModal, setShowInnbucksModal] = useState(false);
    const [pollingStatus, setPollingStatus] = useState('');
    const cancelPollingRef = useRef<any>(null);

    const quickAmounts = [10, 25, 50, 100, 500, 1000];

    useEffect(() => {
        if (!isAuthenticated || !user?.customer || user.customer.isVisitor) {
            toast.error('Please log in to fund your wallet');
            router.push('/login');
            return;
        }

        setCurrency(user.customer.currency || 'USD');
        setPhoneNumber(user.customer.phone1 || '');

        return () => {
            // Cleanup: cancel polling if component unmounts
            if (cancelPollingRef.current) {
                cancelPollingRef.current();
            }
        };
    }, [isAuthenticated, user, router]);

    const validateForm = () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid amount');
            return false;
        }

        if (paymentMethod === 'InnBucks' && !phoneNumber) {
            toast.error('Please enter your phone number for InnBucks');
            return false;
        }

        if (paymentMethod === 'Ecocash' && !phoneNumber) {
            toast.error('Please enter your phone number for Ecocash');
            return false;
        }

        return true;
    };

    const handleFundWallet = async (e: any) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            // Build payload EXACTLY matching Angular structure
            const payload = {
                cardCode: (user as any)?.customer?.cardCode,
                docCurrency: currency,
                paymentReference: "",
                paymentCode: "",
                transferSum: parseFloat(amount),
                paymentPhoneNumber: phoneNumber || (user as any)?.customer?.phone1,
                paymentFullName: (user as any)?.userName,
                email: (user as any)?.userCode,
                returnUrl: typeof window !== 'undefined' ? `${window.location.origin}/wallet` : '',
                paymentMethod: paymentMethod,
                paymentInvoices: []
            };

            if (paymentMethod === 'InnBucks') {
                await handleInnBucksPayment(payload);
            } else if (paymentMethod === 'PayNow') {
                await handlePayNowPayment(payload);
            } else if (paymentMethod === 'Ecocash') {
                await handleEcocashPayment(payload);
            }
        } catch (error) {
            logger.error('Error funding wallet:', error);
            toast.error('Failed to process payment. Please try again.');
            setLoading(false);
        }
    };

    const handleInnBucksPayment = async (payload: any) => {
        const result = await paymentService.payInvoiceInnBucks(payload);

        if (result.success) {
            const { code, qrCode, payment } = result.data;
            setInnbucksCode(code);
            setInnbucksQRCode(qrCode); // Note: Angular uses qrCode, not qrCodeBase64
            setShowInnbucksModal(true);
            setLoading(false);

            // Start polling for transaction status
            setPollingStatus('Waiting for payment...');

            // Store payment reference and code for later use
            const pollingPayload = {
                reference: payment?.paymentReference || payload.paymentReference,
                code: code
            };

            cancelPollingRef.current = paymentService.pollInnBucksStatus(
                pollingPayload,
                () => handleInnBucksSuccess(pollingPayload, payload),
                handleInnBucksError,
                handleInnBucksTimeout
            );
        } else {
            toast.error(result.error || 'Failed to initiate InnBucks payment');
            setLoading(false);
        }
    };

    const handleInnBucksSuccess = async (_pollingPayload: any, originalPayload: any) => {
        setPollingStatus('Payment claimed! Creating incoming payment...');

        // Create incoming payment after InnBucks is claimed (matching Angular flow)
        try {
            const result = await paymentService.createIncomingPayment(originalPayload);

            if (result.success) {
                setPollingStatus('Payment successful!');
                toast.success('Payment confirmed! Your wallet has been funded.');

                setTimeout(() => {
                    setShowInnbucksModal(false);
                    router.push('/wallet');
                }, 2000);
            } else {
                throw new Error(result.error || 'Failed to create incoming payment');
            }
        } catch (error) {
            logger.error('Error creating incoming payment:', error);
            setPollingStatus('Payment claimed but failed to update wallet');
            toast.error('Payment received but wallet update failed. Please contact support.');
        }
    };

    const handleInnBucksError = (error: any) => {
        logger.error('InnBucks polling error:', error);
        setPollingStatus('Error checking payment status');
    };

    const handleInnBucksTimeout = () => {
        setPollingStatus('Payment verification timed out');
        toast.warning('Payment verification timed out. Please check your payment history.');
    };

    const handlePayNowPayment = async (payload: any) => {
        const result = await paymentService.payInvoicePayNow(payload);

        if (result.success) {
            // Save order to localStorage for tracking (matching Angular)
            localStorage.setItem('activeOrder', JSON.stringify(result.data));
            localStorage.setItem('accountFunding', JSON.stringify(true));

            toast.success('Your payment request has been created. Redirecting to PayNow...');
            setLoading(false);

            // PayNow redirect link is already opened in payInvoicePayNow
            // User can close this page or wait to be redirected back
            setTimeout(() => {
                router.push('/wallet');
            }, 2000);
        } else {
            toast.error(result.error || 'Failed to initiate PayNow payment');
            setLoading(false);
        }
    };

    const handleEcocashPayment = async (payload: any) => {
        const result = await paymentService.createIncomingPayment(payload);

        if (result.success) {
            toast.success('Payment request sent! Please approve on your phone.');
            setLoading(false);

            setTimeout(() => {
                router.push('/wallet');
            }, 2000);
        } else {
            toast.error(result.error || 'Failed to initiate Ecocash payment');
            setLoading(false);
        }
    };

    const closeInnbucksModal = () => {
        if (cancelPollingRef.current) {
            cancelPollingRef.current();
        }
        setShowInnbucksModal(false);
        setInnbucksCode('');
        setInnbucksQRCode('');
        setPollingStatus('');
    };

    const paymentMethods = [
        { value: 'InnBucks', label: 'InnBucks', icon: '/assets/images/payment/innbucks.jpg' },
        { value: 'PayNow', label: 'PayNow', icon: '/assets/images/payment/paynow.png' },
        { value: 'Ecocash', label: 'Ecocash', icon: '/assets/images/payment/ecocash-logo.jpg' }
    ];

    return (
        <>
            <Head>
                <link rel="stylesheet" href="/assets/css/wallet-modern.css" />
            </Head>
            <Layout parent="Home" sub="Wallet" subChild="Fund Wallet">
                <div className="page-content pt-50 pb-50">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-8 m-auto">
                                <div className="fund-wallet-container">
                                    {/* Header */}
                                    <div className="fund-wallet-header">
                                        <button
                                            className="btn-back"
                                            onClick={() => router.push('/wallet')}
                                        >
                                            <i className="fi-rs-angle-left"></i>
                                            Back to Wallet
                                        </button>
                                        <h2 className="fund-wallet-title">Fund Wallet</h2>
                                        <p className="fund-wallet-subtitle">
                                            Add money to your wallet using your preferred payment method
                                        </p>
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={handleFundWallet} className="fund-wallet-form">
                                        {/* Amount Section */}
                                        <div className="form-section">
                                            <label className="form-label">Enter Amount ({currency})</label>
                                            <div className="amount-input-wrapper">
                                                <span className="currency-symbol">{currency === 'USD' ? '$' : currency}</span>
                                                <input
                                                    type="number"
                                                    className="amount-input"
                                                    placeholder="0.00"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    step="0.01"
                                                    min="0"
                                                    required
                                                />
                                            </div>

                                            {/* Quick Amount Buttons */}
                                            <div className="quick-amounts">
                                                <p className="quick-amounts-label">Quick Add:</p>
                                                <div className="quick-amounts-grid">
                                                    {quickAmounts.map((quickAmount: any) => (
                                                        <button
                                                            key={quickAmount}
                                                            type="button"
                                                            className={`btn-quick-amount ${
                                                                amount === quickAmount.toString() ? 'active' : ''
                                                            }`}
                                                            onClick={() => setAmount(quickAmount.toString())}
                                                        >
                                                            {currency === 'USD' ? '$' : ''}{quickAmount}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment Method Section */}
                                        <div className="form-section">
                                            <label className="form-label">Select Payment Method</label>
                                            <div className="payment-methods-grid">
                                                {paymentMethods.map((method: any) => (
                                                    <div
                                                        key={method.value}
                                                        className={`payment-method-card ${
                                                            paymentMethod === method.value ? 'selected' : ''
                                                        }`}
                                                        onClick={() => setPaymentMethod(method.value)}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="paymentMethod"
                                                            value={method.value}
                                                            checked={paymentMethod === method.value}
                                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                                            className="payment-method-radio"
                                                        />
                                                        <img
                                                            src={method.icon}
                                                            alt={method.label}
                                                            className="payment-method-icon"
                                                        />
                                                        <span className="payment-method-label">{method.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Phone Number for InnBucks and Ecocash */}
                                        {(paymentMethod === 'InnBucks' || paymentMethod === 'Ecocash') && (
                                            <div className="form-section">
                                                <PhoneInput
                                                    value={phoneNumber}
                                                    onChange={setPhoneNumber}
                                                    label="Phone Number"
                                                    required={paymentMethod === 'Ecocash'}
                                                />
                                                {paymentMethod === 'Ecocash' && (
                                                    <small className="sf-text-muted" style={{ marginTop: '8px', display: 'block' }}>
                                                        You will receive a prompt on your phone to complete the payment
                                                    </small>
                                                )}
                                            </div>
                                        )}

                                        {/* Security Info */}
                                        <div className="security-info">
                                            <i className="fi-rs-shield"></i>
                                            <span>Your transaction is secure and encrypted</span>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-submit"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner"></span>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fi-rs-wallet mr-10"></i>
                                                    Fund Wallet
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* InnBucks Modal */}
                {showInnbucksModal && (
                    <div className="innbucks-modal-overlay" onClick={closeInnbucksModal}>
                        <div className="innbucks-modal" onClick={(e) => e.stopPropagation()}>
                            <button className="modal-close" onClick={closeInnbucksModal}>
                                <i className="fi-rs-cross"></i>
                            </button>

                            <div className="modal-content">
                                <h3 className="modal-title">Complete Payment with InnBucks</h3>

                                {innbucksQRCode && (
                                    <div className="qr-code-section">
                                        <p className="qr-instructions">Scan QR code with InnBucks app</p>
                                        <img
                                            src={`data:image/png;base64,${innbucksQRCode}`}
                                            alt="InnBucks QR Code"
                                            className="qr-code-image"
                                        />
                                    </div>
                                )}

                                <div className="payment-code-section">
                                    <p className="code-label">Or use payment code:</p>
                                    <div className="payment-code">
                                        <span className="code-value">{innbucksCode}</span>
                                        <button
                                            className="btn-copy"
                                            onClick={() => {
                                                navigator.clipboard.writeText(innbucksCode);
                                                toast.success('Code copied to clipboard');
                                            }}
                                        >
                                            <i className="fi-rs-copy"></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="polling-status">
                                    <div className="status-indicator">
                                        <div className="status-spinner"></div>
                                    </div>
                                    <p className="status-text">{pollingStatus}</p>
                                </div>

                                <div className="modal-instructions">
                                    <h4>How to pay:</h4>
                                    <ol>
                                        <li>Open your InnBucks mobile app</li>
                                        <li>Scan the QR code or enter the payment code</li>
                                        <li>Confirm the payment on your phone</li>
                                        <li>Wait for confirmation (automatic)</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Layout>
        </>
    );
}

export default FundWallet;
