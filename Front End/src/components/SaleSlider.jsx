import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/shop-context';
import SaleMarquee from './SaleMarquee';
import { resolveImageUrl } from '../util/imageUrl';
import './SaleSlider.css';

const SaleSlider = () => {
    const [slides, setSlides] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    /**
     * Fetch active sales from API (cached via Redis on backend)
     */
    useEffect(() => {
        const fetchActiveSales = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/sale/active');
                const result = await response.json();

                if (result.success && result.data && result.data.length > 0) {
                    setSlides(result.data);
                    // Track view event for first slide
                    if (result.data.length > 0) {
                        trackAnalytics(result.data[0].id, 'view');
                    }
                } else {
                    setSlides([]);
                }
            } catch (error) {
                console.error('Error fetching active sales:', error);
                setSlides([]);
            } finally {
                setLoading(false);
            }
        };

        fetchActiveSales();
    }, []);

    /**
     * Auto-advance slides every 6 seconds
     */
    useEffect(() => {
        if (slides.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000);

        return () => clearInterval(timer);
    }, [slides]);

    /**
     * Track analytics events
     */
    const trackAnalytics = async (saleId, eventType = 'view') => {
        try {
            await fetch(`/api/sale/${saleId}/analytics`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event: eventType }),
            });
        } catch (error) {
            console.error('Error tracking analytics:', error);
        }
    };

    /**
     * Handle slide navigation
     */
    const goToSlide = (index) => {
        setCurrentSlide(index);
        if (slides[index]) {
            trackAnalytics(slides[index].id, 'view');
        }
    };

    const prevSlide = () => {
        goToSlide((currentSlide - 1 + slides.length) % slides.length);
    };

    const nextSlide = () => {
        goToSlide((currentSlide + 1) % slides.length);
    };

    /**
     * Handle CTA button click
     */
    const handleCTAClick = (saleId) => {
        // Track click
        trackAnalytics(saleId, 'click');
        // Navigate to sale page
        navigate(`/sales/${saleId}`);
    };

    /**
     * Get discount display text
     */
    const getDiscountText = (sale) => {
        switch (sale.discountType) {
            case 'PERCENTAGE':
                return `SAVE ${sale.discountValue}%`;
            case 'FIXED_AMOUNT':
                return `SAVE $${sale.discountValue}`;
            case 'BOGO':
                return 'BUY 1 GET 1 FREE';
            case 'VOLUME':
                return 'BULK DISCOUNT';
            default:
                return 'SPECIAL OFFER';
        }
    };

    /**
     * Get time remaining string for a sale end date
     */
    const getTimeRemaining = (endDate) => {
        const diff = new Date(endDate) - new Date();
        if (diff <= 0) return '0m';

        const minutes = Math.floor(diff / (1000 * 60));
        const days = Math.floor(minutes / (60 * 24));
        const hours = Math.floor((minutes % (60 * 24)) / 60);
        const mins = minutes % 60;

        const parts = [];
        if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
        if (hours > 0) parts.push(`${hours}h`);
        if (days === 0 && mins > 0) parts.push(`${mins}m`);

        return parts.join(' ');
    };

    if (loading) {
        return (
            <div className="sale-slider-skeleton">
                <div className="skeleton-shimmer"></div>
            </div>
        );
    }

    if (slides.length === 0) {
        return null;
    }

    const currentSale = slides[currentSlide];

    return (
        <>
            {/* Sales Marquee */}
            <SaleMarquee sales={slides} />

            {/* Sale Slider */}
            <div className="sale-slider-wrapper">
                <div className="sale-slider-container">
                    <div
                        className="sale-slide-content"
                        style={{
                            backgroundImage: currentSale.bannerImage
                                ? `url(${currentSale.bannerImage.startsWith('http') ? currentSale.bannerImage : resolveImageUrl(`/images/sales/${currentSale.bannerImage}`)})`
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        }}
                    >
                        <div className="sale-slide-overlay"></div>

                        <div className="sale-slide-text-content">
                            <div className="discount-badge">
                                <span className="discount-percent">
                                    {getDiscountText(currentSale)}
                                </span>
                            </div>

                            <h2 className="sale-headline">{currentSale.name}</h2>

                            {currentSale.description && (
                                <p className="sale-description">{currentSale.description}</p>
                            )}

                            <div className="sale-countdown">
                                <span className="countdown-label">⏱️ Ends in</span>
                                <span className="countdown-time">
                                    {getTimeRemaining(currentSale.endDate)}
                                </span>
                            </div>

                            <button
                                className="sale-cta-button"
                                onClick={() => handleCTAClick(currentSale.id)}
                            >
                                Shop Sale
                                <span className="arrow">→</span>
                            </button>
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    {slides.length > 1 && (
                        <>
                            <button
                                className="sale-slider-nav sale-slider-prev"
                                onClick={prevSlide}
                                title="Previous sale"
                            >
                                ❮
                            </button>
                            <button
                                className="sale-slider-nav sale-slider-next"
                                onClick={nextSlide}
                                title="Next sale"
                            >
                                ❯
                            </button>
                        </>
                    )}
                </div>

                {/* Slide Indicators */}
                {slides.length > 1 && (
                    <div className="sale-slide-indicators">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                                onClick={() => goToSlide(index)}
                                title={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default SaleSlider;
