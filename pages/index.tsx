import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useEffect, useMemo } from "react";
import Layout from "../components/layout/Layout";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import apiClient from "../config/api";
import { useAuth } from "../contexts/AuthContext";
import { useProducts } from "../hooks";
import { useCategories } from "../hooks/useCategories";
import { getCategoryIcon } from "../services/CategoryIconsService";
import SEO from "../components/common/SEO";
import { pageSeoConfig, generateOrganizationSchema, generateLocalBusinessSchema } from "../config/seo";
import { HeroBanner } from "../components/home/HeroBanner";

// Lazy load below-fold components — reduces initial JS bundle
const SingleProduct = dynamic(() => import("../components/ecommerce/SingleProduct"));
const VendorSlider = dynamic(() => import("../components/sliders/VendorSlider"), { ssr: false });


function Index2() {
    const { isAuthenticated, user } = useAuth();
    const { products: allProducts, isReady } = useProducts();
    const { categories } = useCategories();
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [countdowns, setCountdowns] = useState({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!mounted || !isAuthenticated) return;
        const fetchSchedules = async () => {
            try {
                setLoading(true);
                const response = await (apiClient as any).getStoreOrderSchedules();
                if (response === null) return;
                let scheduleData = response?.values || response?.data || response || [];
                if (Array.isArray(response)) scheduleData = response;
                if (!Array.isArray(scheduleData)) scheduleData = [];
                const transformedSchedules = scheduleData.slice(0, 4).map((schedule: any) => ({
                    id: schedule.docEntry || schedule.DocEntry || schedule.id || schedule.ID,
                    name: (schedule.remark && schedule.remark.trim()) ? schedule.remark : `Schedule #${schedule.docNum || schedule.docEntry || 'N/A'}`,
                    locations: schedule.availableDeliveryDates || schedule.AvailableDeliveryDates || [],
                    orderWindowStart: schedule.startDate || schedule.StartDate,
                    orderWindowEnd: schedule.endDate || schedule.EndDate,
                    startDeliveryDate: schedule.startDeliveryDate || schedule.StartDeliveryDate,
                    endDeliveryDate: schedule.endDeliveryDate || schedule.EndDeliveryDate,
                    status: schedule.status || schedule.Status || 'Open'
                }));
                setSchedules(transformedSchedules);
            } catch (err) {
                // silently fail
            } finally {
                setLoading(false);
            }
        };
        fetchSchedules();
    }, [mounted, isAuthenticated]);

    useEffect(() => {
        // Skip countdown if no schedules
        if (!schedules || schedules.length === 0) return;

        const updateCountdowns = () => {
            const newCountdowns: any = {};
            (schedules as any).forEach((schedule: any) => {
                if (schedule.orderWindowEnd) {
                    const endTime = new Date(schedule.orderWindowEnd).getTime();
                    const timeLeft = endTime - Date.now();
                    newCountdowns[schedule.id] = timeLeft > 0 ? timeLeft : 0;
                } else {
                    newCountdowns[schedule.id] = 0;
                }
            });
            setCountdowns(newCountdowns);
        };
        updateCountdowns();
        // Reduce update frequency: update every 5 seconds instead of 1 second
        const interval = setInterval(updateCountdowns, 5000);
        return () => clearInterval(interval);
    }, [schedules]);

    const formatCountdown = (ms: any) => {
        if (ms <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 };
        return {
            days: Math.floor(ms / (1000 * 60 * 60 * 24)),
            hours: Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            mins: Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)),
            secs: Math.floor((ms % (1000 * 60)) / 1000),
        };
    };

    const { topPicks, featuredProducts } = useMemo(() => {
        if (!allProducts || allProducts.length === 0) return { topPicks: [], featuredProducts: [] };
        // Use first items instead of randomizing (faster, more cache-friendly)
        const picks = allProducts.slice(0, 5);
        const featured = allProducts.slice(5, 15);
        return { topPicks: picks, featuredProducts: featured };
    }, [allProducts]);

    const homeSeoConfig = pageSeoConfig['/'];
    const organizationSchema = generateOrganizationSchema();
    const localBusinessSchema = generateLocalBusinessSchema();
    const combinedSchema = { '@context': 'https://schema.org', '@graph': [organizationSchema, localBusinessSchema] };

    const quickShops = useMemo(() => {
        if (!categories || categories.length === 0) return [];
        return categories.map((cat: any) => {
            const name = cat.ItmsGrpNam || cat.name || 'Category';
            const iconMeta = getCategoryIcon(name);
            return {
                emoji: iconMeta.icon,
                label: name.split(' ').map((w: any) => w.charAt(0) + w.slice(1).toLowerCase()).join(' '),
                categoryCode: cat.ItmsGrpCod,
                bg: iconMeta.bgColor,
                initials: iconMeta.initials || name.slice(0, 2).toUpperCase(),
            };
        });
    }, [categories]);

    return (
        <>
            <SEO {...homeSeoConfig} structuredData={combinedSchema as any} />
            <Layout noBreadcrumb="d-none">
                <style jsx global>{`
                    /* ═══ SNAPPYFRESH HOME — from-scratch redesign ═══ */
                    :root {
                        --sf-green: #1a5c38;
                        --sf-green-mid: #236b43;
                        --sf-emerald: #2ecc71;
                        --sf-emerald-light: #27ae60;
                        --sf-emerald-bright: #00d26a;
                        --sf-accent: #ff6b35;
                        --sf-red: #e74c3c;
                        --sf-bg: #f5f6f8;
                        --sf-dark: #111a14;
                        --sf-text: #222;
                        --sf-muted: #6b7c74;
                        --sf-border: #e0e6e2;
                        --sf-card-shadow: 0 2px 12px rgba(26,92,56,.08);
                        --sf-radius: 14px;
                    }
                    .sf-home { max-width: 1400px; margin: 0 auto; padding: 24px 24px 48px; }
                    .sf-section-gap { margin-bottom: 36px; }
                    .sf-section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
                    .sf-section-title { font-size: 18px; font-weight: 800; color: var(--sf-dark); letter-spacing: -.3px; text-transform: uppercase; margin: 0; }
                    .sf-view-all { color: var(--sf-green); font-weight: 700; font-size: 13px; cursor: pointer; background: none; border: none; font-family: inherit; text-decoration: none; }

                    /* ── Quick Shops ── */
                    .sf-qs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px; padding-bottom: 4px; }
                    .sf-qs-item {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 10px;
                        padding: 14px 12px;
                        cursor: pointer;
                        transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
                        text-decoration: none;
                        border: 1px solid rgba(17,26,20,.06);
                        border-radius: 20px;
                        background:
                            linear-gradient(180deg, rgba(255,255,255,.96), rgba(246,249,247,.96));
                        box-shadow: 0 8px 24px rgba(17,26,20,.05);
                        min-height: 152px;
                    }
                    .sf-qs-item:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 14px 34px rgba(17,26,20,.10);
                        border-color: rgba(26,92,56,.14);
                    }
                    .sf-qs-circle {
                        width: 84px;
                        height: 84px;
                        border-radius: 26px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 34px;
                        box-shadow:
                            inset 0 1px 0 rgba(255,255,255,.28),
                            0 14px 24px rgba(0,0,0,.10);
                        position: relative;
                        overflow: hidden;
                    }
                    .sf-qs-circle::before {
                        content: "";
                        position: absolute;
                        inset: 1px;
                        border-radius: 24px;
                        background: linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,0));
                        pointer-events: none;
                    }
                    .sf-qs-icon {
                        position: relative;
                        z-index: 1;
                        line-height: 1;
                    }
                    .sf-qs-fallback {
                        display: none;
                    }
                    .sf-qs-copy {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 4px;
                    }
                    .sf-qs-label {
                        font-size: 12px;
                        font-weight: 800;
                        color: var(--sf-dark);
                        text-align: center;
                        line-height: 1.25;
                        letter-spacing: -.01em;
                    }
                    .sf-qs-hint {
                        font-size: 10px;
                        font-weight: 700;
                        letter-spacing: .08em;
                        text-transform: uppercase;
                        color: #7b8a83;
                    }

                    /* ── Hero Banner ── */
                    .sf-hero {
                        border-radius: var(--sf-radius); overflow: hidden; position: relative;
                        height: 280px; display: flex; align-items: center;
                        transition: background-image 0.5s ease;
                    }
                    .sf-hero-img-overlay {
                        position: absolute; inset: 0;
                        background: linear-gradient(90deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.05) 100%);
                        z-index: 1;
                    }
                    .sf-hero-content { padding: 40px; z-index: 2; position: relative; }
                    .sf-hero-tag { background: var(--sf-accent); color: #fff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 4px; display: inline-block; margin-bottom: 12px; text-transform: uppercase; }
                    .sf-hero-title { font-size: 42px; font-weight: 800; color: #fff; line-height: 1.1; margin-bottom: 20px; text-shadow: 0 2px 8px rgba(0,0,0,0.3); }
                    .sf-hero-title span { color: var(--sf-emerald-bright); }
                    .sf-hero-cta { background: var(--sf-emerald-bright); color: var(--sf-dark); border: none; padding: 12px 28px; border-radius: 10px; font-family: inherit; font-size: 15px; font-weight: 800; cursor: pointer; display: inline-block; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s; }
                    .sf-hero-cta:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.2); }
                    .sf-hero-arrow {
                        position: absolute; top: 50%; transform: translateY(-50%);
                        background: rgba(255,255,255,0.15); -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);
                        border: none; border-radius: 50%; width: 40px; height: 40px;
                        display: flex; align-items: center; justify-content: center;
                        cursor: pointer; color: #fff; font-size: 20px; z-index: 3; transition: background 0.2s;
                    }
                    .sf-hero-arrow:hover { background: rgba(255,255,255,0.3); }
                    .sf-hero-arrow-left { left: 14px; }
                    .sf-hero-arrow-right { right: 14px; }
                    .sf-hero-dots {
                        position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);
                        display: flex; gap: 6px; z-index: 3;
                    }
                    .sf-hero-dot {
                        width: 8px; height: 8px; border-radius: 4px; border: none; padding: 0;
                        background: rgba(255,255,255,0.35); cursor: pointer; transition: all 0.3s ease;
                    }
                    .sf-hero-dot.active { width: 24px; background: #fff; }
                    .sf-hero-swipe-hint { display: none; font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.40); z-index: 3; pointer-events: none; position: absolute; bottom: 38px; right: 16px; }
                    @media (max-width: 768px) {
                        .sf-hero-swipe-hint { display: block; }
                    }

                    /* ── Product Grid (5 columns) ── */
                    .sf-product-grid {
                        display: grid;
                        grid-template-columns: repeat(5, 1fr);
                        gap: 18px;
                    }
                    @media (max-width: 1199px) {
                        .sf-product-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; }
                    }
                    @media (max-width: 991px) {
                        .sf-product-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; }
                    }
                    @media (max-width: 768px) {
                        /* Category grid: horizontal scroll on tablet */
                        .sf-qs-grid {
                            display: flex;
                            overflow-x: auto;
                            scroll-snap-type: x mandatory;
                            -webkit-overflow-scrolling: touch;
                            scrollbar-width: none;
                            gap: 8px;
                            padding-bottom: 4px;
                        }
                        .sf-qs-grid::-webkit-scrollbar { display: none; }
                        .sf-qs-item {
                            flex: 0 0 80px;
                            scroll-snap-align: start;
                            min-height: auto;
                        }
                        .sf-qs-circle {
                            width: 52px;
                            height: 52px;
                            font-size: 20px;
                        }
                    }

                    @media (max-width: 640px) {
                        .sf-product-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
                    }

                    /* ── Product Carousel ── */
                    .sf-carousel { margin-bottom: 36px; }
                    .sf-carousel-wrap { position: relative; }
                    .sf-carousel-track { display: flex; gap: 14px; overflow-x: auto; padding: 4px 2px 8px; scrollbar-width: none; }
                    .sf-carousel-track::-webkit-scrollbar { display: none; }
                    .sf-carousel-track > * { flex-shrink: 0; width: calc((100% - 14px * 4) / 5); min-width: 180px; }
                    .sf-carousel-arrow { position: absolute; top: 50%; transform: translateY(-50%); background: #fff; border: 2px solid var(--sf-border); border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 18px; color: var(--sf-dark); box-shadow: 0 2px 12px rgba(0,0,0,.12); z-index: 5; transition: all .2s; }
                    .sf-carousel-arrow:hover { background: var(--sf-green); color: #fff; border-color: var(--sf-green); }
                    .sf-carousel-arrow.left { left: -18px; }
                    .sf-carousel-arrow.right { right: -18px; }

                    /* ── Image Promo Banners ── */
                    .sf-promo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                    .sf-img-promo {
                        position: relative; border-radius: var(--sf-radius); overflow: hidden;
                        min-height: 200px; display: flex; align-items: flex-end;
                        text-decoration: none; color: #fff;
                        transition: transform 0.3s ease, box-shadow 0.3s ease;
                        background: #2d7c4a;
                    }
                    .sf-img-promo:nth-child(2) {
                        background: #27ae60;
                    }
                    .sf-img-promo:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.18); color: #fff; }
                    .sf-img-promo-bg {
                        display: none;
                    }
                    .sf-img-promo-overlay {
                        position: absolute; inset: 0; z-index: 1;
                        background: linear-gradient(135deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 60%, transparent 100%);
                    }
                    .sf-img-promo-content { position: relative; z-index: 2; padding: 24px; width: 100%; }
                    .sf-img-promo-content h3 { font-size: 22px; font-weight: 900; margin: 0 0 4px; letter-spacing: -0.02em; }
                    .sf-img-promo-content p { font-size: 13px; opacity: 0.75; margin: 0 0 14px; }
                    .sf-img-promo-cta {
                        display: inline-block; background: rgba(255,255,255,0.18);
                        -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);
                        padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 700;
                        transition: background 0.2s;
                    }
                    .sf-img-promo:hover .sf-img-promo-cta { background: rgba(255,255,255,0.3); }

                    /* ── Other Services ── */
                    .sf-services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 16px; }
                    .sf-svc-item { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 12px; cursor: pointer; transition: transform .2s; text-decoration: none; }
                    .sf-svc-item:hover { transform: translateY(-3px); }
                    .sf-svc-circle { width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; box-shadow: 0 4px 14px rgba(0,0,0,.1); }
                    .sf-svc-label { font-size: 12px; font-weight: 700; color: var(--sf-dark); text-align: center; }

                    /* ── Schedule Cards ── */
                    .sf-sched-card { background: #fff; border: 1.5px solid var(--sf-border); border-radius: var(--sf-radius); overflow: hidden; transition: box-shadow .2s, transform .2s; height: 100%; display: flex; flex-direction: column; }
                    .sf-sched-card:hover { box-shadow: 0 8px 28px rgba(26,92,56,.14); transform: translateY(-3px); }
                    .sf-sched-header { background: linear-gradient(135deg, #1a5c38, #0d3d22); padding: 12px 16px; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #fff; }
                    .sf-sched-body { padding: 16px; flex: 1; display: flex; flex-direction: column; }
                    .sf-sched-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
                    .sf-sched-meta label { font-size: 9px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #636363; display: block; margin-bottom: 3px; }
                    .sf-sched-meta span { font-size: 12px; font-weight: 700; color: var(--sf-dark); }
                    .sf-sched-meta span.green { color: var(--sf-emerald-light); }
                    .sf-sched-countdown { background: #fffbf0; border: 1px solid rgba(255,193,7,.2); border-radius: 8px; padding: 10px 12px; margin-top: auto; margin-bottom: 12px; }
                    .sf-sched-countdown-label { font-size: 9px; font-weight: 800; color: #e59b00; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 6px; }
                    .sf-sched-digits { display: grid; grid-template-columns: repeat(4,1fr); gap: 4px; text-align: center; }
                    .sf-sched-dv { font-size: 16px; font-weight: 800; color: var(--sf-emerald-light); line-height: 1; margin-bottom: 2px; }
                    .sf-sched-dl { font-size: 8px; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: .06em; }
                    .sf-sched-cta { display: flex; align-items: center; justify-content: center; gap: 6px; background: #1a5c38; color: #fff; padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 700; text-decoration: none; transition: background .2s; }
                    .sf-sched-cta:hover { background: #27ae60; color: #fff; }

                    /* ── Loading ── */
                    .sf-loading { text-align: center; padding: 40px 0; }
                    .sf-spinner { width: 32px; height: 32px; border: 3px solid var(--sf-border); border-top-color: var(--sf-emerald-light); border-radius: 50%; animation: sfspin .7s linear infinite; margin: 0 auto; }
                    @keyframes sfspin { to { transform: rotate(360deg); } }

                    /* ── Skeleton Cards ── */
                    .sf-skel-card { background: #fff; border-radius: 14px; border: 1px solid #eee; padding: 14px; }
                    .sf-skel-img { width: 100%; aspect-ratio: 1; background: #f0f0f0; border-radius: 10px; margin-bottom: 12px; animation: sfpulse 1.5s ease-in-out infinite; }
                    .sf-skel-line { height: 12px; background: #f0f0f0; border-radius: 6px; margin-bottom: 8px; animation: sfpulse 1.5s ease-in-out infinite; }
                    @keyframes sfpulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

                    /* ── Responsive ── */
                    @media (max-width: 900px) {
                        .sf-hero { height: 220px; }
                        .sf-hero-arrow { display: none; }
                        .sf-promo-grid { grid-template-columns: 1fr; }
                        .sf-img-promo { min-height: 160px; }
                        .sf-img-promo-content h3 { font-size: 18px; }
                    }
                    @media (max-width: 768px) {
                        .sf-hero { height: 260px; border-radius: 18px; }
                        .sf-hero-img-overlay {
                            background: linear-gradient(105deg, rgba(8,32,18,0.88) 0%, rgba(8,32,18,0.62) 42%, rgba(8,32,18,0.18) 75%, rgba(8,32,18,0.04) 100%);
                        }
                        .sf-hero-content { padding: 24px 22px; max-width: 72%; }
                        .sf-hero-tag {
                            font-size: 10px;
                            padding: 5px 12px;
                            border-radius: 999px;
                            background: #FDC040;
                            color: #1a1a1a;
                            font-weight: 900;
                            letter-spacing: 0.06em;
                            margin-bottom: 10px;
                        }
                        .sf-hero-title { font-size: 30px; margin-bottom: 18px; text-shadow: 0 2px 12px rgba(0,0,0,0.4); }
                        .sf-hero-cta {
                            background: #3BB77E;
                            color: #fff;
                            font-size: 14px;
                            font-weight: 900;
                            padding: 12px 24px;
                            border-radius: 999px;
                            letter-spacing: -0.01em;
                            box-shadow: 0 6px 20px rgba(59,183,126,0.45);
                        }
                        .sf-hero-arrow { display: none; }
                        .sf-hero-dots { bottom: 12px; gap: 7px; }
                        .sf-hero-dot { width: 7px; height: 7px; }
                        .sf-hero-dot.active { width: 22px; height: 7px; }
                        .sf-promo-grid { grid-template-columns: 1fr; gap: 12px; }
                        .sf-img-promo { min-height: 180px; border-radius: 18px; }
                        .sf-img-promo-content h3 { font-size: 20px; font-weight: 900; }
                        .sf-img-promo-content p { font-size: 12px; }
                        .sf-img-promo-cta { font-size: 12px; padding: 7px 16px; }
                        .sf-product-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
                        .sf-section-gap { margin-bottom: 28px; }
                        .sf-services-grid { grid-template-columns: repeat(4, 1fr); gap: 14px; }
                        .sf-svc-item { padding: 10px 6px; gap: 7px; }
                        .sf-svc-circle { width: 58px; height: 58px; font-size: 24px; box-shadow: 0 6px 16px rgba(0,0,0,.12); }
                        .sf-svc-label { font-size: 10px; font-weight: 700; color: #1a1a1a; text-align: center; line-height: 1.3; }
                    }
                    @media (max-width: 480px) {
                        .sf-home { padding: 14px 12px 40px; }
                        .sf-hero { height: 240px; }
                        .sf-hero-title { font-size: 26px; }
                        .sf-hero-content { padding: 20px 18px; max-width: 80%; }
                        .sf-hero-cta { font-size: 13px; padding: 11px 20px; }
                        .sf-product-grid { gap: 10px; }
                        .sf-section-gap { margin-bottom: 24px; }
                        .sf-svc-circle { width: 52px; height: 52px; font-size: 22px; }
                        .sf-svc-label { font-size: 9px; }
                    }

                    /* === MOBILE REDESIGN: Color Palette === */
                    @media (max-width: 991px) {
                        :root {
                            --sf-dark: #1A1A1A;
                            --sf-section-title-color: #1A1A1A;
                            --sf-hero-overlay: linear-gradient(160deg, rgba(10,40,22,0.82) 0%, rgba(10,40,22,0.55) 55%, rgba(10,40,22,0.18) 100%);
                        }
                    }

                    /* === FORMAL MOBILE REDESIGN: Quick Shops === */
                    .sf-qs-grid-desktop {
                        display: grid;
                    }
                    .sf-qs-carousel-mobile {
                        display: none;
                    }
                    @media (max-width: 991px) {
                        .sf-qs-grid-desktop {
                            display: none !important;
                        }
                        .sf-qs-carousel-mobile {
                            display: block !important;
                        }
                        .sf-qs-swiper {
                            padding: 4px 2px 34px;
                        }
                        .swiper-pagination-bullet {
                            width: 8px;
                            height: 8px;
                            background: #D7DDD9;
                            opacity: 1;
                        }
                        .swiper-pagination-bullet-active {
                            width: 22px;
                            border-radius: 999px;
                            background: var(--sf-green);
                        }
                        .sf-qs-grid {
                            gap: 10px;
                        }
                        .sf-qs-item {
                            flex-direction: column;
                            align-items: center;
                            gap: 8px;
                            min-height: unset;
                            padding: 12px 8px 14px;
                            border-radius: 20px;
                            background: linear-gradient(180deg, #ffffff 0%, #f4f7f5 100%);
                            box-shadow: 0 6px 18px rgba(17,26,20,.07);
                            border: 1px solid rgba(26,92,56,.06);
                        }
                        .sf-qs-circle {
                            width: 72px !important;
                            height: 72px !important;
                            border-radius: 20px !important;
                            font-size: 30px !important;
                            flex-shrink: 0;
                            box-shadow: 0 8px 20px rgba(0,0,0,.12);
                        }
                        .sf-qs-circle::before {
                            border-radius: 18px;
                        }
                        .sf-qs-icon {
                            font-size: 30px;
                        }
                        .sf-qs-fallback {
                            display: none !important;
                        }
                        .sf-qs-copy {
                            align-items: center;
                            gap: 2px;
                        }
                        .sf-qs-label {
                            display: block !important;
                            font-size: 11px;
                            font-weight: 800;
                            color: #1a1a1a;
                            text-align: center;
                            line-height: 1.2;
                            letter-spacing: -0.01em;
                            max-width: 80px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }
                        .sf-qs-hint {
                            display: none;
                        }
                        .sf-qs-swiper {
                            padding: 4px 4px 38px !important;
                        }
                        .sf-section-title {
                            font-size: 16px;
                            font-weight: 900;
                            letter-spacing: 0.04em;
                            text-transform: uppercase;
                            color: #111a14;
                            padding-left: 10px;
                            border-left: 3px solid #3BB77E;
                            line-height: 1.2;
                        }
                        .sf-section-head {
                            margin-bottom: 14px;
                            align-items: flex-end;
                        }
                        .sf-view-all {
                            font-size: 12px;
                            color: #1a5c38;
                            font-weight: 700;
                        }
                    }
                `}</style>

                <div className="sf-home">
                    <h1 className="sr-only">Snappy Fresh — Fresh Grocery Delivery in Harare, Zimbabwe</h1>

                    {/* ═══ 1. QUICK SHOPS ═══ */}
                    <section className="sf-section-gap">
                        <div className="sf-section-head">
                            <h2 className="sf-section-title">Quick Shops</h2>
                        </div>
                        {/* Desktop Grid */}
                        <div className="sf-qs-grid sf-qs-grid-desktop">
                            {quickShops.map((cat: any, i: number) => (
                                <Link key={i} href={`/store?category=${cat.categoryCode}`} className="sf-qs-item">
                                    <div className="sf-qs-circle" style={{ background: cat.bg } as React.CSSProperties} data-initials={(cat as any).initials}>
                                        <span className="sf-qs-icon" aria-hidden="true">{cat.emoji}</span>
                                        <span className="sf-qs-fallback" aria-hidden="true">{cat.initials}</span>
                                    </div>
                                    <div className="sf-qs-copy">
                                        <span className="sf-qs-label">{cat.label}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Mobile Carousel */}
                        <div className="sf-qs-carousel-mobile">
                            <Swiper
                                modules={[Navigation, Pagination]}
                                spaceBetween={14}
                                slidesPerView={3.4}
                                pagination={{ clickable: true, dynamicBullets: true }}
                                className="sf-qs-swiper"
                            >
                                {quickShops.map((cat: any, i: number) => (
                                    <SwiperSlide key={i}>
                                        <Link href={`/store?category=${cat.categoryCode}`} className="sf-qs-item">
                                            <div className="sf-qs-circle" style={{ background: cat.bg } as React.CSSProperties} data-initials={(cat as any).initials}>
                                                <span className="sf-qs-icon" aria-hidden="true">{cat.emoji}</span>
                                                <span className="sf-qs-fallback" aria-hidden="true">{cat.initials}</span>
                                            </div>
                                            <div className="sf-qs-copy">
                                                <span className="sf-qs-label">{cat.label}</span>
                                            </div>
                                        </Link>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </section>

                    {/* ═══ 2. HERO BANNER CAROUSEL ═══ */}
                    <HeroBanner />

                    {/* ═══ 3. SCHEDULED ORDERS (shown only for scheduled accounts) ═══ */}
                    {isAuthenticated && !user?.customer?.isVisitor && user?.customer?.isInstantDelivery === false && !loading && (
                        <section className="sf-section-gap">
                            {schedules.length > 0 ? (
                                <>
                                    <div className="sf-section-head">
                                        <h2 className="sf-section-title">Order Schedules</h2>
                                        <Link href="/scheduled-orders" className="sf-view-all">View All →</Link>
                                    </div>
                                    <div className="row g-3">
                                        {schedules.map((schedule: any) => {
                                            const ms = (countdowns as any)[schedule.id] || 0;
                                            const { days, hours, mins, secs } = formatCountdown(ms);
                                            return (
                                                <div key={schedule.id} className="col-lg-3 col-md-6">
                                                    <div className="sf-sched-card">
                                                        <div className="sf-sched-header">
                                                            <i className="fi-rs-marker" style={{ fontSize: 14 }} />
                                                            {schedule.name}
                                                        </div>
                                                        <div className="sf-sched-body">
                                                            <div className="sf-sched-meta">
                                                                <div>
                                                                    <label>Order Starts</label>
                                                                    <span>{schedule.orderWindowStart ? new Date(schedule.orderWindowStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</span>
                                                                </div>
                                                                <div>
                                                                    <label>Delivery</label>
                                                                    <span className="green">{schedule.startDeliveryDate ? new Date(schedule.startDeliveryDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                            <div className="sf-sched-countdown">
                                                                <div className="sf-sched-countdown-label">Order closes in</div>
                                                                <div className="sf-sched-digits">
                                                                    {[{ v: days, l: 'Days' }, { v: hours, l: 'Hrs' }, { v: mins, l: 'Min' }, { v: secs, l: 'Sec' }].map(({ v, l }, i) => (
                                                                        <div key={i}>
                                                                            <div className="sf-sched-dv">{String(v).padStart(2, '0')}</div>
                                                                            <div className="sf-sched-dl">{l}</div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <Link href="/scheduled-orders" className="sf-sched-cta">
                                                                <i className="fi-rs-shopping-bag" style={{ fontSize: 12 }} /> View Products
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f9f9f9', borderRadius: '12px' }}>
                                    <h3 style={{ color: '#1a1a1a', marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>📅 No Open Ordering Windows</h3>
                                    <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>Check back soon for your next scheduled order window.</p>
                                    <Link href="/scheduled-orders" className="sf-sched-cta" style={{ display: 'inline-block' }}>
                                        View All Schedules →
                                    </Link>
                                </div>
                            )}
                        </section>
                    )}

                    {/* ═══ 4. FRESH ARRIVALS (5 products, grid) ═══ */}
                    {!isReady && (
                        <section className="sf-section-gap">
                            <div className="sf-section-head"><h2 className="sf-section-title">Fresh Arrivals</h2></div>
                            <div className="sf-product-grid">
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className="sf-skel-card">
                                        <div className="sf-skel-img" />
                                        <div className="sf-skel-line" style={{ width: '80%' }} />
                                        <div className="sf-skel-line" style={{ width: '40%' }} />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                    {isReady && topPicks.length > 0 && (
                        <section className="sf-section-gap">
                            <div className="sf-section-head">
                                <h2 className="sf-section-title">Fresh Arrivals</h2>
                                <Link href="/store" className="sf-view-all">View All →</Link>
                            </div>
                            <div className="sf-product-grid">
                                {topPicks.map((p: any, i: number) => (
                                    <SingleProduct key={p.ItemCode || p.itemCode || i} product={p} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ═══ 5. WEEKLY DEALS (10 products, 2 rows of 5) ═══ */}
                    {isReady && featuredProducts.length > 0 && (
                        <section className="sf-section-gap">
                            <div className="sf-section-head">
                                <h2 className="sf-section-title">Weekly Deals</h2>
                                <Link href="/store" className="sf-view-all">View All →</Link>
                            </div>
                            <div className="sf-product-grid">
                                {featuredProducts.map((p: any, i: number) => (
                                    <SingleProduct key={p.ItemCode || p.itemCode || i} product={p} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ═══ 6. VENDORS ═══ */}
                    <section className="sf-section-gap">
                        <div className="sf-section-head">
                            <h2 className="sf-section-title">Shop By Vendors</h2>
                            <Link href="/vendors" className="sf-view-all">View All →</Link>
                        </div>
                        <VendorSlider />
                    </section>

                    {/* ═══ 7. PROMO BANNERS WITH IMAGES ═══ */}
                    <section className="sf-section-gap">
                        <div className="sf-promo-grid">
                            <Link href="/store" className="sf-img-promo">
                                <img src="/assets/imgs/banner/groceries.jpg" alt="Fresh Deals" className="sf-img-promo-bg" />
                                <div className="sf-img-promo-overlay" />
                                <div className="sf-img-promo-content">
                                    <h3>Fresh Deals</h3>
                                    <p>This week's top offers</p>
                                    <span className="sf-img-promo-cta">Shop Now →</span>
                                </div>
                            </Link>
                            <Link href="/store?category=100" className="sf-img-promo">
                                <img src="/assets/imgs/banner/dairy.jpg" alt="Dairy &amp; Milk" className="sf-img-promo-bg" />
                                <div className="sf-img-promo-overlay" />
                                <div className="sf-img-promo-content">
                                    <h3>Dairy &amp; Milk</h3>
                                    <p>Fresh from the farm</p>
                                    <span className="sf-img-promo-cta">Browse →</span>
                                </div>
                            </Link>
                        </div>
                    </section>

                    {/* ═══ 8. OTHER SERVICES ═══ */}
                    <section className="sf-section-gap">
                        <div className="sf-section-head">
                            <h2 className="sf-section-title">Other Services</h2>
                        </div>
                        <div className="sf-services-grid">
                            {[
                                { href: '/supplier-register', emoji: '🤝', label: 'Become a Supplier', bg: 'linear-gradient(135deg,#1a5c38,#27ae60)' },
                                { href: '/vendors', emoji: '🏪', label: 'Vendors', bg: 'linear-gradient(135deg,#3498db,#2980b9)' },
                                { href: '/check-order', emoji: '📦', label: 'Track Orders', bg: 'linear-gradient(135deg,#e67e22,#d35400)' },
                                { href: '/support', emoji: '🤖', label: 'SnappyBot', bg: 'linear-gradient(135deg,#9b59b6,#8e44ad)' },
                                { href: '/wallet', emoji: '💳', label: 'My Wallet', bg: 'linear-gradient(135deg,#e74c3c,#c0392b)' },
                                { href: '/faq', emoji: '❓', label: 'FAQs', bg: 'linear-gradient(135deg,#1abc9c,#16a085)' },
                                { href: '/contact-us', emoji: '💬', label: 'Contact Us', bg: 'linear-gradient(135deg,#2c3e50,#34495e)' },
                                { href: '/brochure', emoji: '📄', label: 'Brochures', bg: 'linear-gradient(135deg,#27ae60,#1a5c38)' },
                            ].map((svc, i) => (
                                <Link key={i} href={svc.href} className="sf-svc-item">
                                    <div className="sf-svc-circle" style={{ background: svc.bg }}>{svc.emoji}</div>
                                    <span className="sf-svc-label">{svc.label}</span>
                                </Link>
                            ))}
                        </div>
                    </section>

                </div>
            </Layout>
        </>
    );
}

// Enable ISR: Revalidate every 60 seconds (similar to oldyomik's static caching)
export async function getStaticProps() {
    return {
        props: {},
        revalidate: 60, // Revalidate every 60 seconds
    };
}

export default Index2;
