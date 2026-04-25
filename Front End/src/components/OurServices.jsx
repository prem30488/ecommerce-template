import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { ShopContext } from '../context/shop-context';
import { Link } from 'react-router-dom';
import './OurServices.css';
import { MdArrowForward, MdChevronLeft, MdChevronRight } from 'react-icons/md';

const AUTO_PLAY_MS = 3500;

const OurServices = () => {
    const { categories } = useContext(ShopContext);
    const activeCategories = (categories || []).filter(cat => cat.enabled !== false);

    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const timerRef = useRef(null);

    const total = activeCategories.length;

    const goTo = useCallback((idx) => {
        if (total === 0) return;
        setCurrent(((idx % total) + total) % total);
    }, [total]);

    const next = useCallback(() => goTo(current + 1), [current, goTo]);
    const prev = useCallback(() => goTo(current - 1), [current, goTo]);

    const resetTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (total > 0 && !isPaused) {
            timerRef.current = setInterval(() => {
                setCurrent(c => (c + 1) % total);
            }, AUTO_PLAY_MS);
        }
    }, [total, isPaused]);

    useEffect(() => {
        resetTimer();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [resetTimer]);

    if (!activeCategories || total === 0) return null;

    const category = activeCategories[current];

    return (
        <section className="services-section" id="service-sec">
            <div className="services-container">

                {/* ── Header ── */}
                <div className="services-header">
                    <span className="services-sub">What We Offer</span>
                    <h2 className="services-title">OUR SERVICES</h2>
                    <div className="title-underline"></div>
                </div>

                {/* ── Single-card Carousel ── */}
                <div 
                    className="sc-carousel"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >

                    {/* Prev */}
                    <button
                        className="sc-nav sc-nav--left"
                        onClick={() => { prev(); resetTimer(); }}
                        aria-label="Previous service"
                    >
                        <MdChevronLeft size={30} />
                    </button>

                    {/* Card */}
                    {category && (
                        <div className="sc-card" key={category.id}>
                            <div className="sc-image-wrap">
                                <img
                                    src={category.imageUrl || '/images/placeholder.png'}
                                    alt={category.title || 'Service'}
                                    onError={e => { e.target.src = '/images/placeholder.png'; }}
                                    draggable={false}
                                />
                                <div className="sc-img-overlay" />
                            </div>

                            <div className="sc-body">
                                <span className="sc-badge">{current + 1} / {total}</span>
                                <h3 className="sc-name">{category?.title || 'Quality Service'}</h3>
                                <p className="sc-desc">
                                    {category?.description ||
                                        `Premium quality ${(category?.name || 'Healthcare')?.toLowerCase()} products manufactured with international standards.`}
                                </p>
                                <Link
                                    to={`/byCategory/${category.id}`}
                                    className="sc-link"
                                    onClick={() => clearInterval(timerRef.current)}
                                >
                                    Explore Category <MdArrowForward />
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Next */}
                    <button
                        className="sc-nav sc-nav--right"
                        onClick={() => { next(); resetTimer(); }}
                        aria-label="Next service"
                    >
                        <MdChevronRight size={30} />
                    </button>
                </div>

                {/* ── Dots ── */}
                <div className="sc-dots">
                    {activeCategories.map((_, i) => (
                        <button
                            key={i}
                            className={`sc-dot${i === current ? ' active' : ''}`}
                            onClick={() => { goTo(i); resetTimer(); }}
                            aria-label={`Go to service ${i + 1}`}
                        />
                    ))}
                </div>

            </div>
        </section>
    );
};

export default OurServices;
