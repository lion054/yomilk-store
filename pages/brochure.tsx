/**
 * Brochure Page — redesigned to 2026 minimalist standards
 * All logic preserved 100%. Visual/CSS overhaul only.
 */
import Layout from "../components/layout/Layout";
import { useState, useRef } from "react";
import apiClient from "../config/api";
import { useLocation } from "../contexts/LocationContext";
import { useCategories } from "../hooks/useCategories";
import { filterProductsByCategory, filterProductsBySupCategory, isSuperCategory } from "../lib/categoryMappings";
import { logger } from "../lib/logger";
import { getProductImageUrl, PRODUCT_FALLBACK_IMAGE } from "../lib/imageProxy";

/* ─────────────────────────────────────────────────────────
   Shared styles (web UI + print PDF)
───────────────────────────────────────────────────────── */
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap');

/* ── Page shell ── */
.br-page {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #f4f9f6;
    min-height: 100vh;
    padding-bottom: 80px;
}

/* ── Hero ── */
.br-hero {
    background: linear-gradient(135deg, #1a5c38 0%, #153d25 60%, #1e5233 100%);
    padding: 64px 0 56px;
    position: relative;
    overflow: hidden;
    margin-bottom: 56px;
}
.br-hero::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 60% 80% at 80% 50%, rgba(26,92,56,0.18) 0%, transparent 70%);
    pointer-events: none;
}
.br-hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; color: #1a5c38;
    background: rgba(26,92,56,0.12); border: 1px solid rgba(26,92,56,0.25);
    padding: 5px 12px; border-radius: 99px;
    margin-bottom: 18px;
}
.br-hero-title {
    font-size: clamp(2rem, 4vw, 2.8rem);
    font-weight: 900; color: #fff;
    letter-spacing: -0.04em; line-height: 1.1;
    margin: 0 0 12px 0;
}
.br-hero-title span { color: #1a5c38; }
.br-hero-text {
    font-size: 1rem; color: rgba(255,255,255,0.65);
    max-width: 480px; line-height: 1.6; margin: 0;
}

/* ── Section header ── */
.br-section-head {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 32px;
}
.br-section-head-left { display: flex; align-items: center; gap: 14px; }
.br-section-accent {
    width: 4px; height: 34px; background: #1a5c38;
    border-radius: 4px; flex-shrink: 0;
}
.br-section-title {
    font-size: 1.25rem; font-weight: 900; color: #0d1f12;
    letter-spacing: -0.03em; margin: 0;
    font-family: 'Plus Jakarta Sans', sans-serif;
}

/* ── Category grid ── */
.br-cat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 64px;
}

/* ── Category card ── */
.br-cat-card {
    background: #fff;
    border: 1.5px solid #dae8d8;
    border-radius: 18px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
    display: flex; flex-direction: column;
}
.br-cat-card:hover {
    transform: translateY(-3px);
    border-color: #1a5c38;
    box-shadow: 0 8px 28px rgba(11,46,26,0.1);
}
.br-cat-card-header {
    background: linear-gradient(135deg, #f0faf5 0%, #e4f5ec 100%);
    padding: 32px 24px;
    display: flex; align-items: center; justify-content: center;
    border-bottom: 1.5px solid #dae8d8;
    min-height: 120px;
}
.br-cat-icon {
    width: 68px; height: 68px;
    background: #fff; border-radius: 16px;
    border: 1.5px solid #dae8d8;
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; color: #1a5c38;
    box-shadow: 0 4px 12px rgba(26,92,56,0.15);
}
.br-cat-body { padding: 20px 22px 22px; flex: 1; display: flex; flex-direction: column; }
.br-cat-title {
    font-size: 1rem; font-weight: 800; color: #0d1f12;
    letter-spacing: -0.02em; margin: 0 0 8px 0;
    font-family: 'Plus Jakarta Sans', sans-serif;
}
.br-cat-desc {
    font-size: 0.8rem; color: #8a9e8a; line-height: 1.55;
    margin: 0 0 18px 0; flex: 1;
}
.br-cat-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 11px;
    background: #1a5c38; color: #fff;
    border: none; border-radius: 10px;
    font-size: 13px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; transition: background 0.2s;
    letter-spacing: -0.01em;
}
.br-cat-btn:hover:not(:disabled) { background: #1a5c38; }
.br-cat-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.br-cat-btn.loading { background: #1a5c38; }

/* ── Loading skeleton ── */
.br-cat-skeleton {
    background: #fff; border: 1.5px solid #eef2ee;
    border-radius: 18px; overflow: hidden;
}
.br-skel-header { height: 120px; background: linear-gradient(90deg, #f4f9f6 0%, #e8f2ec 50%, #f4f9f6 100%); background-size: 200% 100%; animation: skelshine 1.4s ease infinite; }
.br-skel-body { padding: 20px 22px; }
.br-skel-line { height: 12px; border-radius: 6px; background: linear-gradient(90deg, #f0f7f2 0%, #ddeae3 50%, #f0f7f2 100%); background-size: 200% 100%; animation: skelshine 1.4s ease infinite; margin-bottom: 10px; }
.br-skel-line.w70 { width: 70%; }
.br-skel-line.w90 { width: 90%; }
.br-skel-line.w50 { width: 50%; }
@keyframes skelshine { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

/* ── Benefits row ── */
.br-benefits {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
}
.br-benefit {
    background: #fff; border: 1.5px solid #dae8d8;
    border-radius: 14px; padding: 22px 20px;
    text-align: center;
}
.br-benefit-icon {
    width: 52px; height: 52px;
    background: #f0faf5; border-radius: 13px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; color: #1a5c38;
    margin: 0 auto 12px;
}
.br-benefit-title {
    font-size: 0.875rem; font-weight: 800; color: #0d1f12;
    letter-spacing: -0.02em; margin: 0 0 5px 0;
    font-family: 'Plus Jakarta Sans', sans-serif;
}
.br-benefit-desc { font-size: 0.75rem; color: #8a9e8a; line-height: 1.4; margin: 0; }

/* ── Brochure controls bar ── */
.br-controls-bar {
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px; flex-wrap: wrap;
    padding: 18px 24px;
    background: #fff; border-bottom: 1.5px solid #dae8d8;
    position: sticky; top: 0; z-index: 10;
    font-family: 'Plus Jakarta Sans', sans-serif;
}
.br-controls-info { font-size: 13px; font-weight: 500; color: #7a9a7a; }
.br-controls-info strong { color: #0d1f12; font-weight: 800; }
.br-btn-ghost {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 16px; background: transparent;
    border: 1.5px solid #dae8d8; border-radius: 10px;
    font-size: 13px; font-weight: 700; color: #4a664a;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; transition: all 0.2s; text-decoration: none;
}
.br-btn-ghost:hover { background: #f4f9f6; border-color: #b8ccb8; }
.br-btn-green {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px;
    background: linear-gradient(135deg, #1a5c38, #0d3d22);
    border: none; border-radius: 10px;
    font-size: 13px; font-weight: 700; color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; transition: all 0.2s;
    box-shadow: 0 3px 10px rgba(26,92,56,0.35);
}
.br-btn-green:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(26,92,56,0.45); }

/* ── PDF brochure pages ── */
.br-pdf-wrap {
    background: #e8ede9;
    padding: 32px 20px;
    display: flex; flex-direction: column;
    align-items: center; gap: 0;
}
.br-pdf-footer-note {
    margin-top: 24px; text-align: center;
    font-size: 11px; color: #8a9e8a;
    font-family: 'Plus Jakarta Sans', sans-serif;
}

/* ─────────────────────────────────────
   A4 BROCHURE PAGE  (print / PDF)
───────────────────────────────────── */
.br-a4-page {
    width: 210mm; height: 297mm;
    background: #ffffff;
    box-shadow: 0 4px 24px rgba(0,0,0,0.1);
    margin: 0 auto;
    display: flex; flex-direction: column;
    position: relative; overflow: hidden;
    font-family: Arial, sans-serif;
}

/* A4 header */
.br-a4-head {
    background: #1a5c38;
    padding: 10px 12px 10px;
    position: relative; overflow: hidden;
    flex-shrink: 0;
}
.br-a4-orb {
    position: absolute; border-radius: 50%; pointer-events: none;
}
.br-a4-orb-1 { top:-20px; right:20px; width:80px; height:80px; background: radial-gradient(circle, rgba(26,92,56,0.35) 0%, transparent 70%); }
.br-a4-orb-2 { bottom:-24px; right:100px; width:90px; height:90px; background: radial-gradient(circle, rgba(26,92,56,0.2) 0%, transparent 70%); }

.br-a4-brand {
    display: flex; align-items: center; justify-content: center;
    gap: 10px; margin-bottom: 6px;
}
.br-a4-logo { height: 20px; width: auto; }
.br-a4-brand-name {
    font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.9);
    letter-spacing: 2.5px; text-transform: uppercase;
}

.br-a4-tagline-wrap {
    display: flex; align-items: center; justify-content: center; gap: 12px;
}
.br-a4-fresh-text {
    font-family: 'Brush Script MT', cursive;
    font-size: 28px; font-weight: 400; color: #1a5c38;
    line-height: 1;
}
.br-a4-badge {
    background: #1a5c38; color: #fff;
    padding: 5px 16px; border-radius: 6px;
    font-size: 16px; font-weight: 700; letter-spacing: 0.5px;
    transform: skewX(-6deg); display: inline-block;
}
.br-a4-badge-inner { display: inline-block; transform: skewX(6deg); }

.br-a4-subtitle {
    text-align: center; font-size: 9px; color: rgba(255,255,255,0.5);
    margin-top: 5px; letter-spacing: 0.5px;
}

/* A4 product grid */
.br-a4-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 6px; flex: 1;
    padding: 6px 8px 4px;
    overflow: hidden;
}

/* A4 product card */
.br-a4-product {
    border: 1px solid #eaeaea; border-radius: 8px;
    background: #fff; padding: 6px;
    display: flex; flex-direction: column;
    text-align: center; overflow: hidden;
    page-break-inside: avoid;
}
.br-a4-img-wrap {
    width: 100%; height: 118px;
    background: #f8f9fa; border-radius: 5px;
    overflow: hidden; border: 1px solid #f0f0f0;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 5px;
}
.br-a4-img { max-width: 90%; max-height: 90%; object-fit: contain; display: block; }
.br-a4-product-name {
    font-size: 9.5px; font-weight: 700; color: #1a1a1a;
    line-height: 1.25; margin: 0 0 2px 0;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    min-height: 22px;
}
.br-a4-product-desc {
    font-size: 7.5px; color: #636363; margin: 0 0 4px 0; min-height: 12px;
    display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
}
.br-a4-price-row {
    margin-top: auto; display: flex; justify-content: flex-end;
    padding-top: 3px;
}
.br-a4-price {
    background: #1a5c38; color: #fff;
    padding: 3px 10px; border-radius: 5px;
    font-size: 10.5px; font-weight: 700;
    min-width: 56px; text-align: center;
    transform: skewX(-8deg); display: inline-block;
}
.br-a4-price-inner { display: inline-block; transform: skewX(8deg); }

/* A4 footer */
.br-a4-footer {
    background: #1a5c38; color: rgba(255,255,255,0.85);
    padding: 4px 10px; text-align: center;
    font-size: 7px; font-weight: 700; letter-spacing: 0.5px;
    flex-shrink: 0;
}

/* Rotating animation for loading icon */
@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.rotating { animation: rotate 0.8s linear infinite; }

/* Print media */
@media print {
    .br-controls-bar, .br-pdf-footer-note { display: none !important; }
    .br-a4-page { box-shadow: none; }
}
@media (max-width: 600px) {
    .br-cat-grid { grid-template-columns: 1fr 1fr; }
    .br-benefits { grid-template-columns: 1fr 1fr; }
    .br-a4-page { width: 100%; height: auto; }
    .br-a4-grid { grid-template-columns: repeat(3, 1fr); }
}
`;

/* ── Brochure A4 Page component ── */
function BrochurePage({ title, subtitle, products, pageNumber, isLast }: any) {
    return (
        <div className="br-a4-page" style={{ pageBreakAfter: isLast ? "auto" : "always", breakAfter: isLast ? "auto" : "page" }}>
            {/* Header */}
            <div className="br-a4-head">
                <div className="br-a4-orb br-a4-orb-1" />
                <div className="br-a4-orb br-a4-orb-2" />
                <div className="br-a4-brand">
                    <img src="/assets/imgs/theme/snappy-logo.png" alt="Snappy Fresh" className="br-a4-logo" />
                    <span className="br-a4-brand-name">Snappy Fresh</span>
                </div>
                <div className="br-a4-tagline-wrap">
                    <span className="br-a4-fresh-text">Fresh</span>
                    <span className="br-a4-badge"><span className="br-a4-badge-inner">Everyday!</span></span>
                </div>
                <div className="br-a4-subtitle">{title} &bull; {subtitle}</div>
            </div>

            {/* Product grid */}
            <div className="br-a4-grid">
                {products.map((product: any, idx: any) => <ProductCard key={idx} product={product} />)}
            </div>

            {/* Footer */}
            <div className="br-a4-footer">
                SNAPPY FRESH &bull; Fast, Fresh, Reliable Delivery &bull; Page {pageNumber}
            </div>
        </div>
    );
}

/* ── Product card for A4 brochure ── */
function ProductCard({ product }: any) {
    const price = product?.price || product?.Price || product?.storeUnitPrice || product?.sellingUnitPrice || 0;
    const name = product?.ItemName || product?.itemName || product?.name || "Fresh Product";
    const image = getProductImageUrl(product);
    const description = product?.ItemDescription || product?.itemDescription || product?.description || "";

    return (
        <div className="br-a4-product">
            <div className="br-a4-img-wrap">
                <img
                    src={image}
                    alt={name}
                    className="br-a4-img"
                    onError={(e: any) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.dataset['fallback']) {
                            target.dataset['fallback'] = '1';
                            target.src = PRODUCT_FALLBACK_IMAGE;
                        }
                    }}
                />
            </div>
            <div className="br-a4-product-name">{name}</div>
            {description && <div className="br-a4-product-desc">{description}</div>}
            <div className="br-a4-price-row">
                <div className="br-a4-price">
                    <span className="br-a4-price-inner">${typeof price === 'number' ? price.toFixed(2) : price}</span>
                </div>
            </div>
        </div>
    );
}

/* ── Main Brochure component ── */
function Brochure() {
    const { getShortAddress } = useLocation();
    const brochureRef = useRef(null);
    const { categories, loading: categoriesLoading } = useCategories();

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState("list");

    /**
     * Convert all cross-origin images inside an element to inline base64 data URLs
     * so html2canvas can render them in the PDF.
     */
    const inlineImages = async (container: HTMLElement) => {
        const imgs = container.querySelectorAll('img');
        const promises = Array.from(imgs).map(async (img) => {
            if (!img.src || img.src.startsWith('data:')) return;
            try {
                const resp = await fetch(img.src, { mode: 'cors' });
                if (!resp.ok) return;
                const blob = await resp.blob();
                const dataUrl = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                });
                img.src = dataUrl;
            } catch {
                // If CORS fails, proxy through a canvas fallback
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;
                    const tempImg = new window.Image();
                    tempImg.crossOrigin = 'anonymous';
                    await new Promise<void>((resolve, reject) => {
                        tempImg.onload = () => resolve();
                        tempImg.onerror = () => reject();
                        tempImg.src = img.src;
                    });
                    canvas.width = tempImg.naturalWidth;
                    canvas.height = tempImg.naturalHeight;
                    ctx.drawImage(tempImg, 0, 0);
                    img.src = canvas.toDataURL('image/jpeg', 0.85);
                } catch {
                    // Leave original src — html2canvas will try its best
                }
            }
        });
        await Promise.allSettled(promises);
    };

    const downloadPDF = async () => {
        const element = brochureRef.current;
        if (!element) return;
        try {
            // Convert cross-origin images to base64 so they render in the PDF
            await inlineImages(element as HTMLElement);
            await new Promise(resolve => setTimeout(resolve, 300));
            const html2pdf = (await import('html2pdf.js')).default;
            const opt = {
                margin: 0,
                filename: `snappy-fresh-${(selectedCategory as any)?.ItmsGrpNam || 'brochure'}.pdf`,
                image: { type: 'png' as 'png', quality: 0.95 },
                html2canvas: { scale: 1.5, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false, imageTimeout: 15000, windowHeight: (element as any).scrollHeight },
                jsPDF: { format: 'a4', orientation: 'portrait' as 'portrait', unit: 'mm', compress: true },
                pagebreak: { mode: 'avoid-all', before: '.br-a4-page' }
            };
            html2pdf().set(opt).from(element).save();
        } catch (error) {
            logger.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        }
    };

    const handleSelectCategory = async (category: any) => {
        setSelectedCategory(category);
        setLoading(true);
        try {
            const response = await ( apiClient as any).getProducts(200, 1, '', '');
            let allProductsList = response?.message || response?.data || [];
            allProductsList = Array.isArray(allProductsList) ? allProductsList : [];
            // Normalize image URLs so brochure thumbnails render consistently.
            allProductsList.forEach((p: any) => {
                const resolvedImage = getProductImageUrl(p, '');
                if (resolvedImage) {
                    p.image = resolvedImage;
                }
            });
            setAllProducts(allProductsList);
            const categoryCode = category.ItmsGrpCod;
            const categoryName = category.ItmsGrpNam || category.name;
            let filteredProducts = allProductsList;
            if (isSuperCategory(categoryName)) filteredProducts = filterProductsBySupCategory(allProductsList, categoryName);
            else filteredProducts = filterProductsByCategory(allProductsList, categoryCode);
            setProducts(filteredProducts);
        } catch (err) {
            logger.error('Error loading products:', err);
            setProducts([]); setAllProducts([]);
        } finally {
            setViewMode("brochure"); setLoading(false);
        }
    };

    const getRandomProducts = (categoryProducts: any, count: any, _allProductsList: any = []) => {
        if (!Array.isArray(categoryProducts) || categoryProducts.length === 0) return [];
        const shuffled = [...categoryProducts].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, shuffled.length));
    };

    /* ── Brochure PDF view ── */
    if (viewMode === "brochure" && selectedCategory) {
        const page1Products = getRandomProducts(products, 12, allProducts);
        const page2Products = getRandomProducts(products, 12, allProducts);

        return (
            <Layout parent="Home" sub="Pages" subChild="Brochures">
                <style>{styles}</style>

                {/* Sticky controls */}
                <div className="br-controls-bar">
                    <button className="br-btn-ghost" onClick={() => { setViewMode("list"); setSelectedCategory(null); }}>
                        ← Back to Categories
                    </button>
                    <div className="br-controls-info">
                        <strong>{(selectedCategory as any).ItmsGrpNam}</strong> &bull; Delivery: {getShortAddress()}
                    </div>
                    <button className="br-btn-green" onClick={downloadPDF}>
                        <i className="fi-rs-download"></i>
                        Download PDF
                    </button>
                </div>

                {/* A4 pages */}
                <div ref={brochureRef} className="br-pdf-wrap">
                    <BrochurePage title={(selectedCategory as any).ItmsGrpNam} subtitle="Weekly Specials" products={page1Products} pageNumber={1} isLast={false} />
                    <BrochurePage title={(selectedCategory as any).ItmsGrpNam} subtitle="More Great Deals" products={page2Products} pageNumber={2} isLast={true} />
                </div>

                <div className="br-pdf-footer-note">© Snappy Fresh {new Date().getFullYear()} · Prices and availability subject to change</div>
            </Layout>
        );
    }

    /* ── List / category selection view ── */
    return (
        <Layout parent="Home" sub="Pages" subChild="Brochures">
            <style>{styles}</style>
            <div className="br-page">

                {/* Hero */}
                <div className="br-hero">
                    <div className="container">
                        <div className="br-hero-eyebrow">
                            <i className="fi-rs-file-pdf"></i>
                            Product Brochures
                        </div>
                        <h1 className="br-hero-title">
                            Snappy Fresh<br /><span>Weekly Specials</span>
                        </h1>
                        <p className="br-hero-text">
                            Professional product brochures with current pricing and special offers — ready to print or share.
                        </p>
                    </div>
                </div>

                <div className="container">

                    {/* Category brochures */}
                    <div style={{ marginBottom: 64 }}>
                        <div className="br-section-head">
                            <div className="br-section-head-left">
                                <div className="br-section-accent"></div>
                                <h2 className="br-section-title">Category Brochures</h2>
                            </div>
                            <span style={{ fontSize: 13, color: '#8a9e8a', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
                                {categories.length} categories
                            </span>
                        </div>

                        {categoriesLoading ? (
                            /* Skeleton grid */
                            <div className="br-cat-grid">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="br-cat-skeleton">
                                        <div className="br-skel-header"></div>
                                        <div className="br-skel-body">
                                            <div className="br-skel-line w70"></div>
                                            <div className="br-skel-line w90"></div>
                                            <div className="br-skel-line w50"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : categories.length > 0 ? (
                            <div className="br-cat-grid">
                                {categories.map((category: any) => {
                                    const isThisLoading = loading && (selectedCategory as any)?.ItmsGrpCod === category.ItmsGrpCod;
                                    return (
                                        <div key={category.ItmsGrpCod} className="br-cat-card" onClick={() => handleSelectCategory(category)}>
                                            <div className="br-cat-card-header">
                                                <img
                                                    src="/assets/imgs/theme/snappy-logofull.png"
                                                    alt="Snappy Fresh"
                                                    style={{ maxHeight: 52, width: 'auto', objectFit: 'contain', opacity: isThisLoading ? 0.5 : 1, transition: 'opacity 0.2s' }}
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                />
                                            </div>
                                            <div className="br-cat-body">
                                                <h3 className="br-cat-title">{category.ItmsGrpNam}</h3>
                                                <p className="br-cat-desc">
                                                    Browse our {category.ItmsGrpNam.toLowerCase()} selection with current prices, available now for instant or scheduled delivery.
                                                </p>
                                                <button disabled={isThisLoading} className={`br-cat-btn${isThisLoading ? ' loading' : ''}`}>
                                                    <i className={isThisLoading ? "fi-rs-spinner rotating" : "fi-rs-file-pdf"}></i>
                                                    {isThisLoading ? 'Loading…' : 'View Brochure'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '64px 20px', background: '#fff', borderRadius: 18, border: '1.5px solid #dae8d8' }}>
                                <div style={{ fontSize: 48, opacity: 0.15, marginBottom: 14 }}>📄</div>
                                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, color: '#0d1f12', letterSpacing: '-0.02em', marginBottom: 8 }}>No Categories Found</h3>
                                <p style={{ color: '#8a9e8a', fontSize: '0.875rem' }}>Categories will appear here once they are available.</p>
                            </div>
                        )}
                    </div>

                    {/* Benefits */}
                    <div className="br-section-head">
                        <div className="br-section-head-left">
                            <div className="br-section-accent"></div>
                            <h2 className="br-section-title">Why Use Our Brochures?</h2>
                        </div>
                    </div>
                    <div className="br-benefits">
                        {[
                            { icon: "fi-rs-printer", emoji: "🖨️", title: "Print Ready", desc: "Professional A4 format optimised for printing." },
                            { icon: "fi-rs-download", emoji: "⬇️", title: "Save as PDF", desc: "Download brochures for offline sharing." },
                            { icon: "fi-rs-refresh", emoji: "🔄", title: "Fresh Updates", desc: "Products and prices refresh with each view." },
                            { icon: "fi-rs-location-alt", emoji: "📍", title: "Location Specific", desc: "Delivery info tailored to your area." },
                        ].map((b, i) => (
                            <div key={i} className="br-benefit">
                                <div className="br-benefit-icon"><i className={b.icon}></i></div>
                                <div className="br-benefit-title">{b.title}</div>
                                <p className="br-benefit-desc">{b.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginBottom: 40 }}></div>
                </div>
            </div>
        </Layout>
    );
}

export default Brochure;
