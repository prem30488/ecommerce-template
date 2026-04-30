import React, { useState } from 'react';
import { trackOrder } from '../util/APIUtils';
import dayjs from 'dayjs';
import {
    FaTruck, FaBox, FaCheckCircle, FaSearch, FaClock,
    FaExclamationCircle, FaTimesCircle, FaCalendarAlt,
    FaHashtag, FaHeadset, FaShieldAlt
} from 'react-icons/fa';
import { MdLocalShipping } from 'react-icons/md';
import SEO from '../components/SEO';
import LinearProgress from '../common/LinearProgress';
import { COMPANY_INFO } from '../constants/companyInfo';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './track-order.css';

/* ── helpers ─────────────────────────────────────────────────────────────── */

const fmt = (dateString) => {
    if (!dateString) return null;
    try { return dayjs(dateString).format('MMM D, YYYY · h:mm A'); }
    catch { return dateString; }
};

const normaliseStatus = (s = '') => s.toLowerCase().trim();

/* Map status → pill colour class */
const pillClass = (status) => {
    const s = normaliseStatus(status);
    if (s === 'delivered')  return 'delivered';
    if (s === 'shipped')    return 'shipped';
    if (s === 'processing') return 'processing';
    if (s === 'cancelled')  return 'cancelled';
    return 'pending';
};

/* ── step definitions ────────────────────────────────────────────────────── */
const buildSteps = (data, edd) => {
    const s = normaliseStatus(data.status);
    const isCancelled = s === 'cancelled' || !!data.cancelled_at;

    const base = [
        {
            key: 'placed',
            label: 'Order\nPlaced',
            icon: <FaBox />,
            date: data.created_at || data.createdAt,
            desc: 'Your order has been successfully placed.',
            done: true,
        },
        {
            key: 'processing',
            label: 'Processing',
            icon: <FaClock />,
            date: data.processing_at || (s === 'processing' ? data.updatedAt : null),
            desc: 'We are preparing your items for shipping.',
            done: !!data.processing_at || ['processing', 'shipped', 'delivered'].includes(s),
        },
        {
            key: 'shipped',
            label: 'Shipped',
            icon: <FaTruck />,
            date: data.shipped_at || (s === 'shipped' ? data.updatedAt : null),
            desc: 'Your package is on the way to you.',
            done: !!data.shipped_at || ['shipped', 'delivered'].includes(s),
        },
    ];

    if (isCancelled) {
        base.push({
            key: 'cancelled',
            label: 'Cancelled',
            icon: <FaTimesCircle />,
            date: data.cancelled_at || data.updatedAt,
            desc: 'This order has been cancelled.',
            done: true,
            isCancelled: true,
        });
    } else {
        base.push({
            key: 'delivered',
            label: 'Delivered',
            icon: <FaCheckCircle />,
            date: data.delivered_at || (s === 'delivered' ? data.updatedAt : null),
            desc: 'Your order has been delivered safely.',
            done: !!data.delivered_at || s === 'delivered',
        });
    }
    
    if (edd) {
        base.push({
            key: 'expected',
            label: 'Expected\nDelivery',
            icon: <FaCalendarAlt />,
            date: edd,
            desc: 'Estimated date for your package arrival.',
            done: false,
            isExpected: true,
        });
    }
 
    return base;
};

/* ── component ───────────────────────────────────────────────────────────── */
const TrackOrder = () => {
    const [orderId,      setOrderId]      = useState('');
    const [trackingData, setTrackingData] = useState(null);
    const [loading,      setLoading]      = useState(false);
    const [error,        setError]        = useState(null);

    const handleTrack = async (e) => {
        if (e) e.preventDefault();
        if (!orderId.trim()) return;
        setLoading(true);
        setError(null);
        setTrackingData(null);
        try {
            const res = await trackOrder(orderId);
            if (res.success) {
                setTrackingData(res.order);
            } else {
                setError(res.message || 'Order not found. Please check your Order ID.');
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch tracking details. Please check your Order ID.');
        } finally {
            setLoading(false);
        }
    };

    /* derived */
    const status = trackingData ? normaliseStatus(trackingData.status) : '';
    const isCancelled = status === 'cancelled' || (trackingData && !!trackingData.cancelled_at);
    const isDelivered = status === 'delivered' || (trackingData && !!trackingData.delivered_at);

    let estimatedDeliveryDate = null;
    if (trackingData && !isDelivered && !isCancelled) {
        if (trackingData.shipped_at) {
            estimatedDeliveryDate = dayjs(trackingData.shipped_at).add(5, 'day');
        } else if (trackingData.processing_at) {
            estimatedDeliveryDate = dayjs(trackingData.processing_at).add(6, 'day');
        }
    }

    const steps      = trackingData ? buildSteps(trackingData, estimatedDeliveryDate) : [];
    const doneCount  = steps.filter(s => s.done).length;
    const activeIdx  = doneCount - 1;                    // index of last done step
    /* progress bar width = segments between icons */
    const segTotal   = steps.length - 1;
    const segDone    = Math.max(0, doneCount - 1);
    const progressPct = segTotal > 0 ? (segDone / segTotal) * 100 : 0;


    return (
        <div className="to-page">
            <LinearProgress loading={loading} />
            <SEO
                title={`Track Your Order | ${COMPANY_INFO.name}`}
                description="Easily track your order status in real-time. Enter your Order ID to see the current status and history."
                keywords={COMPANY_INFO.seoKeywords}
            />

            {/* ── Hero ──────────────────────────────────── */}
            <section className="to-hero">
                <div className="to-hero-icon">🚚</div>
                <h1>Track Your Order</h1>
                <p>Real-time updates on your delivery status</p>
            </section>

            {/* ── Search Card ───────────────────────────── */}
            <div className="to-search-wrap">
                <div className="to-search-card">
                    <p className="to-search-label">Enter Order ID</p>
                    <form onSubmit={handleTrack}>
                        <div className="to-search-row">
                            <div className="to-search-input-wrap">
                                <FaSearch className="to-search-input-icon" />
                                <input
                                    id="track-order-id-input"
                                    className="to-search-input"
                                    type="text"
                                    placeholder="e.g. 1023"
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                    autoComplete="off"
                                />
                            </div>
                            <button
                                id="track-order-submit-btn"
                                className="to-search-btn"
                                type="submit"
                                disabled={loading || !orderId.trim()}
                            >
                                {loading
                                    ? <span className="to-spinner-ring" style={{ width: 18, height: 18, borderWidth: 3, margin: 0 }} />
                                    : <><FaSearch /> Track Order</>
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* ── Error ─────────────────────────────────── */}
            {error && (
                <div className="to-error">
                    <div className="to-error-box">
                        <FaExclamationCircle className="to-error-icon" />
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* ── Loading ───────────────────────────────── */}
            {loading && (
                <div className="to-result">
                    <div className="to-spinner">
                        <div className="to-spinner-ring" />
                        <p className="to-spinner-text">Fetching your order details…</p>
                    </div>
                </div>
            )}

            {/* ── Empty State ───────────────────────────── */}
            {!trackingData && !loading && !error && (
                <div className="to-result">
                    <div className="to-empty-state">
                        <MdLocalShipping className="to-empty-icon" />
                        <p className="to-empty-text">Your tracking details will appear here</p>
                        <p className="to-empty-sub">Enter your Order ID above and click <strong>Track Order</strong></p>
                    </div>
                </div>
            )}

            {/* ── Result ────────────────────────────────── */}
            {trackingData && !loading && (
                <div className="to-result">

                    {/* Order Summary Header */}
                    <div className="to-summary">
                        <div className="to-summary-left">
                            <h2>Order #{trackingData.id}</h2>
                            <span>
                                Placed on {fmt(trackingData.created_at || trackingData.createdAt) || '—'}
                            </span>
                        </div>
                        <div className={`to-status-pill ${pillClass(trackingData.status)}`}>
                            <span className="to-pulse" />
                            {trackingData.status || 'Unknown'}
                        </div>
                    </div>

                    {/* Info Chips */}
                    <div className="to-info-row">
                        <div className="to-info-chip">
                            <div className="to-info-chip-icon primary"><FaHashtag /></div>
                            <div className="to-info-chip-body">
                                <small>Order ID</small>
                                <strong>#{trackingData.id}</strong>
                            </div>
                        </div>
                        <div className="to-info-chip">
                            <div className="to-info-chip-icon blue"><FaCalendarAlt /></div>
                            <div className="to-info-chip-body">
                                <small>Placed On</small>
                                <strong>{dayjs(trackingData.created_at || trackingData.createdAt).format('MMM D, YYYY') || '—'}</strong>
                            </div>
                        </div>
                        {trackingData.total && (
                            <div className="to-info-chip">
                                <div className="to-info-chip-icon green"><FaShieldAlt /></div>
                                <div className="to-info-chip-body">
                                    <small>Order Total</small>
                                    <strong>₹{Number(trackingData.total).toLocaleString('en-IN')}</strong>
                                </div>
                            </div>
                        )}
                        {trackingData.shipped_at && (
                            <div className="to-info-chip">
                                <div className="to-info-chip-icon orange"><FaTruck /></div>
                                <div className="to-info-chip-body">
                                    <small>Shipped On</small>
                                    <strong>{dayjs(trackingData.shipped_at).format('MMM D, YYYY')}</strong>
                                </div>
                            </div>
                        )}
                        {estimatedDeliveryDate && (
                            <div className="to-info-chip">
                                <div className="to-info-chip-icon purple"><FaCalendarAlt /></div>
                                <div className="to-info-chip-body">
                                    <small>Estimated Delivery</small>
                                    <strong>{estimatedDeliveryDate.format('MMM D, YYYY')}</strong>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Stepper ──────────────────────────── */}
                    <div className="to-stepper-card">
                        <p className="to-stepper-title">Delivery Progress</p>

                        <div className="to-steps" style={{ '--progress-pct': `${progressPct}%` }}>
                            {/* Animated progress fill */}
                            <div
                                className="to-steps-progress"
                                style={{ width: `calc(${progressPct}% - 44px - (100% / ${steps.length}))` }}
                            />

                            {steps.map((step, idx) => {
                                const isDone   = step.done;
                                const isActive = idx === activeIdx && !step.done;
                                const iconCls  = step.isCancelled
                                    ? 'cancelled-step'
                                    : isDone ? 'done' : isActive ? 'active' : '';
                                const labelCls = isDone || isActive ? (isDone ? 'done' : 'active') : '';

                                return (
                                    <div className="to-step" key={step.key}>
                                        <div className={`to-step-icon-wrap ${iconCls}`}>
                                            {step.icon}
                                        </div>
                                        <div className="to-step-meta">
                                            <div className={`to-step-label ${labelCls}`}>
                                                {step.label}
                                            </div>
                                            {step.date && (
                                                <div className="to-step-date">
                                                    {dayjs(step.date).format('MMM D')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Timeline ─────────────────────────── */}
                    <div className="to-timeline-card">
                        <p className="to-timeline-title">Order History</p>
                        <div className="to-timeline">
                            {steps.map((step, idx) => {
                                const dotCls = step.isCancelled
                                    ? 'cancelled-dot'
                                    : step.done ? 'done' : 'pending';

                                return (
                                    <div
                                        className="to-tl-item"
                                        key={step.key}
                                        style={{ animationDelay: `${idx * 0.07}s` }}
                                    >
                                        <div className={`to-tl-dot ${dotCls}`}>
                                            {step.icon}
                                        </div>
                                        <div className="to-tl-content">
                                            <h4>{step.label.replace('\n', ' ')}</h4>
                                            <p>{step.desc}</p>
                                            {step.done && step.date
                                                ? (
                                                    <span className="to-tl-date">
                                                        <FaCalendarAlt />
                                                        {fmt(step.date)}
                                                    </span>
                                                ) : !step.done && (
                                                    <span className="to-tl-pending-label">
                                                        {step.isExpected 
                                                            ? `Expected: ${dayjs(step.date).format('MMM D, YYYY')}` 
                                                            : 'Pending…'
                                                        }
                                                    </span>
                                                )
                                            }
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Delivery Location Map ────────────────── */}
                    {trackingData.latitude && trackingData.longitude && (
                        <div className="to-map-card">
                            <p className="to-map-title">Delivery Location</p>
                            <div className="to-map-container">
                                <DeliveryMap lat={trackingData.latitude} lng={trackingData.longitude} />
                            </div>
                            <div className="to-map-footer">
                                <FaTruck style={{ color: 'var(--primary-color)' }} />
                                <span>Your order will be delivered to this pinned location.</span>
                            </div>
                        </div>
                    )}
                    
                    {/* ── Help Banner ───────────────────────── */}
                    <div className="to-help">
                        <span className="to-help-icon">🎧</span>
                        <div className="to-help-text">
                            <h4>Need Help with Your Order?</h4>
                            <p>
                                Contact our support team at <strong>{COMPANY_INFO.email || COMPANY_INFO.phone || 'support@' + COMPANY_INFO.name?.toLowerCase().replace(/\s/g, '') + '.com'}</strong>
                            </p>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

const DeliveryMap = ({ lat, lng }) => {
    const mapRef = React.useRef(null);
    const mapInstance = React.useRef(null);

    React.useEffect(() => {
        if (mapRef.current && !mapInstance.current) {
            const map = L.map(mapRef.current, {
                center: [lat, lng],
                zoom: 16,
                scrollWheelZoom: false
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map);

            const customIcon = L.icon({
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            L.marker([lat, lng], { icon: customIcon }).addTo(map);
            mapInstance.current = map;
        }

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [lat, lng]);

    return <div ref={mapRef} style={{ height: '100%', width: '100%', borderRadius: '8px' }} />;
};

export default TrackOrder;
