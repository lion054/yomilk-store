import Layout from "../components/layout/Layout";
import Link from "next/link";
import { useCart } from "../hooks";
import { useMemo } from "react";
import CrossSellSlider from "../components/sliders/CrossSellSlider";
import { getVendorFromProductCode } from "../lib/vendorMapping";
import { formatCurrency } from "../lib/formatters";
import { getProductImageUrl } from "../lib/imageProxy";

const Cart = () => {
    const { cart, incrementItem, decrementItem, removeFromCart, clearCart } = useCart();

    // Calculate cart values
    const cartItems = cart.map((item, index) => {
        const p = (item.product || {}) as any;
        return {
            id: item.itemCode,
            cartIndex: index,
            title: item.itemName,
            image: getProductImageUrl(p),
            price: item.uom?.price || 0,
            original_price: (item.product as any)?.original_price,
            quantity: item.quantity,
            vendor: getVendorFromProductCode(item.itemCode)
        };
    });

    // Group cart items by vendor
    const itemsByVendor = useMemo(() => {
        const grouped: any = {};
        cartItems.forEach((item: any) => {
            if (!grouped[item.vendor]) {
                grouped[item.vendor] = [];
            }
            grouped[item.vendor].push(item);
        });
        return grouped;
    }, [cartItems]);

    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const savings = cartItems.reduce((total, item) => total + ((item.original_price || item.price) - item.price) * item.quantity, 0);
    const MINIMUM_ORDER = 15;
    const belowMinimum = subtotal < MINIMUM_ORDER;

    // Calculate VAT from cart items' salesVATRate
    const vatAmount = cart.reduce((total, item) => {
        const price = item.uom?.price || 0;
        const rate = item.salesVATRate || 0;
        // Price is VAT-inclusive, so VAT = price - (price / (1 + rate/100))
        const vat = rate > 0 ? price - (price / (1 + rate / 100)) : 0;
        return total + (vat * item.quantity);
    }, 0);

    return (
        <>
            <Layout parent="Home" sub="Shop" subChild="Cart">
                <section className="cart-page-section">
                    <style>{`
                        .cart-page-section {
                            padding: 40px 0 60px;
                            background: var(--sf-gray-50);
                        }

                        .cart-container {
                            display: grid;
                            grid-template-columns: 1fr 380px;
                            gap: 32px;
                            margin-bottom: 50px;
                        }

                        @media (max-width: 968px) {
                            .cart-page-section .container {
                                max-width: 100% !important;
                                padding: 0 16px !important;
                                width: 100% !important;
                            }
                            .cart-container {
                                grid-template-columns: 1fr;
                                gap: 20px;
                            }
                            .cart-page-section {
                                padding-bottom: 100px;
                            }
                            .cart-summary .checkout-btn {
                                display: none;
                            }
                        }

                        @media (max-width: 640px) {
                            .cart-page-section { padding: 16px 0 40px; }
                            .container { padding: 0 16px !important; }
                            .cart-header { margin-bottom: 20px; }
                            .cart-header h1 { font-size: 20px; margin-bottom: 4px; }
                            .cart-header p { font-size: 13px; }
                            .vendor-header {
                                padding: 12px 16px;
                                border-radius: 10px 10px 0 0;
                                flex-direction: column;
                                align-items: flex-start;
                                gap: 10px;
                            }
                            .vendor-info-header { width: 100%; flex-wrap: wrap; gap: 8px; }
                            .vendor-name { font-size: 13px; font-weight: 700; }
                            .vendor-item-count { font-size: 10px; padding: 2px 8px; }
                            .vendor-subtotal { width: 100%; justify-content: space-between; }
                            .vendor-subtotal-amount { font-size: 15px; }
                            .cart-items { padding: 12px 16px; border-radius: 0 0 10px 10px; overflow: hidden; }
                            .cart-item { gap: 10px; padding: 12px 0; flex-wrap: nowrap; overflow: visible; }
                            .cart-item:hover { padding: 12px 0; margin: 0; background: none; border-radius: 0; }
                            img.cart-item-image { width: 56px; height: 56px; flex-shrink: 0; }
                            .cart-item-details { min-width: 0; flex: 1; overflow: hidden; }
                            .cart-item-name { font-size: 13px; margin-bottom: 4px; word-break: break-word; overflow-wrap: break-word; }
                            .cart-item-price-row { margin-bottom: 8px; flex-wrap: wrap; }
                            .cart-item-quantity { flex-wrap: nowrap; }
                            .qty-btn { padding: 6px 10px; min-width: 44px; min-height: 44px; font-size: 18px; }
                            .qty-value { font-size: 14px; padding: 0 10px; min-width: 36px; }
                            .remove-btn { width: 40px; height: 40px; font-size: 20px; flex-shrink: 0; }
                            .cart-item-remove { margin-left: 0; flex-shrink: 0; align-self: flex-start; }
                            .cart-actions { flex-direction: column; gap: 8px; margin-top: 20px; padding-top: 20px; }
                            .cart-actions button, .cart-actions a { width: 100%; text-align: center; justify-content: center; }
                            .cart-summary { padding: 20px 16px; border-radius: 12px; position: static !important; top: auto !important; }
                            .summary-total-amount { font-size: 20px; }
                            .checkout-btn { padding: 14px; font-size: 14px; width: 100%; }
                            .vendor-section { margin-bottom: 16px; }
                            .cart-items-empty { padding: 40px 20px; }
                            .cart-items-empty h2 { font-size: 18px; }
                            .cart-items-empty p { font-size: 14px; }
                        }

                        @media (max-width: 480px) {
                            .container { padding: 0 12px !important; }
                            .cart-header h1 { font-size: 18px; }
                            .cart-header p { font-size: 12px; }
                            .vendor-header { padding: 10px 12px; gap: 8px; }
                            .vendor-name { font-size: 12px; }
                            .vendor-item-count { font-size: 9px; padding: 2px 6px; }
                            .vendor-subtotal-amount { font-size: 14px; }
                            .vendor-subtotal-label { font-size: 11px; }
                            .cart-items { padding: 10px 12px; }
                            img.cart-item-image { width: 48px; height: 48px; }
                            .cart-item-name { font-size: 12px; }
                            .cart-item-price { font-size: 13px; }
                            .cart-item-original-price { font-size: 11px; }
                            .cart-items-empty { padding: 30px 16px; }
                            .cart-items-empty h2 { font-size: 16px; }
                            .cart-items-empty p { font-size: 13px; margin-bottom: 16px; }
                            .cart-summary { padding: 16px 12px; }
                            .summary-title { font-size: 11px; margin-bottom: 8px; }
                            .summary-row { font-size: 13px; }
                            .summary-total-amount { font-size: 18px; }
                            .mobile-checkout-bar { padding: 10px 16px; }
                            .mobile-checkout-amount { font-size: 18px; }
                            .mobile-checkout-btn { padding: 12px 20px; font-size: 14px; }
                        }

                        .cart-header {
                            margin-bottom: 40px;
                        }

                        .cart-header h1 {
                            font-size: 36px;
                            font-weight: 700;
                            color: var(--sf-gray-800);
                            margin: 0 0 10px 0;
                            letter-spacing: -0.5px;
                        }

                        .cart-header p {
                            color: var(--sf-gray-600);
                            font-size: 16px;
                            margin: 0;
                            font-weight: 500;
                        }

                        .vendor-section {
                            margin-bottom: 32px;
                        }

                        .vendor-section:last-of-type {
                            margin-bottom: 0;
                        }

                        .vendor-header {
                            background: var(--sf-gradient-green);
                            padding: 16px 24px;
                            border-radius: var(--sf-radius-2xl) var(--sf-radius-2xl) 0 0;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            box-shadow: 0 2px 8px rgba(59, 183, 126, 0.15);
                        }

                        .vendor-info-header {
                            display: flex;
                            align-items: center;
                            gap: 12px;
                            color: white;
                        }

                        .vendor-info-header i {
                            font-size: 20px;
                        }

                        .vendor-name {
                            font-size: 16px;
                            font-weight: 700;
                            letter-spacing: 0.3px;
                        }

                        .vendor-item-count {
                            font-size: 12px;
                            background: rgba(255, 255, 255, 0.2);
                            padding: 4px 10px;
                            border-radius: 12px;
                            font-weight: 600;
                        }

                        .vendor-subtotal {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            color: white;
                        }

                        .vendor-subtotal-label {
                            font-size: var(--sf-text-base);
                            font-weight: 500;
                        }

                        .vendor-subtotal-amount {
                            font-size: var(--sf-text-2xl);
                            font-weight: 800;
                        }

                        .cart-items {
                            background: white;
                            border-radius: 0 0 var(--sf-radius-2xl) var(--sf-radius-2xl);
                            padding: 32px;
                            box-shadow: var(--sf-shadow-lg);
                            border: var(--sf-border);
                            border-top: none;
                            transition: var(--sf-transition-slow);
                        }

                        .cart-items-empty {
                            text-align: center;
                            padding: 60px 30px;
                            background: white;
                            border-radius: var(--sf-radius-2xl);
                        }

                        .cart-items-empty h2 {
                            color: var(--sf-gray-800);
                            margin-bottom: 15px;
                        }

                        .cart-items-empty p {
                            color: var(--sf-gray-700);
                            font-size: 16px;
                            margin-bottom: 20px;
                        }

                        .cart-item {
                            display: flex;
                            gap: 20px;
                            padding: 20px 0;
                            border-bottom: var(--sf-border);
                            align-items: flex-start;
                            transition: var(--sf-transition-slow);
                        }

                        .cart-item:last-child {
                            border-bottom: none;
                        }

                        .cart-item:hover {
                            background: linear-gradient(135deg, rgba(59, 183, 126, 0.03) 0%, rgba(45, 150, 104, 0.02) 100%);
                            padding: 20px;
                            margin: 0 -20px;
                            border-radius: var(--sf-radius-xl);
                            border-bottom-color: var(--sf-info-border);
                        }

                        img.cart-item-image {
                            width: 80px;
                            height: 80px;
                            object-fit: contain;
                            flex-shrink: 0;
                        }

                        .cart-item-details {
                            flex: 1;
                        }

                        .cart-item-name {
                            font-size: var(--sf-text-lg);
                            font-weight: 700;
                            color: var(--sf-gray-900);
                            margin: 0 0 8px 0;
                        }

                        .cart-item-price-row {
                            display: flex;
                            align-items: center;
                            gap: 12px;
                            margin-bottom: 12px;
                        }

                        .cart-item-price {
                            font-size: var(--sf-text-md);
                            font-weight: 700;
                            color: var(--sf-green-500);
                        }

                        .cart-item-original-price {
                            font-size: var(--sf-text-base);
                            color: #9ca3af;
                            text-decoration: line-through;
                        }

                        .cart-item-quantity {
                            display: flex;
                            align-items: center;
                            gap: 0;
                            border: var(--sf-border-light);
                            border-radius: var(--sf-radius-md);
                            width: fit-content;
                        }

                        .qty-btn {
                            background: none;
                            border: none;
                            padding: 8px 10px;
                            cursor: pointer;
                            color: var(--sf-gray-700);
                            transition: var(--sf-transition-fast);
                            font-size: 16px;
                            display: flex;
                            align-items: center;
                        }

                        .qty-btn:hover {
                            color: var(--sf-green-500);
                        }

                        .qty-value {
                            padding: 0 12px;
                            font-weight: 600;
                            font-size: var(--sf-text-md);
                            color: var(--sf-gray-900);
                            min-width: 30px;
                            text-align: center;
                        }

                        .cart-item-remove {
                            margin-left: auto;
                            padding-top: 0;
                        }

                        .remove-btn {
                            background: none;
                            border: none;
                            color: var(--sf-danger-500);
                            cursor: pointer;
                            font-size: 20px;
                            transition: var(--sf-transition-fast);
                            padding: 0;
                            width: 44px;
                            height: 44px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }

                        .remove-btn:hover {
                            background: #ffebeb;
                            border-radius: var(--sf-radius-md);
                        }

                        .cart-actions {
                            display: flex;
                            gap: 12px;
                            margin-top: 30px;
                            padding-top: 30px;
                            border-top: var(--sf-border-light);
                        }

                        .btn-secondary {
                            flex: 1;
                            padding: 14px 20px;
                            background: white;
                            border: 2px solid #ececec;
                            border-radius: var(--sf-radius-xl);
                            color: var(--sf-gray-900);
                            font-weight: 700;
                            cursor: pointer;
                            transition: var(--sf-transition);
                        }

                        .btn-secondary:hover {
                            border-color: var(--sf-green-500);
                            color: var(--sf-green-500);
                        }

                        .btn-secondary--danger {
                            color: var(--sf-danger-500);
                        }

                        .btn-secondary--danger:hover {
                            border-color: var(--sf-danger-500);
                            color: var(--sf-danger-500);
                        }

                        .cart-summary {
                            background: white;
                            border-radius: var(--sf-radius-2xl);
                            padding: 28px;
                            box-shadow: var(--sf-shadow-lg);
                            border: var(--sf-border);
                            height: fit-content;
                            position: sticky;
                            top: 100px;
                            transition: var(--sf-transition-slow);
                        }

                        .summary-section {
                            margin-bottom: 20px;
                            padding-bottom: 20px;
                            border-bottom: var(--sf-border-light);
                        }

                        .summary-section:last-of-type {
                            border-bottom: none;
                            margin-bottom: 0;
                            padding-bottom: 0;
                        }

                        .summary-title {
                            font-size: var(--sf-text-sm);
                            font-weight: 700;
                            color: #636363;
                            text-transform: uppercase;
                            margin-bottom: 12px;
                            letter-spacing: 0.5px;
                        }

                        .summary-row {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 10px;
                            font-size: var(--sf-text-base);
                        }

                        .summary-row-label {
                            color: var(--sf-gray-700);
                        }

                        .summary-row-value {
                            font-weight: 700;
                            color: var(--sf-gray-900);
                        }

                        .summary-row-value--muted {
                            font-size: var(--sf-text-base);
                            color: #636363;
                        }

                        .summary-savings {
                            background: linear-gradient(135deg, var(--sf-info-bg) 0%, var(--sf-green-100) 100%);
                            padding: 12px;
                            border-radius: var(--sf-radius-lg);
                            text-align: center;
                        }

                        .summary-savings-text {
                            font-size: var(--sf-text-sm);
                            color: #2a9d65;
                            margin-bottom: 4px;
                        }

                        .summary-savings-amount {
                            font-size: var(--sf-text-2xl);
                            font-weight: 800;
                            color: var(--sf-green-500);
                        }

                        .summary-total {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-top: 20px;
                        }

                        .summary-total-label {
                            font-size: var(--sf-text-md);
                            font-weight: 700;
                            color: var(--sf-gray-900);
                        }

                        .summary-total-amount {
                            font-size: 24px;
                            font-weight: 800;
                            color: var(--sf-green-500);
                        }

                        .checkout-btn {
                            width: 100%;
                            padding: 16px;
                            background: var(--sf-gradient-green);
                            color: white;
                            border: none;
                            border-radius: var(--sf-radius-xl);
                            font-weight: 700;
                            font-size: var(--sf-text-md);
                            cursor: pointer;
                            transition: var(--sf-transition-slow);
                            box-shadow: var(--sf-shadow-green);
                            margin-top: 20px;
                        }

                        .checkout-btn:hover:not(:disabled) {
                            transform: translateY(-2px);
                            box-shadow: var(--sf-shadow-green-lg);
                        }

                        .checkout-btn:disabled {
                            opacity: 0.5;
                            cursor: not-allowed;
                        }

                        .cart-min-order-warning {
                            font-size: 12px;
                            color: #e74c3c;
                            text-align: center;
                            margin-bottom: 8px;
                            font-weight: 600;
                        }

                        .continue-shopping-btn {
                            display: inline-block;
                            padding: 14px 28px;
                            background: white;
                            border: 2px solid var(--sf-green-500);
                            color: var(--sf-green-500);
                            border-radius: var(--sf-radius-xl);
                            font-weight: 700;
                            text-decoration: none;
                            transition: var(--sf-transition);
                            margin-bottom: 30px;
                        }

                        .continue-shopping-btn:hover {
                            background: var(--sf-green-500);
                            color: white;
                        }

                        /* Mobile sticky checkout bar */
                        .mobile-checkout-bar {
                            display: none;
                        }
                        @media (max-width: 968px) {
                            .mobile-checkout-bar {
                                display: flex;
                                position: fixed;
                                bottom: 60px;
                                left: 0;
                                right: 0;
                                z-index: 100;
                                background: white;
                                padding: 12px 20px;
                                padding-bottom: max(12px, env(safe-area-inset-bottom));
                                box-shadow: 0 -4px 20px rgba(0,0,0,0.12);
                                align-items: center;
                                justify-content: space-between;
                                gap: 16px;
                                border-top: 1px solid #e5e7eb;
                            }
                            .mobile-checkout-total {
                                display: flex;
                                flex-direction: column;
                                min-width: 0;
                            }
                            .mobile-checkout-label {
                                font-size: 11px;
                                color: var(--sf-gray-600);
                                font-weight: 600;
                                text-transform: uppercase;
                                letter-spacing: 0.3px;
                            }
                            .mobile-checkout-amount {
                                font-size: 20px;
                                font-weight: 800;
                                color: var(--sf-green-500);
                                line-height: 1.2;
                            }
                            .mobile-checkout-btn {
                                flex-shrink: 0;
                                padding: 14px 28px;
                                background: var(--sf-gradient-green);
                                color: white;
                                border: none;
                                border-radius: var(--sf-radius-xl);
                                font-weight: 700;
                                font-size: 15px;
                                cursor: pointer;
                                box-shadow: var(--sf-shadow-green);
                                white-space: nowrap;
                                min-height: 48px;
                            }
                        }
                    `}</style>

                    <div className="container">
                        <div className="cart-header">
                            <h1>Your Shopping Cart</h1>
                            <p>Review your items before proceeding to checkout</p>
                        </div>

                        {cartItems.length === 0 ? (
                            <div className="cart-items-empty">
                                <h2>Your cart is empty</h2>
                                <p>Add some products to get started</p>
                                <Link href="/store">
                                    <button className="sf-btn sf-btn--green sf-btn--md">
                                        Continue Shopping
                                    </button>
                                </Link>
                            </div>
                        ) : (
                            <div className="cart-container">
                                <div>
                                    {/* Loop through each vendor */}
                                    {Object.entries(itemsByVendor).map(([vendor, items]: any) => {
                                        const vendorSubtotal = (items as any).reduce((total: any, item: any) => total + (item.price * item.quantity), 0);

                                        return (
                                            <div key={vendor} className="vendor-section">
                                                {/* Vendor Header */}
                                                <div className="vendor-header">
                                                    <div className="vendor-info-header">
                                                        <i className="fi-rs-shop"></i>
                                                        <span className="vendor-name">{vendor}</span>
                                                        <span className="vendor-item-count">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
                                                    </div>
                                                    <div className="vendor-subtotal">
                                                        <span className="vendor-subtotal-label">Subtotal:</span>
                                                        <span className="vendor-subtotal-amount">{formatCurrency(vendorSubtotal)}</span>
                                                    </div>
                                                </div>

                                                {/* Vendor Items */}
                                                <div className="cart-items">
                                                    {items.map((item: any) => (
                                                        <div key={item.id} className="cart-item">
                                                            <img src={item.image} alt={item.title} className="cart-item-image" />
                                                            <div className="cart-item-details">
                                                                <h3 className="cart-item-name">{item.title}</h3>
                                                                <div className="cart-item-price-row">
                                                                    <span className="cart-item-price">{formatCurrency(item.price)}</span>
                                                                    {item.original_price && (
                                                                        <span className="cart-item-original-price">{formatCurrency(item.original_price)}</span>
                                                                    )}
                                                                </div>
                                                                <div className="cart-item-quantity">
                                                                    <button className="qty-btn" onClick={() => decrementItem(item.cartIndex)} aria-label={"Decrease quantity of " + item.title}>−</button>
                                                                    <span className="qty-value" aria-label={"Quantity: " + item.quantity}>{item.quantity}</span>
                                                                    <button className="qty-btn" onClick={() => incrementItem(item.cartIndex)} aria-label={"Increase quantity of " + item.title}>+</button>
                                                                </div>
                                                            </div>
                                                            <div className="cart-item-remove">
                                                                <button className="remove-btn" onClick={() => {
                                                                    if (window.confirm(`Remove "${item.title || item.itemName}" from cart?`)) {
                                                                        removeFromCart(item.cartIndex);
                                                                    }
                                                                }}>×</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <CrossSellSlider cartItems={cart} title="You May Also Like" />

                                    <div className="cart-actions">
                                        <Link href="/store" className="btn-secondary">
                                            Continue Shopping
                                        </Link>
                                        <button className="btn-secondary btn-secondary--danger" onClick={clearCart}>
                                            Clear Cart
                                        </button>
                                    </div>
                                </div>

                                <div className="cart-summary">
                                    <div className="summary-section">
                                        <div className="summary-title">Order Summary</div>
                                        <div className="summary-row">
                                            <span className="summary-row-label">Subtotal</span>
                                            <span className="summary-row-value">{formatCurrency(subtotal)}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span className="summary-row-label">Delivery</span>
                                            <span className="summary-row-value summary-row-value--muted">Calculated at checkout</span>
                                        </div>
                                        <div className="summary-row">
                                            <span className="summary-row-label">Tax (VAT incl.)</span>
                                            <span className="summary-row-value">{formatCurrency(vatAmount)}</span>
                                        </div>
                                    </div>

                                    {savings > 0 && (
                                        <div className="summary-section">
                                            <div className="summary-savings">
                                                <div className="summary-savings-text">You're saving</div>
                                                <div className="summary-savings-amount">{formatCurrency(savings)}</div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="summary-total">
                                        <span className="summary-total-label">Estimated Total</span>
                                        <span className="summary-total-amount">{formatCurrency(subtotal)}</span>
                                    </div>

                                    {belowMinimum && (
                                        <p className="cart-min-order-warning">
                                            Minimum order is ${MINIMUM_ORDER.toFixed(2)}. Add ${(MINIMUM_ORDER - subtotal).toFixed(2)} more.
                                        </p>
                                    )}
                                    <Link href={belowMinimum ? '#' : '/checkout'}>
                                        <button type="button" className="checkout-btn" disabled={belowMinimum}>Proceed to Checkout</button>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Sticky mobile checkout bar */}
                        {cartItems.length > 0 && (
                            <div className="mobile-checkout-bar">
                                <div className="mobile-checkout-total">
                                    <span className="mobile-checkout-label">Total</span>
                                    <span className="mobile-checkout-amount">{formatCurrency(subtotal)}</span>
                                </div>
                                <Link href={belowMinimum ? '#' : '/checkout'}>
                                    <button type="button" className="mobile-checkout-btn" disabled={belowMinimum}>
                                        {belowMinimum ? `Add $${(MINIMUM_ORDER - subtotal).toFixed(2)} more` : 'Checkout →'}
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                </section>
            </Layout>
        </>
    );
};

export default Cart;
