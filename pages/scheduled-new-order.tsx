import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../components/layout/Layout";
import apiClient from "../config/api";
import { useAuth } from "../contexts/AuthContext";
import SEO from "../components/common/SEO";
import { pageSeoConfig } from "../config/seo";
import { logger } from "../lib/logger";
import { normalizeArray } from "../lib/normalizeApiResponse";
import { formatCurrency, formatDateShort, formatDateFull } from "../lib/formatters";
import AuthGuard from "../components/guards/AuthGuard";
import { getProductImageUrl } from "../lib/imageProxy";

const STEPS = ['Select Schedule', 'Delivery Date', 'Add Products', 'Review & Confirm'];

const ScheduledNewOrder = () => {
    const router = useRouter();
    const { schedule: scheduleId } = router.query;
    const { user } = useAuth();
    const seoConfig = pageSeoConfig['/scheduled-new-order'];

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [schedules, setSchedules] = useState<any[]>([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [selectedDeliveryDate, setSelectedDeliveryDate] = useState('');
    const [products, setProducts] = useState<any[]>([]);
    const [quantities, setQuantities] = useState({}); // { itemCode: qty }
    const [searchTerm, setSearchTerm] = useState('');
    const [orderComments, setOrderComments] = useState('');
    const [loadingSchedules, setLoadingSchedules] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitPhase, setSubmitPhase] = useState(''); // 'cart' | 'order' | ''
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState<any>(null);
    const [showConfirm, setShowConfirm] = useState(false);

    // Load schedules
    useEffect(() => {
        const load = async () => {
            try {
                setLoadingSchedules(true);
                const response = await ( apiClient as any).getStoreOrderSchedules();
                const raw = normalizeArray(response);
                // Normalize field names to handle both camelCase and PascalCase
                const normalized = raw.map((s: any) => ({
                    docEntry: s.DocEntry ?? s.docEntry,
                    docNum: s.DocNum ?? s.docNum,
                    remark: s.Remark ?? s.remark ?? '',
                    startDate: s.StartDate ?? s.startDate,
                    endDate: s.EndDate ?? s.endDate,
                    startDeliveryDate: s.StartDeliveryDate ?? s.startDeliveryDate,
                    endDeliveryDate: s.EndDeliveryDate ?? s.endDeliveryDate,
                    status: s.Status ?? s.status ?? 'Open',
                    availableDeliveryDates: s.AvailableDeliveryDates ?? s.availableDeliveryDates ?? [],
                    warehouseCode: s.WarehouseCode ?? s.warehouseCode ?? '',
                }));
                // Only show open schedules (case-insensitive)
                const open = normalized.filter((s: any) => {
                    const st = (s.status || '').toString().toLowerCase();
                    return st === 'open' || st === 'o' || st === 'active';
                });
                setSchedules(open);

                // Auto-select from query param
                if (scheduleId) {
                    const found = open.find((s: any) => s.docEntry === parseInt(scheduleId as any));
                    if (found) {
                        setSelectedSchedule(found);
                        if (found.availableDeliveryDates.length > 0) setSelectedDeliveryDate(found.availableDeliveryDates[0]);
                        setCurrentStep(2); // Jump to delivery date selection
                    }
                }
            } catch (err: any) {
                logger.error('Failed to load schedules:', err);
            } finally {
                setLoadingSchedules(false);
            }
        };
        load();
    }, [scheduleId, user?.customer?.cardCode]);

    // Load products
    useEffect(() => {
        const load = async () => {
            try {
                setLoadingProducts(true);
                const response = await ( apiClient as any).getProducts(200);
                const raw = response?.values || response?.data || response?.message || [];
                const items = (Array.isArray(raw) ? raw : []).map(p => ({
                    itemCode: p.itemCode || p.ItemCode,
                    itemName: p.itemName || p.ItemName,
                    price: p.price || p.PriceAfterVAT || 0,
                    vatRate: p.salesVATRate || p.VATRate || 0,
                    vatGroup: p.salesVATGroup || p.VatGroup || '',
                    image: getProductImageUrl(p),
                    warehouseCode: p.warehouseCode || p.WarehouseCode || '',
                    inStock: (p.unitsOnStock || 0) > 0,
                    stock: p.unitsOnStock || 0,
                    uomEntry: p.uoMs?.[0]?.uomEntry || -1,
                    uomCode: p.uoMs?.[0]?.uomCode || p.uoMs?.[0]?.uomName || 'EA',
                }));
                setProducts(items);
            } catch (err) {
                logger.error('Failed to load products:', err);
            } finally {
                setLoadingProducts(false);
            }
        };
        load();
    }, [user?.customer?.cardCode]);

    // Derived: cart items
    const cartItems = useMemo(() => {
        return Object.entries(quantities)
            .filter(([, qty]: [string, any]) => qty > 0)
            .map(([code, qty]: [string, any]) => {
                const p = products.find((pr: any) => pr.itemCode === code);
                if (!p) return null;
                return { ...p, quantity: qty, lineTotal: qty * p.price };
            })
            .filter(Boolean);
    }, [quantities, products]);

    const cartTotal = useMemo(() => cartItems.reduce((s: any, i: any) => s + i.lineTotal, 0), [cartItems]);

    // Filtered products for search
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        const q = searchTerm.toLowerCase();
        return products.filter(p =>
            p.itemName.toLowerCase().includes(q) || p.itemCode.toLowerCase().includes(q)
        );
    }, [products, searchTerm]);

    // Quantity handlers
    const setQty = useCallback((code: any, qty: any) => {
        setQuantities((prev: any) => ({ ...prev, [code]: Math.max(0, qty) }));
    }, []);
    const increment = useCallback((code: any) => {
        setQuantities((prev: any) => ({ ...prev, [code]: (prev[code] || 0) + 1 }));
    }, []);
    const decrement = useCallback((code: any) => {
        setQuantities((prev: any) => ({ ...prev, [code]: Math.max(0, (prev[code] || 0) - 1) }));
    }, []);
    const removeItem = useCallback((code: any) => {
        setQuantities((prev: any) => ({ ...prev, [code]: 0 }));
    }, []);

    // Step navigation
    const canProceed = () => {
        switch (currentStep) {
            case 1: return !!selectedSchedule;
            case 2: return !!selectedDeliveryDate;
            case 3: return cartItems.length > 0;
            default: return true;
        }
    };

    const goNext = () => { if (canProceed() && currentStep < 4) setCurrentStep(currentStep + 1); };
    const goBack = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

    const selectSchedule = (s: any) => {
        setSelectedSchedule(s);
        setSelectedDeliveryDate('');
    };

    // Show confirmation modal
    const handlePlaceOrder = () => {
        if (!selectedSchedule || !selectedDeliveryDate || cartItems.length === 0) return;
        setShowConfirm(true);
    };

    // Actually submit after confirmation
    const confirmAndSubmit = async () => {
        setShowConfirm(false);
        setSubmitting(true);
        setSubmitError('');
        setSubmitPhase('cart');

        const cardCode = user?.customer?.cardCode || '';
        const cardName = user?.customer?.cardName || user?.userName || '';
        const currency = user?.customer?.currency || apiClient.currency || 'USD';
        // Prefer schedule warehouse -> user warehouse -> default
        const scheduleWarehouse = (selectedSchedule as any)?.warehouseCode;
        const warehouseCode = scheduleWarehouse || user?.customer?.warehouse || '20';
        const now = new Date().toISOString();

        const cartPayload = {
            CartTime: now,
            CartId: null,
            CardCode: cardCode,
            CardName: cardName,
            ScheduleDocEntry: (selectedSchedule as any)?.docEntry,
            DeliveryDate: selectedDeliveryDate,
            DocDate: now,
            DocCurrency: currency,
            NumAtCard: `SCH-${(selectedSchedule as any)?.docNum || ''}`,
            Comments: orderComments,
            DocTotal: cartTotal,
            DocumentLines: cartItems.map((item, i) => ({
                LineNum: i,
                ItemCode: item.itemCode,
                ItemName: item.itemName,
                ItemDescription: item.itemName,
                Quantity: item.quantity,
                PriceAfterVAT: item.price,
                WarehouseCode: item.warehouseCode || warehouseCode,
                VatGroup: item.vatGroup || 'O1',
                VATRate: item.vatRate || 15,
                UoMEntry: item.uomEntry || -1,
                UoMCode: item.uomCode || 'EA',
                LineTotal: item.lineTotal,
            })),
        };

        logger.info('Submitting scheduled order cart:', {
            cardCode,
            scheduleDocEntry: cartPayload.ScheduleDocEntry,
            deliveryDate: selectedDeliveryDate,
            lineCount: cartItems.length,
            total: cartTotal,
        });

        try {
            // Phase 1: Create scheduled order cart
            let cartResponse;
            try {
                cartResponse = await ( apiClient as any).createScheduledOrderCart(cartPayload);
            } catch (cartErr: any) {
                throw new Error(`Failed to create order cart: ${cartErr?.message || 'Server error. Please try again.'}`);
            }
            const cartId = cartResponse?.CartId || cartResponse?.cartId;

            if (!cartId) throw new Error('Cart creation failed — no CartId returned. Please try again or contact support.');
            logger.info('Scheduled order cart created:', { cartId });

            // Phase 2: Submit scheduled order from cart
            setSubmitPhase('order');
            const orderPayload = { CartId: cartId, CardCode: cardCode };
            let orderResponse;
            try {
                orderResponse = await ( apiClient as any).createScheduledOrder(orderPayload);
            } catch (orderErr: any) {
                throw new Error(`Cart was created but order submission failed: ${orderErr?.message || 'Server error. Please try again.'}`);
            }
            const orderNum = orderResponse?.DocNum || orderResponse?.docNum || orderResponse?.DocEntry || cartId;

            logger.info('Scheduled order posted to ERP:', { orderNum, cartId });

            setSubmitSuccess({
                orderNum,
                deliveryDate: selectedDeliveryDate,
                scheduleNum: (selectedSchedule as any)?.docNum,
                scheduleName: (selectedSchedule as any)?.remark || `Schedule ${(selectedSchedule as any)?.docNum || (selectedSchedule as any)?.docEntry}`,

                itemCount: cartItems.length,
                total: cartTotal,
                currency,
                customerName: cardName,
            });
        } catch (err) {
            logger.error('Scheduled order submission failed:', err);
            setSubmitError((err as any)?.message || 'Failed to place scheduled order. Please try again.');
        } finally {
            setSubmitting(false);
            setSubmitPhase('');
        }
    };

    const fmtDate = formatDateShort;
    const fmtDateLong = formatDateFull;
    const fmtMoney = formatCurrency;

    // Success screen — scheduled order confirmation
    if (submitSuccess) {
        return (
            <AuthGuard>
                <SEO {...seoConfig} />
                <Layout parent="Scheduled" sub="Order Confirmed">
                    <style>{styles}</style>
                    <div className="no-page">
                        <div className="container">
                            <div className="no-confirm-page">
                                {/* Success Header */}
                                <div className="no-confirm-header">
                                    <div className="no-confirm-check">
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                                    </div>
                                    <h1>Scheduled Order Confirmed</h1>
                                    <p>Your scheduled order has been submitted and is being processed</p>
                                </div>

                                {/* Order Details Card */}
                                <div className="no-confirm-card">
                                    <div className="no-confirm-card-header">
                                        <span>Order Reference</span>
                                        <span className="no-confirm-ordernum">#{submitSuccess.orderNum}</span>
                                    </div>
                                    <div className="no-confirm-details">
                                        <div className="no-confirm-row">
                                            <span className="no-confirm-label">Schedule</span>
                                            <span className="no-confirm-value">#{submitSuccess.scheduleNum} — {submitSuccess.scheduleName}</span>
                                        </div>
                                        <div className="no-confirm-row">
                                            <span className="no-confirm-label">Delivery Date</span>
                                            <span className="no-confirm-value no-confirm-highlight">{fmtDateLong(submitSuccess.deliveryDate)}</span>
                                        </div>
                                        <div className="no-confirm-row">
                                            <span className="no-confirm-label">Items Ordered</span>
                                            <span className="no-confirm-value">{submitSuccess.itemCount} product{submitSuccess.itemCount !== 1 ? 's' : ''}</span>
                                        </div>
                                        {submitSuccess.customerName && (
                                            <div className="no-confirm-row">
                                                <span className="no-confirm-label">Account</span>
                                                <span className="no-confirm-value">{submitSuccess.customerName}</span>
                                            </div>
                                        )}
                                        <div className="no-confirm-divider" />
                                        <div className="no-confirm-row no-confirm-total-row">
                                            <span className="no-confirm-label">Order Total</span>
                                            <span className="no-confirm-total">{fmtMoney(submitSuccess.total)}</span>
                                        </div>
                                    </div>
                                    <div className="no-confirm-note">
                                        <i className="fi-rs-info"></i>
                                        <span>Payment will be processed according to your account terms. No payment is required at this time.</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="no-confirm-actions">
                                    <Link href="/scheduled-orders" className="no-btn-outline">
                                        <i className="fi-rs-calendar"></i> View Schedules
                                    </Link>
                                    <Link href="/scheduled-orders" className="no-btn-primary">
                                        <i className="fi-rs-plus"></i> Place Another Order
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </Layout>
            </AuthGuard>
        );
    }

    // Not found
    if (!loadingSchedules && scheduleId && !selectedSchedule && schedules.length > 0) {
        return (
            <AuthGuard>
                <SEO {...seoConfig} />
                <Layout parent="Scheduled" sub="New Order">
                    <style>{styles}</style>
                    <div className="no-page">
                        <div className="container">
                            <div className="no-empty">
                                <h2>Schedule Not Found</h2>
                                <p>Please select a valid schedule to continue</p>
                                <Link href="/scheduled-orders" className="no-btn-primary">Back to Schedules</Link>
                            </div>
                        </div>
                    </div>
                </Layout>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard>
            <SEO {...seoConfig} />
            <Layout parent="Scheduled" sub="New Order">
                <style>{styles}</style>
                <div className="no-page">
                    <div className="container">
                        {/* Header */}
                        <div className="no-header">
                            <div>
                                <h1>Create New Order</h1>
                                <p>Select a schedule, choose products, and place your order</p>
                            </div>
                        </div>

                        {/* Stepper */}
                        <div className="no-stepper">
                            {STEPS.map((label, i) => {
                                const stepNum = i + 1;
                                const isActive = currentStep === stepNum;
                                const isDone = currentStep > stepNum;
                                return (
                                    <div key={i} className="no-step-wrap">
                                        <div className={`no-step ${isActive ? 'no-step-active' : ''} ${isDone ? 'no-step-done' : ''}`}>
                                            <div className="no-step-circle">
                                                {isDone ? (
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                                                ) : stepNum}
                                            </div>
                                            <span className="no-step-label">{label}</span>
                                        </div>
                                        {i < STEPS.length - 1 && <div className={`no-step-line ${isDone ? 'no-step-line-done' : ''}`} />}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Step 1: Select Schedule */}
                        {currentStep === 1 && (
                            <div className="no-section">
                                <h2 className="no-section-title">Select a Schedule</h2>
                                {loadingSchedules ? (
                                    <div className="no-skel-grid">
                                        {[1, 2].map(i => <div key={i} className="no-skel-card" />)}
                                    </div>
                                ) : schedules.length === 0 ? (
                                    <div className="no-empty">
                                        <h3>No open schedules</h3>
                                        <p>There are no schedules available. Please check back later.</p>
                                    </div>
                                ) : (
                                    <div className="no-schedule-grid">
                                        {schedules.map((s: any) => {
                                            const id = s.docEntry || s.DocEntry;
                                            const isSelected = selectedSchedule && (selectedSchedule as any).docEntry === id;
                                            const dates = s.availableDeliveryDates || s.AvailableDeliveryDates || [];
                                            return (
                                                <button key={id}
                                                    className={`no-schedule-card ${isSelected ? 'no-schedule-selected' : ''}`}
                                                    onClick={() => selectSchedule(s)}
                                                >
                                                    <div className="no-sch-top">
                                                        <div>
                                                            <h4>Schedule #{s.docNum || id}</h4>
                                                            <span className="no-sch-remark">{s.remark || 'Order Schedule'}</span>
                                                        </div>
                                                        <div className={`no-radio ${isSelected ? 'no-radio-on' : ''}`}>
                                                            {isSelected && <div className="no-radio-dot" />}
                                                        </div>
                                                    </div>
                                                    <div className="no-sch-meta">
                                                        <div className="no-sch-meta-item">
                                                            <i className="fi-rs-calendar"></i>
                                                            Orders: {fmtDate(s.startDate)} — {fmtDate(s.endDate)}
                                                        </div>
                                                        <div className="no-sch-meta-item">
                                                            <i className="fi-rs-truck-side"></i>
                                                            {dates.length} delivery date{dates.length !== 1 ? 's' : ''} available
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Delivery Date */}
                        {currentStep === 2 && selectedSchedule && (
                            <div className="no-section">
                                <h2 className="no-section-title">Select Delivery Date</h2>
                                <p className="no-section-sub">Choose when you'd like your order delivered</p>
                                <div className="no-date-grid">
                                    {((selectedSchedule as any).availableDeliveryDates || []).map((d: any, i: any) => {
                                        const dt = new Date(d);
                                        const isSelected = selectedDeliveryDate === d;
                                        return (
                                            <button key={i}
                                                className={`no-date-card ${isSelected ? 'no-date-selected' : ''}`}
                                                onClick={() => setSelectedDeliveryDate(d)}
                                            >
                                                <span className="no-date-day">{dt.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                                <span className="no-date-num">{dt.getDate()}</span>
                                                <span className="no-date-month">{dt.toLocaleDateString('en-US', { month: 'short' })}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Add Products */}
                        {currentStep === 3 && (
                            <div className="no-section">
                                {/* Search */}
                                <div className="no-search-bar">
                                    <i className="fi-rs-search"></i>
                                    <input
                                        type="text" placeholder="Search products..."
                                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm && (
                                        <button className="no-search-clear" onClick={() => setSearchTerm('')}>&times;</button>
                                    )}
                                </div>

                                <div className="no-products-layout">
                                    {/* Products Grid */}
                                    <div className="no-products-grid-wrap">
                                        {loadingProducts ? (
                                            <div className="no-prod-grid">
                                                {[1,2,3,4,5,6].map(i => <div key={i} className="no-skel-prod" />)}
                                            </div>
                                        ) : filteredProducts.length === 0 ? (
                                            <div className="no-empty-sm">
                                                <p>No products found{searchTerm ? ` for "${searchTerm}"` : ''}</p>
                                            </div>
                                        ) : (
                                            <div className="no-prod-grid">
                                                {filteredProducts.map((p: any) => {
                                                    const qty = (quantities as any)[p.itemCode] || 0;
                                                    return (
                                                        <div key={p.itemCode} className={`no-prod-card ${qty > 0 ? 'no-prod-in-cart' : ''}`}>
                                                            <div className="no-prod-img">
                                                                {p.image ? (
                                                                    <img src={p.image} alt={p.itemName}
                                                                        onError={(e: any) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                                                ) : null}
                                                                <div className="no-prod-img-placeholder" style={p.image ? { display: 'none' } : {}}>
                                                                    <i className="fi-rs-box"></i>
                                                                </div>
                                                            </div>
                                                            <div className="no-prod-info">
                                                                <h4 className="no-prod-name">{p.itemName}</h4>
                                                                <span className="no-prod-code">{p.itemCode}</span>
                                                                <span className="no-prod-price">{fmtMoney(p.price)}</span>
                                                            </div>
                                                            <div className="no-prod-actions">
                                                                {qty === 0 ? (
                                                                    <button className="no-btn-add" onClick={() => increment(p.itemCode)}>
                                                                        + Add
                                                                    </button>
                                                                ) : (
                                                                    <div className="no-qty-control">
                                                                        <button onClick={() => decrement(p.itemCode)}>−</button>
                                                                        <input type="number" min="0" value={qty}
                                                                            onChange={e => setQty(p.itemCode, parseInt(e.target.value) || 0)} />
                                                                        <button onClick={() => increment(p.itemCode)}>+</button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Cart Sidebar */}
                                    <div className="no-cart-sidebar">
                                        <div className="no-cart-panel">
                                            <div className="no-cart-header">
                                                <h3>Cart ({cartItems.length})</h3>
                                            </div>
                                            {cartItems.length === 0 ? (
                                                <div className="no-cart-empty">
                                                    <i className="fi-rs-shopping-bag"></i>
                                                    <p>Your cart is empty</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="no-cart-items">
                                                        {cartItems.map(item => (
                                                            <div key={item.itemCode} className="no-cart-item">
                                                                <div className="no-cart-item-info">
                                                                    <span className="no-cart-item-name">{item.itemName}</span>
                                                                    <span className="no-cart-item-detail">
                                                                        {item.quantity} × {fmtMoney(item.price)}
                                                                    </span>
                                                                </div>
                                                                <div className="no-cart-item-right">
                                                                    <span className="no-cart-item-total">{fmtMoney(item.lineTotal)}</span>
                                                                    <button className="no-cart-item-remove" onClick={() => removeItem(item.itemCode)}>
                                                                        &times;
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="no-cart-footer">
                                                        <span>Total</span>
                                                        <span className="no-cart-total">{fmtMoney(cartTotal)}</span>
                                                    </div>
                                                </>
                                            )}
                                            {/* Continue button directly under cart */}
                                            <div className="no-cart-continue">
                                                <button className="no-btn-primary no-btn-full" onClick={goNext} disabled={!canProceed()}>
                                                    Continue to Review &rarr;
                                                </button>
                                                <button className="no-btn-outline no-btn-full no-btn-back-sm" onClick={goBack}>
                                                    &larr; Back
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Review */}
                        {currentStep === 4 && (
                            <div className="no-section">
                                <h2 className="no-section-title">Review Your Order</h2>

                                {/* Summary Cards */}
                                <div className="no-summary-grid">
                                    <div className="no-summary-card">
                                        <span className="no-summary-label">Schedule</span>
                                        <span className="no-summary-value">#{(selectedSchedule as any)?.docNum}</span>
                                    </div>
                                    <div className="no-summary-card">
                                        <span className="no-summary-label">Delivery Date</span>
                                        <span className="no-summary-value">{fmtDate(selectedDeliveryDate)}</span>
                                    </div>
                                    <div className="no-summary-card">
                                        <span className="no-summary-label">Items</span>
                                        <span className="no-summary-value">{cartItems.length} product{cartItems.length !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="no-summary-card">
                                        <span className="no-summary-label">Total</span>
                                        <span className="no-summary-value no-summary-total">{fmtMoney(cartTotal)}</span>
                                    </div>
                                </div>

                                {/* Order Items Table */}
                                <div className="no-review-table">
                                    <div className="no-review-header">
                                        <span>Product</span>
                                        <span>Qty</span>
                                        <span>Price</span>
                                        <span>Subtotal</span>
                                    </div>
                                    {cartItems.map(item => (
                                        <div key={item.itemCode} className="no-review-row">
                                            <div className="no-review-product">
                                                {item.image && <img src={item.image} alt="" className="no-review-img" />}
                                                <div>
                                                    <span className="no-review-name">{item.itemName}</span>
                                                    <span className="no-review-code">{item.itemCode}</span>
                                                </div>
                                            </div>
                                            <span>{item.quantity}</span>
                                            <span>{fmtMoney(item.price)}</span>
                                            <span className="no-review-subtotal">{fmtMoney(item.lineTotal)}</span>
                                        </div>
                                    ))}
                                    <div className="no-review-total-row">
                                        <span>Grand Total</span>
                                        <span className="no-review-grand">{fmtMoney(cartTotal)}</span>
                                    </div>
                                </div>

                                {/* Comments */}
                                <div className="no-comments">
                                    <label>Order Comments (optional)</label>
                                    <textarea
                                        rows={3} placeholder="Special instructions or notes..."
                                        value={orderComments} onChange={e => setOrderComments(e.target.value)}
                                    />
                                </div>

                                {submitError && (
                                    <div className="no-error-banner">{submitError}</div>
                                )}
                            </div>
                        )}

                        {/* Navigation — hidden on step 3 (continue is in the cart sidebar) */}
                        {currentStep !== 3 && (
                            <div className="no-nav-bar">
                                <button className="no-btn-outline" onClick={goBack} disabled={currentStep === 1}>
                                    &larr; Back
                                </button>
                                <div className="no-nav-right">
                                    {currentStep < 4 ? (
                                        <button className="no-btn-primary" onClick={goNext} disabled={!canProceed()}>
                                            Continue &rarr;
                                        </button>
                                    ) : (
                                        <button className="no-btn-submit" onClick={handlePlaceOrder} disabled={submitting || cartItems.length === 0}>
                                            Place Scheduled Order — {fmtMoney(cartTotal)}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Mobile sticky bottom bar for steps 3 & 4 */}
                        {currentStep === 3 && (
                            <div className="no-mobile-bar">
                                <div className="no-mobile-bar-info">
                                    <span className="no-mobile-bar-count">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</span>
                                    <span className="no-mobile-bar-total">{fmtMoney(cartTotal)}</span>
                                </div>
                                <button className="no-btn-primary" onClick={goNext} disabled={!canProceed()}>
                                    Continue &rarr;
                                </button>
                            </div>
                        )}
                        {currentStep === 4 && (
                            <div className="no-mobile-bar">
                                <div className="no-mobile-bar-info">
                                    <span className="no-mobile-bar-count">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</span>
                                    <span className="no-mobile-bar-total">{fmtMoney(cartTotal)}</span>
                                </div>
                                <button className="no-btn-submit" onClick={handlePlaceOrder} disabled={submitting || cartItems.length === 0}>
                                    Place Order
                                </button>
                            </div>
                        )}
                        {/* Confirmation Modal */}
                        {showConfirm && (
                            <div className="no-modal-overlay" onClick={() => setShowConfirm(false)}>
                                <div className="no-modal" onClick={e => e.stopPropagation()}>
                                    <div className="no-modal-icon">
                                        <i className="fi-rs-clipboard-list"></i>
                                    </div>
                                    <h3>Confirm Scheduled Order</h3>
                                    <p>You are about to place a scheduled order:</p>
                                    <div className="no-modal-summary">
                                        <div className="no-modal-row">
                                            <span>Schedule</span>
                                            <strong>#{(selectedSchedule as any)?.docNum}</strong>
                                        </div>
                                        <div className="no-modal-row">
                                            <span>Delivery</span>
                                            <strong>{fmtDate(selectedDeliveryDate)}</strong>
                                        </div>
                                        <div className="no-modal-row">
                                            <span>Items</span>
                                            <strong>{cartItems.length} product{cartItems.length !== 1 ? 's' : ''}</strong>
                                        </div>
                                        <div className="no-modal-row no-modal-total">
                                            <span>Total</span>
                                            <strong>{fmtMoney(cartTotal)}</strong>
                                        </div>
                                    </div>
                                    <p className="no-modal-note">Payment will be charged to your account. This cannot be undone.</p>
                                    <div className="no-modal-actions">
                                        <button className="no-btn-outline" onClick={() => setShowConfirm(false)}>Cancel</button>
                                        <button className="no-btn-submit" onClick={confirmAndSubmit}>
                                            Confirm &amp; Place Order
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submission Progress Overlay */}
                        {submitting && (
                            <div className="no-submit-overlay">
                                <div className="no-submit-box">
                                    <div className="no-submit-spinner" />
                                    <h3>{submitPhase === 'cart' ? 'Creating order cart...' : 'Submitting scheduled order...'}</h3>
                                    <p className="no-submit-steps">
                                        <span className={submitPhase === 'cart' ? 'no-step-active-txt' : 'no-step-done-txt'}>
                                            {submitPhase === 'order' ? '1. Cart created' : '1. Creating cart...'}
                                        </span>
                                        <span className={submitPhase === 'order' ? 'no-step-active-txt' : ''}>
                                            2. {submitPhase === 'order' ? 'Placing order...' : 'Place order'}
                                        </span>
                                    </p>
                                    <p className="no-submit-note">Please do not close this page</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Layout>
        </AuthGuard>
    );
};

const styles = `
    .no-page { padding: 30px 0 80px; min-height: 60vh; }

    .no-header { margin-bottom: 24px; }
    .no-header h1 { font-size: 26px; font-weight: 800; color: #1a202c; margin: 0 0 4px; }
    .no-header p { font-size: 15px; color: #718096; margin: 0; }

    /* Stepper */
    .no-stepper {
        display: flex; align-items: center; background: #fff; border: 1px solid #e2e8f0;
        border-radius: 14px; padding: 16px 24px; margin-bottom: 28px; overflow-x: auto;
    }
    .no-step-wrap { display: flex; align-items: center; flex: 1; min-width: 0; }
    .no-step-wrap:last-child { flex: 0; }
    .no-step { display: flex; align-items: center; gap: 10px; white-space: nowrap; }
    .no-step-circle {
        width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
        font-size: 13px; font-weight: 700; background: #edf2f7; color: #a0aec0; flex-shrink: 0;
        transition: all 0.2s;
    }
    .no-step-active .no-step-circle { background: #1a5c38; color: #fff; }
    .no-step-done .no-step-circle { background: #1a5c38; color: #fff; }
    .no-step-label { font-size: 13px; font-weight: 600; color: #a0aec0; }
    .no-step-active .no-step-label { color: #1a202c; }
    .no-step-done .no-step-label { color: #2f855a; }
    .no-step-line { flex: 1; height: 2px; background: #e2e8f0; margin: 0 12px; min-width: 20px; }
    .no-step-line-done { background: #1a5c38; }
    @media (max-width: 640px) {
        .no-step-label { display: none; }
        .no-stepper { padding: 12px 16px; }
    }

    /* Section */
    .no-section { margin-bottom: 24px; }
    .no-section-title { font-size: 20px; font-weight: 700; color: #1a202c; margin: 0 0 6px; }
    .no-section-sub { font-size: 14px; color: #718096; margin: 0 0 20px; }

    /* Step 1: Schedule Cards */
    .no-schedule-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
    @media (max-width: 480px) { .no-schedule-grid { grid-template-columns: 1fr; } }
    .no-schedule-card {
        all: unset; cursor: pointer; display: block; background: #fff; border: 2px solid #e2e8f0;
        border-radius: 14px; padding: 20px; transition: all 0.2s; box-sizing: border-box;
    }
    .no-schedule-card:hover { border-color: #1a5c38; }
    .no-schedule-selected { border-color: #1a5c38; background: #f0faf4; }
    .no-sch-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
    .no-sch-top h4 { font-size: 16px; font-weight: 700; color: #1a202c; margin: 0 0 2px; }
    .no-sch-remark { font-size: 13px; color: #718096; }
    .no-radio {
        width: 22px; height: 22px; border-radius: 50%; border: 2px solid #cbd5e0;
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .no-radio-on { border-color: #1a5c38; background: #1a5c38; }
    .no-radio-dot { width: 8px; height: 8px; border-radius: 50%; background: #fff; }
    .no-sch-meta { display: flex; flex-direction: column; gap: 8px; }
    .no-sch-meta-item { font-size: 13px; color: #4a5568; display: flex; align-items: center; gap: 8px; }
    .no-sch-meta-item i { color: #a0aec0; font-size: 14px; width: 16px; }

    /* Step 2: Date Picker */
    .no-date-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 12px; }
    .no-date-card {
        all: unset; cursor: pointer; display: flex; flex-direction: column; align-items: center;
        padding: 16px 8px; border: 2px solid #e2e8f0; border-radius: 14px;
        transition: all 0.2s; box-sizing: border-box; text-align: center;
    }
    .no-date-card:hover { border-color: #1a5c38; }
    .no-date-selected { border-color: #1a5c38; background: #f0faf4; }
    .no-date-day { font-size: 12px; color: #718096; font-weight: 600; }
    .no-date-num { font-size: 28px; font-weight: 800; color: #1a202c; line-height: 1.2; }
    .no-date-selected .no-date-num { color: #22863a; }
    .no-date-month { font-size: 13px; color: #718096; font-weight: 600; }

    /* Step 3: Products + Cart */
    .no-search-bar {
        display: flex; align-items: center; gap: 10px; background: #fff;
        border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 16px; margin-bottom: 20px;
    }
    .no-search-bar i { color: #a0aec0; font-size: 16px; }
    .no-search-bar input {
        flex: 1; border: none; outline: none; font-size: 14px; background: transparent; color: #1a202c;
    }
    .no-search-clear {
        background: none; border: none; font-size: 20px; color: #a0aec0; cursor: pointer; padding: 0 4px;
    }

    .no-products-layout { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
    @media (max-width: 900px) { .no-products-layout { grid-template-columns: 1fr; } }

    .no-prod-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 18px; }
    @media (max-width: 1199px) { .no-prod-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; } }
    @media (max-width: 991px) { .no-prod-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; } }
    @media (max-width: 640px) { .no-prod-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }

    .no-prod-card {
        background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 0;
        display: flex; flex-direction: column; transition: all 0.2s; overflow: hidden;
    }
    .no-prod-card:hover { border-color: #1a5c38; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
    .no-prod-in-cart { border-color: #1a5c38; background: #f0faf4; }
    .no-prod-img {
        width: 100%; aspect-ratio: 1; background: #f7fafc;
        display: flex; align-items: center; justify-content: center; overflow: hidden;
    }
    .no-prod-img img { width: 100%; height: 100%; object-fit: contain; padding: 8px; }
    .no-prod-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #cbd5e0; font-size: 32px; }
    .no-prod-info { flex: 1; padding: 12px 14px 8px; }
    .no-prod-name { font-size: 13px; font-weight: 600; color: #1a202c; display: block; margin-bottom: 4px; line-height: 1.3;
        overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
    .no-prod-code { font-size: 11px; color: #a0aec0; display: block; margin-bottom: 6px; }
    .no-prod-price { font-size: 16px; font-weight: 800; color: #1a5c38; display: block; }

    .no-prod-actions { margin-top: auto; padding: 0 14px 14px; }
    .no-btn-add {
        width: 100%; padding: 10px; border: 1.5px solid #1a5c38; background: #fff; color: #1a5c38;
        border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s;
    }
    .no-btn-add:hover { background: #1a5c38; color: #fff; }
    .no-qty-control {
        display: flex; align-items: center; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;
    }
    .no-qty-control button {
        width: 36px; height: 34px; border: none; background: #f7fafc; font-size: 16px;
        cursor: pointer; color: #4a5568; transition: background 0.15s;
    }
    .no-qty-control button:hover { background: #edf2f7; }
    .no-qty-control input {
        width: 40px; text-align: center; border: none; border-left: 1px solid #e2e8f0;
        border-right: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; outline: none;
        -moz-appearance: textfield;
    }
    .no-qty-control input::-webkit-inner-spin-button { -webkit-appearance: none; }

    /* Cart Sidebar */
    .no-cart-sidebar {
        align-self: start;
    }
    .no-cart-panel {
        background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden;
        position: sticky; top: 120px;
    }
    .no-cart-continue {
        padding: 14px 16px; display: flex; flex-direction: column; gap: 8px;
        border-top: 1px solid #e2e8f0;
    }
    .no-btn-full { width: 100%; justify-content: center; }
    .no-btn-back-sm { padding: 10px 16px; font-size: 13px; }
    @media (max-width: 900px) {
        .no-cart-sidebar { order: -1; }
        .no-cart-continue { display: none; }
    }
    .no-cart-header { padding: 16px 20px; border-bottom: 1px solid #f0f0f0; }
    .no-cart-header h3 { font-size: 15px; font-weight: 700; color: #1a202c; margin: 0; }
    .no-cart-empty {
        padding: 40px 20px; text-align: center; color: #a0aec0;
    }
    .no-cart-empty i { font-size: 32px; display: block; margin-bottom: 8px; }
    .no-cart-empty p { font-size: 13px; margin: 0; }
    .no-cart-items { max-height: 300px; overflow-y: auto; }
    .no-cart-item {
        display: flex; justify-content: space-between; align-items: flex-start;
        padding: 12px 20px; border-bottom: 1px solid #f7fafc; gap: 8px;
    }
    .no-cart-item-info { flex: 1; min-width: 0; }
    .no-cart-item-name { font-size: 13px; font-weight: 600; color: #1a202c; display: block;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .no-cart-item-detail { font-size: 12px; color: #718096; }
    .no-cart-item-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .no-cart-item-total { font-size: 13px; font-weight: 700; color: #1a202c; }
    .no-cart-item-remove { background: none; border: none; color: #e53e3e; font-size: 18px; cursor: pointer; padding: 0 2px; }
    .no-cart-footer {
        display: flex; justify-content: space-between; align-items: center;
        padding: 16px 20px; background: #f7fafc; border-top: 1px solid #e2e8f0;
    }
    .no-cart-footer span:first-child { font-size: 14px; font-weight: 600; color: #4a5568; }
    .no-cart-total { font-size: 18px; font-weight: 800; color: #1a5c38; }

    /* Step 4: Review */
    .no-summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 14px; margin-bottom: 24px; }
    .no-summary-card {
        background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px;
    }
    .no-summary-label { font-size: 12px; color: #a0aec0; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 4px; }
    .no-summary-value { font-size: 16px; font-weight: 700; color: #1a202c; }
    .no-summary-total { color: #1a5c38; }

    .no-review-table { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; margin-bottom: 20px; }
    .no-review-header {
        display: grid; grid-template-columns: 2fr 0.5fr 0.8fr 0.8fr; gap: 12px;
        padding: 12px 20px; background: #f7fafc; font-size: 12px; font-weight: 700;
        color: #718096; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .no-review-row {
        display: grid; grid-template-columns: 2fr 0.5fr 0.8fr 0.8fr; gap: 12px;
        padding: 14px 20px; border-bottom: 1px solid #f0f0f0; align-items: center;
        font-size: 14px; color: #4a5568;
    }
    .no-review-product { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .no-review-img { width: 36px; height: 36px; border-radius: 6px; object-fit: contain; background: #f7fafc; flex-shrink: 0; }
    .no-review-name { font-size: 13px; font-weight: 600; color: #1a202c; display: block;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .no-review-code { font-size: 11px; color: #a0aec0; }
    .no-review-subtotal { font-weight: 700; color: #1a202c; }
    .no-review-total-row {
        display: flex; justify-content: space-between; align-items: center;
        padding: 16px 20px; background: #f7fafc;
    }
    .no-review-total-row span:first-child { font-size: 16px; font-weight: 700; color: #1a202c; }
    .no-review-grand { font-size: 22px; font-weight: 800; color: #1a5c38; }

    @media (max-width: 640px) {
        .no-review-header { display: none; }
        .no-review-row { grid-template-columns: 1fr; gap: 4px; }
        .no-review-row > span:nth-child(2)::before { content: 'Qty: '; font-weight: 600; }
    }

    .no-comments { margin-bottom: 20px; }
    .no-comments label { font-size: 14px; font-weight: 600; color: #4a5568; display: block; margin-bottom: 8px; }
    .no-comments textarea {
        width: 100%; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 10px;
        font-size: 14px; resize: vertical; outline: none; box-sizing: border-box;
    }
    .no-comments textarea:focus { border-color: #1a5c38; }

    .no-error-banner {
        background: #fff5f5; border: 1px solid #feb2b2; color: #c53030; padding: 12px 16px;
        border-radius: 10px; font-size: 14px; font-weight: 600;
    }

    /* Navigation Bar */
    .no-nav-bar {
        display: flex; justify-content: space-between; align-items: center;
        padding: 20px 0; border-top: 1px solid #e2e8f0; margin-top: 8px; gap: 12px; flex-wrap: wrap;
    }
    .no-nav-right { display: flex; gap: 12px; }

    /* Mobile sticky bottom bar (steps 3 & 4) */
    .no-mobile-bar {
        display: none;
        position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
        background: #fff; border-top: 1px solid #e2e8f0;
        padding: 12px 20px; align-items: center; justify-content: space-between;
        box-shadow: 0 -4px 16px rgba(0,0,0,0.08);
    }
    .no-mobile-bar-info { display: flex; flex-direction: column; }
    .no-mobile-bar-count { font-size: 12px; color: #718096; font-weight: 600; }
    .no-mobile-bar-total { font-size: 18px; font-weight: 800; color: #1a5c38; }
    @media (max-width: 900px) {
        .no-mobile-bar { display: flex; }
        .no-page { padding-bottom: 100px !important; }
    }

    .no-btn-primary {
        display: inline-flex; align-items: center; gap: 6px;
        background: #1a5c38; color: #fff; border: none; padding: 12px 28px;
        border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer;
        transition: all 0.2s; text-decoration: none;
    }
    .no-btn-primary:hover { background: #236b43; }
    .no-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    .no-btn-outline {
        display: inline-flex; align-items: center; gap: 6px;
        background: #fff; color: #4a5568; border: 1px solid #e2e8f0; padding: 12px 28px;
        border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer;
        transition: all 0.2s; text-decoration: none;
    }
    .no-btn-outline:hover { border-color: #1a5c38; color: #1a5c38; }
    .no-btn-outline:disabled { opacity: 0.4; cursor: not-allowed; }

    .no-btn-submit {
        display: inline-flex; align-items: center; gap: 8px;
        background: linear-gradient(135deg, #1a5c38, #236b43); color: #fff; border: none;
        padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 700;
        cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(26,92,56,0.25);
    }
    .no-btn-submit:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(26,92,56,0.3); }
    .no-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    .no-spinner {
        width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
        border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite;
        display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Empty States */
    .no-empty { text-align: center; padding: 60px 20px; }
    .no-empty h2, .no-empty h3 { font-size: 20px; font-weight: 700; color: #1a202c; margin: 0 0 8px; }
    .no-empty p { font-size: 14px; color: #718096; margin: 0 0 20px; }
    .no-empty-sm { text-align: center; padding: 40px 20px; color: #718096; font-size: 14px; }

    /* Confirmation Page */
    .no-confirm-page { max-width: 560px; margin: 0 auto; padding: 40px 0; }
    .no-confirm-header { text-align: center; margin-bottom: 32px; }
    .no-confirm-check {
        width: 72px; height: 72px; border-radius: 50%;
        background: linear-gradient(135deg, #1a5c38, #22863a);
        display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;
        box-shadow: 0 8px 24px rgba(26,92,56,0.3);
    }
    .no-confirm-header h1 { font-size: 26px; font-weight: 800; color: #1a202c; margin: 0 0 8px; }
    .no-confirm-header p { font-size: 15px; color: #718096; margin: 0; }

    .no-confirm-card {
        background: #fff; border: 1px solid #e2e8f0; border-radius: 16px;
        overflow: hidden; margin-bottom: 24px;
    }
    .no-confirm-card-header {
        display: flex; justify-content: space-between; align-items: center;
        padding: 16px 24px; background: #f7fafc; border-bottom: 1px solid #e2e8f0;
    }
    .no-confirm-card-header span:first-child { font-size: 13px; font-weight: 600; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; }
    .no-confirm-ordernum { font-size: 20px; font-weight: 800; color: #1a5c38; }
    .no-confirm-details { padding: 20px 24px; }
    .no-confirm-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; }
    .no-confirm-label { font-size: 14px; color: #718096; }
    .no-confirm-value { font-size: 14px; font-weight: 600; color: #1a202c; }
    .no-confirm-highlight { color: #1a5c38; }
    .no-confirm-divider { height: 1px; background: #e2e8f0; margin: 8px 0; }
    .no-confirm-total-row { padding-top: 12px; }
    .no-confirm-total { font-size: 22px; font-weight: 800; color: #1a5c38; }
    .no-confirm-note {
        display: flex; align-items: flex-start; gap: 10px; padding: 14px 24px;
        background: #eff6ff; border-top: 1px solid #dbeafe; font-size: 13px; color: #3b82f6;
    }
    .no-confirm-note i { flex-shrink: 0; margin-top: 1px; }
    .no-confirm-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

    /* Confirmation Modal */
    .no-modal-overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
        z-index: 9998; display: flex; align-items: center; justify-content: center; padding: 20px;
    }
    .no-modal {
        background: #fff; border-radius: 20px; padding: 32px; max-width: 420px; width: 100%;
        box-shadow: 0 20px 60px rgba(0,0,0,0.2); text-align: center;
    }
    .no-modal-icon {
        width: 56px; height: 56px; border-radius: 14px; background: #f0faf4;
        display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;
        font-size: 24px; color: #1a5c38;
    }
    .no-modal h3 { font-size: 20px; font-weight: 700; color: #1a202c; margin: 0 0 8px; }
    .no-modal > p { font-size: 14px; color: #718096; margin: 0 0 16px; }
    .no-modal-summary {
        background: #f7fafc; border-radius: 12px; padding: 16px; margin-bottom: 16px; text-align: left;
    }
    .no-modal-row {
        display: flex; justify-content: space-between; padding: 6px 0;
        font-size: 13px; color: #4a5568;
    }
    .no-modal-row strong { color: #1a202c; }
    .no-modal-total { border-top: 1px solid #e2e8f0; margin-top: 4px; padding-top: 10px; }
    .no-modal-total strong { color: #1a5c38; font-size: 16px; }
    .no-modal-note { font-size: 12px; color: #a0aec0; margin: 0 0 20px; }
    .no-modal-actions { display: flex; gap: 12px; justify-content: center; }
    .no-modal-actions .no-btn-outline { flex: 1; }
    .no-modal-actions .no-btn-submit { flex: 1; padding: 12px 20px; font-size: 14px; }

    /* Submission Progress Overlay */
    .no-submit-overlay {
        position: fixed; inset: 0; background: rgba(255,255,255,0.92); backdrop-filter: blur(8px);
        z-index: 9999; display: flex; align-items: center; justify-content: center;
    }
    .no-submit-box { text-align: center; max-width: 360px; }
    .no-submit-spinner {
        width: 48px; height: 48px; border: 4px solid #e2e8f0; border-top-color: #1a5c38;
        border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 20px;
    }
    .no-submit-box h3 { font-size: 18px; font-weight: 700; color: #1a202c; margin: 0 0 12px; }
    .no-submit-steps {
        display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #a0aec0;
        margin-bottom: 16px;
    }
    .no-step-active-txt { color: #1a5c38; font-weight: 600; }
    .no-step-done-txt { color: #22863a; font-weight: 600; }
    .no-step-done-txt::before { content: '\\2713 '; }
    .no-submit-note { font-size: 12px; color: #a0aec0; }

    /* Skeletons */
    .no-skel-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
    .no-skel-card {
        height: 140px; background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
        background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 14px;
    }
    .no-skel-prod {
        height: 200px; background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
        background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 12px;
    }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
`;

export default ScheduledNewOrder;
