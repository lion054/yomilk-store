import { useEffect, FC } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { AppProps } from "next/app";
import { toast } from "react-toastify";
import "react-perfect-scrollbar/dist/css/styles.css";
import 'react-toastify/dist/ReactToastify.css';
import "react-responsive-modal/styles.css";
// Swiper Slider
import "swiper/css";
import "swiper/css/navigation";
// Global CSS
import "../public/assets/css/core.css";
import "../public/assets/css/ui.css";
import "../public/assets/css/checkout-modern.css";
import "../styles/register.css";
import SessionWrapper from "../components/SessionWrapper";
import RouteLoader from "./../components/elements/RouteLoader";
import ScrollRestoration from "../components/ScrollRestoration";
import ScrollToTop from "../components/ScrollToTop";
import AppErrorBoundary from "../components/AppErrorBoundary";

// Lazy-load non-critical UI components (not needed at first paint)
const CartDrawer = dynamic(() => import("../components/CartDrawer"), { ssr: false });
const AuthModal = dynamic(() => import("../components/modals/AuthModal"), { ssr: false });
const WhatsAppFab = dynamic(() => import("../components/WhatsAppFab"), { ssr: false });
const CookieConsent = dynamic(() => import("../components/CookieConsent"), { ssr: false });
const DebtWarningPopup = dynamic(() => import("../components/DebtWarningPopup"), { ssr: false });
// Context API with TanStack Query (includes Auth, Cart, Products, Wishlist, Compare, QuickView, Filters, CartDrawer)
import AppProvider from "../contexts/AppProvider";
import { useCartDrawer } from "../contexts/CartDrawerContext";

const MyApp: FC<AppProps> = ({ Component, pageProps }) => {
    const router = useRouter();
    const isVendorPortal = router.pathname.startsWith('/vendor');

    return (
        <AppProvider>
            <AppErrorBoundary>
                <SessionWrapper>
                    <RouteLoader />
                    <ScrollRestoration />
                    <Component {...pageProps} />
                    <ScrollToTop />
                    {!isVendorPortal && <WhatsAppFab />}
                    <CartDrawerWrapper />
                    <AuthModal />
                    <CookieConsent />
                    <DebtWarningPopup />
                    <StockWarningListener />
                    <WebVitalsReporter />
                </SessionWrapper>
            </AppErrorBoundary>
        </AppProvider>
    );
};

// CartDrawer wrapper to access context
const CartDrawerWrapper: FC = () => {
    const { isOpen, closeCartDrawer } = useCartDrawer();
    return <CartDrawer isOpen={isOpen} onClose={closeCartDrawer} />;
};

// Listen for stock warning events from CartContext
const StockWarningListener: FC = () => {
    useEffect(() => {
        const handler = (e: Event) => {
            const customEvent = e as CustomEvent<{ itemName: string; available: number }>;
            const { itemName, available } = customEvent.detail || {};
            toast.warning(`Only ${available} unit(s) of "${itemName}" available in stock.`);
        };
        window.addEventListener('cart:stockWarning', handler);
        return () => window.removeEventListener('cart:stockWarning', handler);
    }, []);
    return null;
};

// Core Web Vitals tracking (CLS, FCP, FID, LCP, TTFB)
const WebVitalsReporter: FC = () => {
    useEffect(() => {
        if (typeof window === 'undefined') return;
        import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
            const report = (metric: any) => {
                // Send to analytics if consent given
                if (process.env.NODE_ENV === 'development') {
                    console.log(`[Web Vital] ${metric.name}: ${metric.value.toFixed(2)}`);
                }
                // Google Analytics integration
                if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', metric.name, {
                        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
                        event_label: metric.id,
                        non_interaction: true,
                    });
                }
            };
            onCLS(report);
            onFCP(report);
            onLCP(report);
            onTTFB(report);
            onINP(report);
        }).catch(() => {
            // web-vitals not available — skip silently
        });
    }, []);
    return null;
};

// ServiceWorkerReset removed — it was nuking ALL caches on every page load,
// defeating PWA benefits and causing asset re-download race conditions.

export default MyApp;
