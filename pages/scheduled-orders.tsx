import Link from "next/link";
import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import apiClient from "../config/api";
import { useAuth } from "../contexts/AuthContext";
import SEO from "../components/common/SEO";
import { pageSeoConfig } from "../config/seo";
import { logger } from "../lib/logger";
import { normalizeArray } from "../lib/normalizeApiResponse";
import ScheduledGuard from "../components/guards/ScheduledGuard";

const ScheduledOrders = () => {
    const { user, isAuthenticated, isVisitor } = useAuth();
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [countdowns, setCountdowns] = useState({});
    const seoConfig = pageSeoConfig['/scheduled-orders'];

    useEffect(() => {
        if (!isAuthenticated || isVisitor) {
            setSchedules([]);
            setLoading(false);
            return;
        }

        const fetchSchedules = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await ( apiClient as any).getStoreOrderSchedules();
                const raw = normalizeArray(response);
                // Normalize field names to handle both camelCase and PascalCase from API
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
                    scheduleType: s.ScheduleType ?? s.scheduleType ?? s.U_ScheduleType ?? s.u_ScheduleType ?? '',
                    warehouseCode: s.WarehouseCode ?? s.warehouseCode ?? '',
                }));
                setSchedules(normalized);
            } catch (err: any) {
                logger.error('Error fetching schedules:', err);
                setError(err?.message || 'Failed to load schedules');
            } finally {
                setLoading(false);
            }
        };

        fetchSchedules();
    }, [user?.customer?.cardCode, isAuthenticated, isVisitor]);

    // Live countdowns
    useEffect(() => {
        if (schedules.length === 0) return;

        const tick = () => {
            const now = Date.now();
            const next = {};
            schedules.forEach((s: any) => {
                const end = new Date((s as any).endDate).getTime();
                (next as any)[(s as any).docEntry] = Math.max(0, end - now);
            });
            setCountdowns(next);
        };

        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [schedules]);

    const fmtCountdown = (ms: any) => {
        if (!ms || ms <= 0) return { d: 0, h: 0, m: 0, s: 0 };
        return {
            d: Math.floor(ms / 86400000),
            h: Math.floor((ms % 86400000) / 3600000),
            m: Math.floor((ms % 3600000) / 60000),
            s: Math.floor((ms % 60000) / 1000),
        };
    };

    const fmtDate = (iso: any) => {
        if (!iso) return '—';
        return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const fmtDateShort = (iso: any) => {
        if (!iso) return '—';
        return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const openSchedules = schedules.filter((s: any) => (s as any).status === 'Open');

    // Not authenticated
    return (
        <ScheduledGuard>
            <SEO {...seoConfig} />
            <Layout parent="Scheduled" sub="Orders">
                <style>{styles}</style>
                <div className="sch-page">
                    <div className="container">
                        {/* Header */}
                        <div className="sch-header">
                            <div>
                                <h1>Delivery Schedules</h1>
                                <p>Select a schedule to browse products and place your order</p>
                            </div>
                            {openSchedules.length > 0 && (
                                <span className="sch-badge-count">{openSchedules.length} open</span>
                            )}
                        </div>

                        {/* Loading */}
                        {loading && (
                            <div className="sch-grid">
                                {[1, 2].map(i => (
                                    <div key={i} className="sch-card sch-skeleton">
                                        <div className="sch-skel-header" />
                                        <div className="sch-skel-body">
                                            <div className="sch-skel-line w60" />
                                            <div className="sch-skel-line w40" />
                                            <div className="sch-skel-line w80" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Error */}
                        {!loading && error && (
                            <div className="sch-empty-state">
                                <div className="sch-empty-icon sch-error-icon">
                                    <i className="fi-rs-exclamation"></i>
                                </div>
                                <h2>Unable to Load Schedules</h2>
                                <p>We couldn&apos;t fetch your delivery schedules. Please try again or contact support if the problem persists.</p>
                                <button type="button" className="sch-btn-primary" onClick={() => window.location.reload()}>
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* Empty */}
                        {!loading && !error && schedules.length === 0 && (
                            <div className="sch-empty-state">
                                <div className="sch-empty-icon">
                                    <i className="fi-rs-calendar"></i>
                                </div>
                                <h2>No Schedules Available</h2>
                                <p>There are no open delivery schedules at the moment. Check back later.</p>
                                <Link href="/store" className="sch-btn-primary">Browse Shop</Link>
                            </div>
                        )}

                        {/* Schedule Cards */}
                        {!loading && !error && schedules.length > 0 && (
                            <div className="sch-grid">
                                {schedules.sort((a: any, b: any) => {
                                    const aOpen = (a as any).status === 'Open' ? 0 : 1;
                                    const bOpen = (b as any).status === 'Open' ? 0 : 1;
                                    return aOpen - bOpen;
                                }).map((s: any) => {
                                    const isOpen = s.status === 'Open';
                                    const cd = fmtCountdown((countdowns as any)[(s as any).docEntry]);
                                    const dates = s.availableDeliveryDates || [];
                                    const name = s.remark || `Schedule ${s.docNum || s.docEntry}`;
                                    const scheduleType = s.scheduleType || '';
                                    const isConsignment = scheduleType.toLowerCase().includes('consignment') || (name && name.toLowerCase().includes('consignment'));

                                    return (
                                        <div key={s.docEntry} className={`sch-card ${!isOpen ? 'sch-card-closed' : ''}`}>
                                            {/* Card Header */}
                                            <div className="sch-card-header">
                                                <div className="sch-card-title">
                                                    <div className="sch-card-num-row">
                                                        <span className="sch-card-num">#{s.docNum || s.docEntry}</span>
                                                        {isConsignment && (
                                                            <span className="sch-type-badge sch-type-consignment">Consignment</span>
                                                        )}
                                                    </div>
                                                    <h3>{name}</h3>
                                                </div>
                                                <div className="sch-card-header-actions">
                                                    {isOpen && (
                                                        <Link href={`/scheduled-new-order?schedule=${s.docEntry}`} className="sch-order-btn">
                                                            + Order
                                                        </Link>
                                                    )}
                                                    <span className={`sch-status ${isOpen ? 'sch-status-open' : 'sch-status-closed'}`}>
                                                        {s.status || 'Open'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Schedule Details */}
                                            <div className="sch-card-body">
                                                <div className="sch-info-grid">
                                                    <div className="sch-info-item">
                                                        <span className="sch-info-label">Order Window</span>
                                                        <span className="sch-info-value">
                                                            {fmtDateShort(s.startDate)} — {fmtDateShort(s.endDate)}
                                                        </span>
                                                    </div>
                                                    <div className="sch-info-item">
                                                        <span className="sch-info-label">Delivery Window</span>
                                                        <span className="sch-info-value">
                                                            {fmtDateShort(s.startDeliveryDate)} — {fmtDateShort(s.endDeliveryDate)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Delivery Dates */}
                                                {dates.length > 0 && (
                                                    <div className="sch-dates">
                                                        <span className="sch-info-label">Available Delivery Dates</span>
                                                        <div className="sch-date-chips">
                                                            {dates.map((d: any, i: any) => (
                                                                <span key={i} className="sch-chip">{fmtDate(d)}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Countdown */}
                                                {isOpen && (
                                                    <div className="sch-countdown">
                                                        <span className="sch-countdown-label">Order window closes in</span>
                                                        <div className="sch-countdown-grid">
                                                            {[
                                                                { v: cd.d, l: 'Days' },
                                                                { v: cd.h, l: 'Hrs' },
                                                                { v: cd.m, l: 'Min' },
                                                                { v: cd.s, l: 'Sec' },
                                                            ].map(({ v, l }) => (
                                                                <div key={l} className="sch-cd-unit">
                                                                    <span className="sch-cd-num">{String(v).padStart(2, '0')}</span>
                                                                    <span className="sch-cd-label">{l}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* CTA */}
                                            <div className="sch-card-footer">
                                                {isOpen ? (
                                                    <Link
                                                        href={`/scheduled-new-order?schedule=${s.docEntry}`}
                                                        className="sch-btn-primary sch-btn-full"
                                                    >
                                                        <i className="fi-rs-shopping-bag"></i>
                                                        Create Order
                                                    </Link>
                                                ) : (
                                                    <button type="button" className="sch-btn-disabled sch-btn-full" disabled>
                                                        Schedule Closed
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </Layout>
        </ScheduledGuard>
    );
};

const styles = `
    .sch-page { padding: 40px 0 80px; min-height: 60vh; }

    .sch-header {
        display: flex; align-items: flex-end; justify-content: space-between;
        margin-bottom: 32px; gap: 16px; flex-wrap: wrap;
    }
    .sch-header h1 { font-size: 28px; font-weight: 800; color: #1a202c; margin: 0 0 4px; }
    .sch-header p { font-size: 15px; color: #718096; margin: 0; }
    .sch-badge-count {
        background: #e6ffed; color: #22863a; font-size: 13px; font-weight: 600;
        padding: 6px 14px; border-radius: 20px;
    }

    .sch-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 24px; }
    @media (max-width: 480px) { .sch-grid { grid-template-columns: 1fr; } }

    .sch-card {
        background: #fff; border: 1px solid #e2e8f0; border-radius: 16px;
        overflow: hidden; transition: all 0.25s ease;
    }
    .sch-card:hover { border-color: #1a5c38; box-shadow: 0 8px 24px rgba(26,92,56,0.12); transform: translateY(-2px); }
    .sch-card-closed { opacity: 0.65; }
    .sch-card-closed:hover { transform: none; border-color: #e2e8f0; box-shadow: none; }

    .sch-card-header {
        display: flex; align-items: flex-start; justify-content: space-between;
        padding: 20px 24px; border-bottom: 1px solid #f0f0f0;
    }
    .sch-card-title { flex: 1; }
    .sch-card-num { font-size: 12px; color: #a0aec0; font-weight: 600; letter-spacing: 0.5px; }
    .sch-card-num-row { display: flex; align-items: center; gap: 8px; }
    .sch-card-title h3 { font-size: 17px; font-weight: 700; color: #1a202c; margin: 4px 0 0; }
    .sch-card-header-actions { display: flex; align-items: center; gap: 10px; }
    .sch-order-btn {
        background: #42af57; color: #fff; border-radius: 6px; padding: 6px 12px;
        font-size: 12px; font-weight: 700; white-space: nowrap; text-decoration: none;
        transition: background 0.2s;
    }
    .sch-order-btn:hover { background: #3a9c4d; }

    .sch-status {
        font-size: 12px; font-weight: 600; padding: 4px 12px;
        border-radius: 20px; white-space: nowrap; flex-shrink: 0;
    }
    .sch-status-open { background: #e6ffed; color: #22863a; }
    .sch-status-closed { background: #f0f0f0; color: #718096; }

    .sch-type-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .sch-type-consignment { background: #ebf5ff; color: #2b6cb0; border: 1px solid #bee3f8; }

    .sch-card-body { padding: 20px 24px; }

    .sch-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .sch-info-item { display: flex; flex-direction: column; gap: 4px; }
    .sch-info-label { font-size: 11px; font-weight: 700; color: #a0aec0; text-transform: uppercase; letter-spacing: 0.8px; }
    .sch-info-value { font-size: 14px; font-weight: 600; color: #2d3748; }

    .sch-dates { margin-bottom: 16px; }
    .sch-date-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .sch-chip {
        background: #f0faf4; color: #2f855a; font-size: 12px; font-weight: 600;
        padding: 5px 12px; border-radius: 20px; border: 1px solid #c6f6d5;
    }

    .sch-countdown {
        background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px;
        padding: 14px 16px; text-align: center;
    }
    .sch-countdown-label { font-size: 11px; font-weight: 700; color: #d97706; text-transform: uppercase; letter-spacing: 0.5px; }
    .sch-countdown-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 10px; }
    .sch-cd-unit { display: flex; flex-direction: column; align-items: center; }
    .sch-cd-num { font-size: 22px; font-weight: 800; color: #1a202c; line-height: 1; }
    .sch-cd-label { font-size: 10px; font-weight: 600; color: #a0aec0; text-transform: uppercase; margin-top: 2px; }

    .sch-card-footer { padding: 16px 24px; border-top: 1px solid #f0f0f0; }

    .sch-btn-primary {
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        background: #1a5c38; color: #fff; border: none; padding: 12px 24px;
        border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer;
        transition: all 0.2s; text-decoration: none;
    }
    .sch-btn-primary:hover { background: #236b43; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(26,92,56,0.25); }
    .sch-btn-full { width: 100%; }
    .sch-btn-disabled {
        width: 100%; display: flex; align-items: center; justify-content: center;
        background: #edf2f7; color: #a0aec0; border: none; padding: 12px 24px;
        border-radius: 10px; font-size: 14px; font-weight: 600; cursor: not-allowed;
    }

    /* Empty State */
    .sch-empty-state {
        text-align: center; padding: 80px 20px; max-width: 440px; margin: 0 auto;
    }
    .sch-empty-icon {
        width: 80px; height: 80px; border-radius: 50%; background: #f0faf4;
        display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;
        font-size: 32px; color: #1a5c38;
    }
    .sch-error-icon { background: #fff5f5; color: #e53e3e; }
    .sch-empty-icon--emoji { background: #f7fafc; font-size: 36px; }
    .sch-not-approved-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .sch-btn-secondary {
        display: inline-flex; align-items: center; justify-content: center;
        background: #edf2f7; color: #4a5568; padding: 12px 24px;
        border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none;
        transition: background 0.2s;
    }
    .sch-btn-secondary:hover { background: #e2e8f0; }
    .sch-empty-state h2 { font-size: 22px; font-weight: 700; color: #1a202c; margin: 0 0 8px; }
    .sch-empty-state p { font-size: 15px; color: #718096; margin: 0 0 24px; line-height: 1.6; }

    /* Skeleton Loading */
    .sch-skeleton { pointer-events: none; }
    .sch-skel-header { height: 60px; background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    .sch-skel-body { padding: 24px; }
    .sch-skel-line { height: 14px; background: #f0f0f0; border-radius: 6px; margin-bottom: 12px; animation: shimmer 1.5s infinite; background-size: 200% 100%; background-image: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%); }
    .w60 { width: 60%; } .w40 { width: 40%; } .w80 { width: 80%; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
`;

export default ScheduledOrders;
