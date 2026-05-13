import Layout from "../components/layout/Layout";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, lazy, Suspense } from "react";
import { useRouter } from "next/router";
import { useAuth, useCart } from "../hooks";
import { useAuthModal } from "../contexts/AuthModalContext";
import { useInnBucksPayment } from "../hooks/useInnBucksPayment";
import { useCheckoutForm } from "../hooks/useCheckoutForm";
import { useCheckoutPayment } from "../hooks/useCheckoutPayment";
// Lazy load payment modals (code splitting optimization)
const InnBucksPaymentModal = lazy(() => import("../components/InnBucksPaymentModal"));
const EcocashPaymentModal = lazy(() => import("../components/EcocashPaymentModal"));
const MobileOrderSummary = lazy(() => import("../components/checkout/MobileOrderSummary"));
import PhoneInput from "../components/PhoneInput";
import { toast } from "react-toastify";
import { getVendorFromProductCode } from "../lib/vendorMapping";
import { formatCurrency } from "../lib/formatters";
import { getProductImageUrl } from "../lib/imageProxy";
import ReviewCart from "../components/ReviewCart";
import PaymentModalErrorBoundary from "../components/PaymentModalErrorBoundary";
import paymentService from "../services/paymentService";

const Checkout = () => {
    const router = useRouter();
    const { cart: cartItems, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const { openAuthModal } = useAuthModal();

    const itemsByVendor = useMemo(() => {
        const grouped: any = {};
        cartItems.forEach((item: any) => {
            const vendor = getVendorFromProductCode(item.itemCode);
            if (!grouped[vendor]) grouped[vendor] = [];
            grouped[vendor].push({ ...item, vendor });
        });
        return grouped;
    }, [cartItems]);

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [deliveryType, setDeliveryType] = useState("asap");
    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledTimeSlot, setScheduledTimeSlot] = useState("");
    const [availableTimeSlots, setAvailableTimeSlots] = useState<any[]>([]);
    const [minDeliveryDate, setMinDeliveryDate] = useState("");
    const [maxDeliveryDate, setMaxDeliveryDate] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [showPaymentPhone, setShowPaymentPhone] = useState(false);

    const { isPolling, innbucksCode, innbucksQR, pollingAttempt, pollingError, startInnBucksPolling, stopInnBucksPolling, getTimeRemaining } = useInnBucksPayment();
    const [showInnBucksModal, setShowInnBucksModal] = useState(false);
    const [showEcocashModal, setShowEcocashModal] = useState(false);
    const ecocashCartIdRef = useRef(null);

    const normalizePaymentMethod = (method: string): string => {
        if (method === "Pay on Account") return "Account";
        if (method === "COD") return "CashOnDelivery";
        return method;
    };

    const {
        formData,
        separateShipping,
        countries,
        billCities,
        billSuburbs,
        shipCities,
        shipSuburbs,
        updateBillCities,
        updateBillSuburbs,
        updateShipCities,
        updateShipSuburbs,
        onSeparateShippingChange,
        handleChange,
        normalizePhone,
        validateStep1,
        validateStep2,
        validateStep3,
        zonesError,
    } = useCheckoutForm({
        deliveryType,
        scheduledDate,
        scheduledTimeSlot,
        paymentMethod,
    });

    const {
        previewOrder,
        handleSubmit,
        cartPreview,
        isPreview,
        setIsPreview,
        isPreviewLoading,
        setPreviewError,
        cancelOrder,
    } = useCheckoutPayment({
        formData,
        separateShipping,
        deliveryType,
        scheduledDate,
        scheduledTimeSlot,
        paymentMethod,
        normalizePhone,
        normalizePaymentMethod,
        validateStep3,
        cartItems,
        setShowInnBucksModal,
        setShowEcocashModal,
        ecocashCartIdRef,
        startInnBucksPolling,
        stopInnBucksPolling,
    });

    const MINIMUM_ORDER = 15;

    useEffect(() => {
        if (cartItems.length === 0) { router.push("/store"); return; }
        if (cartTotal < MINIMUM_ORDER) { toast.error(`Minimum order is $${MINIMUM_ORDER.toFixed(2)}`); router.push("/cart"); }
    }, [cartItems.length, cartTotal, router]);

    useEffect(() => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + 14);
        const fmt = (d: any) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        setMinDeliveryDate(fmt(tomorrow));
        setMaxDeliveryDate(fmt(maxDate));
        setScheduledDate(fmt(tomorrow));
    }, []);

    // For scheduled accounts, default to scheduled delivery
    useEffect(() => {
        if (user?.customer?.isInstantDelivery === false) {
            setDeliveryType("scheduled");
        }
    }, [user?.customer?.isInstantDelivery]);

    useEffect(() => {
        const selectedDate = scheduledDate ? new Date(scheduledDate) : null;
        const today = new Date();
        const isToday = selectedDate && selectedDate.toDateString() === today.toDateString();
        const currentHour = today.getHours();
        const baseSlots = [
            { value: "06:00-08:00", label: "6:00 AM - 8:00 AM", startHour: 6 },
            { value: "08:00-10:00", label: "8:00 AM - 10:00 AM", startHour: 8 },
            { value: "10:00-12:00", label: "10:00 AM - 12:00 PM", startHour: 10 },
            { value: "12:00-14:00", label: "12:00 PM - 2:00 PM", startHour: 12 },
            { value: "14:00-16:00", label: "2:00 PM - 4:00 PM", startHour: 14 },
            { value: "16:00-18:00", label: "4:00 PM - 6:00 PM", startHour: 16 },
        ];
        setAvailableTimeSlots(baseSlots.map(slot => ({ value: slot.value, label: slot.label, available: !isToday || slot.startHour > currentHour + 2 })));
    }, [scheduledDate]);

    // No auto-preview — user clicks "Review Order" explicitly

    const nextStep = async () => {
        if (step === 1) { if (validateStep1()) setStep(2); return; }
        if (step === 2) { if (validateStep2()) setStep(3); return; }
        if (step === 3) { setStep(4); return; }
    };
    const prevStep = () => { if (step > 1) { setIsPreview(false); setPreviewError(false); setStep(step - 1); } };

    const summaryTotals = useMemo(() => {
        const cp = cartPreview as any;
        const previewLines = cp?.documentLines || cp?.DocumentLines || [];
        const subtotal = previewLines.reduce((sum: any, line: any) => sum + (line.lineTotal || line.LineTotal || line.lineTotalAfterVAT || 0), 0) || cartTotal;
        const vat = cp?.vatSum || cp?.VatSum || 0;
        const expenses = cp?.documentAdditionalExpenses || cp?.DocumentAdditionalExpenses || [];
        const deliveryExpense = expenses.find((exp: any) => (exp.remarks || exp.Remarks || "").toString().toLowerCase().includes("delivery"));
        const delivery = deliveryExpense?.lineTotalAfterVAT || deliveryExpense?.LineTotalAfterVAT || deliveryExpense?.LineGross || 0;
        const total = cp?.docTotal || cp?.DocTotal || subtotal + vat + delivery;
        return { subtotal, vat, delivery, total };
    }, [cartPreview, cartTotal]);

    const STEPS = [
        { num: 1, label: "Customer Info" },
        { num: 2, label: "Address & Delivery" },
        { num: 3, label: "Review Order" },
        { num: 4, label: "Payment" },
    ];

    const PAYMENT_METHODS = [
        { value: "Account", label: "Pay on Account", icon: "/assets/images/payment/wallet.png", emoji: "💳" },
        { value: "PayNow", label: "PayNow", icon: "/assets/images/payment/paynow.png", emoji: "📱" },
        { value: "InnBucks", label: "InnBucks", icon: "/assets/images/payment/innbucks.jpg", emoji: "💰" },
        { value: "Ecocash", label: "Ecocash", icon: "/assets/images/payment/ecocash-logo.jpg", emoji: "📲" },
        { value: "CashOnDelivery", label: "Cash on Delivery", icon: "/assets/images/payment/cod-logo.png", emoji: "💵" },
    ];

    return (
        <>
            <PaymentModalErrorBoundary>
                <Suspense fallback={null}>
                    <InnBucksPaymentModal isOpen={showInnBucksModal} code={innbucksCode} qrCode={innbucksQR} isPolling={isPolling} pollingAttempt={pollingAttempt} timeRemaining={Number(getTimeRemaining())} pollingError={pollingError}
                        onCancel={() => { stopInnBucksPolling(); setShowInnBucksModal(false); setStep(3); }}
                        onSuccess={() => { clearCart(); router.push("/check-order?success=true"); }} />
                </Suspense>
            </PaymentModalErrorBoundary>

            <PaymentModalErrorBoundary>
                <Suspense fallback={null}>
                <EcocashPaymentModal isOpen={showEcocashModal} phoneNumber={formData.paymentPhoneNumber} amount={summaryTotals?.total} isProcessing={loading}
                    onCancel={() => { setShowEcocashModal(false); setStep(3); }}
                    onSuccess={async () => {
                    setLoading(true);
                    try {
                        const r = await paymentService.createOrderFromCart({ cartId: ecocashCartIdRef.current, expectedTotal: summaryTotals?.total, paymentMethod: "Ecocash" });
                        if (r?.success) { toast.success("Order placed successfully!"); clearCart(); setShowEcocashModal(false); router.push("/check-order?success=true"); }
                        else throw new Error(r?.error || "Payment failed");
                    } catch (error) { toast.error(error instanceof Error ? error.message : "Payment processing failed"); setLoading(false); }
                }} />
                </Suspense>
            </PaymentModalErrorBoundary>

            <Layout parent="Home" sub="Shop" subChild="Checkout">
                <style jsx global>{`
                  /* Mobile Checkout Enhancements */
                  @media (max-width: 640px) {
                    /* Time slot list: tap cards instead of select */
                    .co-timeslot-list {
                      display: flex;
                      flex-direction: column;
                      gap: 8px;
                      margin-top: 8px;
                    }

                    .co-timeslot-card {
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                      padding: 12px 14px;
                      border: 2px solid #e8e8e8;
                      border-radius: 10px;
                      cursor: pointer;
                      transition: all 200ms;
                      background: #fff;
                      min-height: 48px;
                    }

                    .co-timeslot-card:hover:not(:disabled) {
                      border-color: #3BB77E;
                    }

                    .co-timeslot-card.selected {
                      border-color: #3BB77E;
                      background: #f0fdf4;
                    }

                    .co-timeslot-card:disabled {
                      opacity: 0.5;
                      cursor: not-allowed;
                      color: #636363;
                    }

                    .co-timeslot-label {
                      font-size: 14px;
                      font-weight: 600;
                      color: #333;
                    }

                    .co-timeslot-status {
                      font-size: 11px;
                      color: #636363;
                      font-weight: 500;
                    }

                    /* Payment methods: stack vertically on mobile */
                    .co-payment-grid {
                      display: flex !important;
                      flex-direction: column;
                      gap: 12px;
                    }

                    .co-payment-tile {
                      min-height: 64px !important;
                      padding: 14px 16px !important;
                      border-left: 4px solid transparent !important;
                    }

                    .co-payment-tile.selected {
                      border-left-color: #3BB77E !important;
                      background: #f0fdf4 !important;
                    }

                    /* Compact stepper on mobile */
                    .co-step-label {
                      font-size: 9px !important;
                    }

                    .co-stepper {
                      padding: 0 8px !important;
                    }

                    /* Hide right sidebar on mobile, show MobileOrderSummary instead */
                    .col-lg-4 {
                      display: none;
                    }

                    .co-page {
                      padding-bottom: 160px;
                    }

                    /* Prevent iOS auto-zoom on input focus */
                    .co-input, .co-select {
                      font-size: 16px !important;
                    }

                    /* Mobile Order Summary wrapper */
                    .mobile-order-summary-wrapper {
                      display: none;
                    }

                    @media (max-width: 768px) {
                      .mobile-order-summary-wrapper {
                        display: block !important;
                      }
                    }
                  }
                `}</style>

                <div className="co-page">
                    <div className="container">
                        <div className="co-header-row">
                            <Link href="/store" className="co-back">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                                Back to Shop
                            </Link>
                            {/* WhatsApp Support - Zimbabwe Market */}
                            <a
                                href="https://wa.me/263782978460?text=I%20need%20help%20with%20my%20order"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="co-whatsapp-help"
                                title="Get help via WhatsApp"
                            >
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.6 6.4C15.8 4.6 13.5 3.7 11 3.7 6.3 3.7 2.4 7.6 2.4 12.3c0 1.5.4 3 1 4.3L2.2 21l4.9-1.6c1.3.7 2.7 1 4.2 1h.1c4.7 0 8.6-3.9 8.6-8.6 0-2.3-.9-4.6-2.4-6.4zm-6.6 13.2h-.1c-1.4 0-2.7-.3-4-1l-.3-.2-2.8.9.9-2.8-.2-.3c-.7-1.3-1.1-2.7-1.1-4.1 0-3.9 3.2-7.1 7.1-7.1 1.9 0 3.7.7 5 2.1 1.3 1.3 2.1 3.1 2.1 5s-.7 3.7-2.1 5c-1.2 1.3-3 2.1-4.9 2.1z"/></svg>
                                Help
                            </a>
                        </div>

                        {/* Stepper */}
                        <nav className="co-stepper" aria-label="Checkout progress">
                            {STEPS.map((s: any, i: any) => (
                                <div key={s.num}>
                                    <div className={`co-step ${step >= s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}>
                                        <div className="co-step-circle">
                                            {step > s.num ? <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg> : s.num}
                                        </div>
                                        <div className="co-step-label">{s.label}</div>
                                    </div>
                                    {i < STEPS.length - 1 && <div className={`co-step-line ${step > s.num ? 'active' : ''}`} />}
                                </div>
                            ))}
                        </nav>

                        {/* Zones Error Alert */}
                        {zonesError && (
                            <div className="co-error-alert">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                <div>
                                    <strong>Unable to load delivery zones</strong>
                                    <p>{zonesError}</p>
                                </div>
                            </div>
                        )}

                        {/* Progress Indicator */}
                        <div className="co-progress-bar" aria-label={`Step ${step} of ${STEPS.length}`}>
                            <div className="co-progress-fill" style={{ width: `${(step / STEPS.length) * 100}%` }}></div>
                        </div>

                        <div className="row g-3 align-items-start">
                            {/* Left column: form */}
                            <div className="col-lg-8">

                                {/* Login prompt for guests */}
                                {user?.customer?.isVisitor && (
                                    <div className="co-card">
                                        <div className="co-login-prompt">
                                            <div className="co-lock-icon">🔒</div>
                                            <h5>Sign in to continue</h5>
                                            <p>Checkout is available for registered customers only.</p>
                                            <button onClick={() => openAuthModal('login')} className="co-btn-primary co-login-btn-inline">
                                                Login to Continue
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {!isPreview && !user?.customer?.isVisitor && (
                                    <div className="co-card">

                                        {/* Step 1: Customer Info */}
                                        {step === 1 && (
                                            <fieldset>
                                                <legend className="co-section-title">Customer Information</legend>
                                                <div className="co-info-notice">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                                                    <p>Information is pre-filled from your account profile. Update as needed.</p>
                                                </div>
                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <div className="co-field"><label htmlFor="co-firstName" className="co-label">First Name *</label><input id="co-firstName" type="text" name="firstName" className="co-input" placeholder="John" value={formData.firstName} onChange={handleChange} /></div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="co-field"><label htmlFor="co-lastName" className="co-label">Last Name *</label><input id="co-lastName" type="text" name="lastName" className="co-input" placeholder="Doe" value={formData.lastName} onChange={handleChange} /></div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="co-field"><label htmlFor="co-secondName" className="co-label">Second Name</label><input id="co-secondName" type="text" name="secondName" className="co-input" placeholder="Optional" value={formData.secondName} onChange={handleChange} /></div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="co-field"><label htmlFor="co-companyName" className="co-label">Company Name</label><input id="co-companyName" type="text" name="companyName" className="co-input" placeholder="Optional" value={formData.companyName} onChange={handleChange} /></div>
                                                    </div>
                                                    <div className="col-12">
                                                        <div className="co-field"><label htmlFor="co-email" className="co-label">Email Address *</label><input id="co-email" type="email" name="email" className="co-input" placeholder="you@example.com" value={formData.email} onChange={handleChange} /></div>
                                                    </div>
                                                    <div className="col-12">
                                                        <div className="co-field"><label htmlFor="co-mobile" className="co-label">Mobile Number *</label>
                                                            <PhoneInput value={formData.mobileNumber} onChange={(value) => handleChange({ target: { name: 'mobileNumber', value } })} label="" placeholder="Enter phone number" required={false} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </fieldset>
                                        )}

                                        {/* Step 2: Address + Delivery */}
                                        {step === 2 && (
                                            <fieldset>
                                                <legend className="co-section-title">Billing Address</legend>
                                                <div className="row g-3">
                                                    <div className="col-12">
                                                        <div className="co-field"><label htmlFor="billCountry" className="co-label">Country *</label>
                                                            <select id="billCountry" name="billCountry" className="co-select" value={formData.billCountry} onChange={(e: any) => updateBillCities(e.target.value)}>
                                                                <option value="">Select Country</option>
                                                                {countries.map((c: any) => <option key={c.countryCode} value={c.countryCode}>{c.countryName || c.countryCode}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="co-field"><label htmlFor="billCity" className="co-label">City *</label>
                                                            <select id="billCity" name="billCity" className="co-select" value={formData.billCity} onChange={(e) => updateBillSuburbs(e.target.value)} disabled={!billCities.length}>
                                                                <option value="">Select City</option>
                                                                {billCities.map((c: any, idx: number) => <option key={`${c.name}-${idx}`} value={c.name}>{c.name}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="co-field"><label htmlFor="billSuburb" className="co-label">Suburb *</label>
                                                            <select id="billSuburb" name="billSuburb" className="co-select" value={formData.billSuburb} onChange={handleChange} disabled={!billSuburbs.length}>
                                                                <option value="">Select Suburb</option>
                                                                {billSuburbs.map((s: any, idx: number) => <option key={`${s.name}-${idx}`} value={s.name}>{s.name}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-12">
                                                        <div className="co-field"><label className="co-label">Address Line 1 *</label><input type="text" name="billAddressLine1" className="co-input" placeholder="Street address, P.O. box" value={formData.billAddressLine1} onChange={handleChange} /></div>
                                                    </div>
                                                    <div className="col-12">
                                                        <div className="co-field"><label className="co-label">Address Line 2</label><input type="text" name="billAddressLine2" className="co-input" placeholder="Apartment, suite, unit (optional)" value={formData.billAddressLine2} onChange={handleChange} /></div>
                                                    </div>
                                                </div>

                                                <div className="co-check-row">
                                                    <input type="checkbox" id="sepShip" className="co-check" checked={separateShipping} onChange={(e) => onSeparateShippingChange(e.target.checked)} />
                                                    <label htmlFor="sepShip" className="co-check-label">Ship to a different address</label>
                                                </div>

                                                {separateShipping && (
                                                    <>
                                                        <div className="co-section-title co-section-title-spaced">Shipping Address</div>
                                                        <div className="row g-3">
                                                            <div className="col-12">
                                                                <div className="co-field"><label htmlFor="shipCountry" className="co-label">Country *</label>
                                                                    <select id="shipCountry" name="shipCountry" className="co-select" value={formData.shipCountry} onChange={(e) => updateShipCities(e.target.value)}>
                                                                        <option value="">Select Country</option>
                                                                        {countries.map((c: any) => <option key={c.countryCode} value={c.countryCode}>{c.countryName || c.countryCode}</option>)}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="co-field"><label htmlFor="shipCity" className="co-label">City *</label>
                                                                    <select id="shipCity" name="shipCity" className="co-select" value={formData.shipCity} onChange={(e) => updateShipSuburbs(e.target.value)} disabled={!shipCities.length}>
                                                                        <option value="">Select City</option>
                                                                        {shipCities.map((c: any, idx: number) => <option key={`${c.name}-${idx}`} value={c.name}>{c.name}</option>)}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="co-field"><label htmlFor="shipSuburb" className="co-label">Suburb *</label>
                                                                    <select id="shipSuburb" name="shipSuburb" className="co-select" value={formData.shipSuburb} onChange={handleChange} disabled={!shipSuburbs.length}>
                                                                        <option value="">Select Suburb</option>
                                                                        {shipSuburbs.map((s: any, idx: number) => <option key={`${s.name}-${idx}`} value={s.name}>{s.name}</option>)}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="col-12">
                                                                <div className="co-field"><label className="co-label">Address Line 1 *</label><input type="text" name="shipAddressLine1" className="co-input" placeholder="Street address, P.O. box" value={formData.shipAddressLine1} onChange={handleChange} /></div>
                                                            </div>
                                                            <div className="col-12">
                                                                <div className="co-field"><label className="co-label">Address Line 2</label><input type="text" name="shipAddressLine2" className="co-input" placeholder="Apartment, suite (optional)" value={formData.shipAddressLine2} onChange={handleChange} /></div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}

                                            </fieldset>
                                        )}

                                        {/* Step 3: Review Cart */}
                                        {step === 3 && (
                                            <>
                                                <ReviewCart
                                                    items={cartItems}
                                                    formData={formData}
                                                    deliveryType={deliveryType}
                                                    scheduledDate={scheduledDate}
                                                    scheduledTimeSlot={scheduledTimeSlot}
                                                    cartTotal={cartTotal}
                                                    onEdit={(stepToEdit) => setStep(stepToEdit)}
                                                />
                                            </>
                                        )}

                                        {/* Step 4: Payment */}
                                        {step === 4 && (
                                            <fieldset>
                                                <legend className="co-section-title">Payment Method</legend>
                                                <div className="co-payment-grid">
                                                    {PAYMENT_METHODS.map((m: any) => (
                                                        <label key={m.value} className={`co-payment-tile ${paymentMethod === m.value ? 'selected' : ''}`} onClick={() => {
                                                            setPaymentMethod(m.value);
                                                            setShowPaymentPhone(m.value === 'Ecocash' || m.value === 'InnBucks');
                                                        }}>
                                                            <span className="co-payment-emoji">{m.emoji}</span>
                                                            <span className="co-payment-label">{m.label}</span>
                                                            <Image src={m.icon} alt={m.label} className="co-payment-img" width={60} height={40} unoptimized />
                                                            <div className="co-payment-check"><i className="fi-rs-check co-payment-check-icon"></i></div>
                                                        </label>
                                                    ))}
                                                </div>

                                                {/* Payment phone field with reveal animation */}
                                                <div className="co-payment-phone-reveal" style={{
                                                    maxHeight: showPaymentPhone ? '100px' : '0',
                                                    overflow: 'hidden',
                                                    transition: 'max-height 300ms ease-in-out'
                                                }}>
                                                    <div className="co-field co-field-spaced">
                                                        <label className="co-label">Payment Phone Number *</label>
                                                        <PhoneInput value={formData.paymentPhoneNumber} onChange={(value) => handleChange({ target: { name: 'paymentPhoneNumber', value } })} label="" placeholder="Enter phone number" required={true} />
                                                    </div>
                                                </div>
                                            </fieldset>
                                        )}

                                        {/* Navigation buttons */}
                                        <div className="co-btn-row">
                                            {step > 1 && (
                                                <button type="button" className="co-btn-back" onClick={prevStep}>
                                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                                                    Back
                                                </button>
                                            )}
                                            {step < 4 && step !== 3 && (
                                                <button type="button" className="co-btn-primary" onClick={nextStep}>
                                                    Continue
                                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                                </button>
                                            )}
                                            {step === 3 && (
                                                <button type="button" className="co-btn-primary green" onClick={nextStep}>
                                                    Continue to Payment
                                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                                </button>
                                            )}
                                            {step === 4 && (
                                                <button type="button" className="co-btn-primary green" onClick={previewOrder} disabled={isPreviewLoading}>
                                                    {isPreviewLoading ? <span className="co-spinner-wrap"><span className="co-spinner"></span>Preparing…</span> : <>Review & Pay <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Preview / confirm */}
                                {!user?.customer?.isVisitor && isPreview && (
                                    <div className="co-preview-card">
                                        <div className="co-preview-title">Review Your Order</div>
                                        <p className="co-preview-sub">Please confirm your order details before placing it.</p>
                                        <div className="co-summary-totals">
                                            <div className="co-total-row"><span className="co-total-label">Subtotal</span><span className="co-total-value">{formatCurrency(summaryTotals.subtotal)}</span></div>
                                            <div className="co-total-row"><span className="co-total-label">Delivery</span><span className="co-total-value">{formatCurrency(summaryTotals.delivery)}</span></div>
                                            <div className="co-total-row"><span className="co-total-label">Tax (VAT)</span><span className="co-total-value">{formatCurrency(summaryTotals.vat)}</span></div>
                                            <div className="co-divider"></div>
                                            <div className="co-grand-row"><span className="co-grand-label">Order Total</span><span className="co-grand-value">{formatCurrency(summaryTotals.total)}</span></div>
                                        </div>
                                        <div className="co-btn-row">
                                            <button type="button" className="co-btn-back" onClick={cancelOrder}>Cancel</button>
                                            <button type="button" className="co-btn-primary green" onClick={() => handleSubmit(setLoading)} disabled={loading}>
                                                {loading ? <span className="co-spinner-wrap"><span className="co-spinner"></span>Processing…</span> : <>Place Order <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></>}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right column: Order summary */}
                            <div className="col-lg-4">
                                <div className="co-summary-card">
                                    <div className="co-summary-header">
                                        <div className="co-summary-title">Order Summary</div>
                                    </div>

                                    {Object.entries(itemsByVendor).map(([vendor, items]: any) => {
                                        const vendorSubtotal = (items as any).reduce((t: any, item: any) => t + ((item.uom?.price || 0) * item.quantity), 0);
                                        return (
                                            <div key={vendor} className="co-vendor-group">
                                                <div className="co-vendor-header">
                                                    <div className="co-vendor-name-row"><i className="fi-rs-shop co-vendor-icon"></i>{vendor}</div>
                                                    <span className="co-vendor-sub">{formatCurrency(vendorSubtotal)}</span>
                                                </div>
                                                {items.map((item: any, idx: any) => {
                                                    const img = getProductImageUrl(item.product, "/assets/imgs/placeholder.png");
                                                    return (
                                                        <div key={`${item.itemCode}-${idx}`} className="co-item">
                                                            <div className="co-item-img"><Image src={img} alt={item.itemName} width={80} height={80} unoptimized /></div>
                                                            <div className="co-item-info">
                                                                <div className="co-item-name">{item.itemName}</div>
                                                                <div className="co-item-meta">Qty: {item.quantity} · {formatCurrency(item.uom?.price || 0)}</div>
                                                            </div>
                                                            <div className="co-item-total">{formatCurrency((item.uom?.price || 0) * item.quantity)}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}

                                    <div className="co-divider"></div>
                                    <div className="co-total-row"><span className="co-total-label">Subtotal</span><span className="co-total-value">{formatCurrency(summaryTotals.subtotal)}</span></div>
                                    <div className="co-total-row"><span className="co-total-label">Delivery</span><span className="co-total-value">{formatCurrency(summaryTotals.delivery)}</span></div>
                                    <div className="co-total-row"><span className="co-total-label">Tax (VAT)</span><span className="co-total-value">{formatCurrency(summaryTotals.vat)}</span></div>
                                    <div className="co-grand-row co-grand-row-mt">
                                        <span className="co-grand-label">Total</span>
                                        <span className="co-grand-value">{formatCurrency(summaryTotals.total)}</span>
                                    </div>

                                    <Link href="/store" className="co-continue-link">
                                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Order Summary - visible only on mobile */}
                <Suspense fallback={null}>
                    <div style={{ display: 'none' }} className="mobile-order-summary-wrapper">
                        {!user?.customer?.isVisitor && cartItems.length > 0 && (
                            <MobileOrderSummary
                                items={cartItems.map((item: any) => ({
                                    id: item.itemCode,
                                    name: item.itemName,
                                    price: item.uom?.price || 0,
                                    quantity: item.quantity,
                                    image: getProductImageUrl(item.product, "/assets/imgs/placeholder.png")
                                }))}
                                subtotal={summaryTotals.subtotal}
                                delivery={summaryTotals.delivery}
                                tax={summaryTotals.vat}
                                total={summaryTotals.total}
                                onContinue={() => window.scrollTo(0, 0)}
                                isLoading={isPreviewLoading}
                            />
                        )}
                    </div>
                </Suspense>
            </Layout>
        </>
    );
};

export default Checkout;
