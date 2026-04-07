import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { getSliders, getCategoriesShort } from "../util/APIUtils";
import { API_BASE_URL } from "../constants/index.jsx";

const PromoSlider = () => {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categoryMap, setCategoryMap] = useState({});
  const timerRef = useRef(null);

  useEffect(() => {
    // Fetch categories to build id → title map
    getCategoriesShort()
      .then(res => {
        const map = {};
        (res.content || []).forEach(c => { map[c.id] = c.title; });
        setCategoryMap(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    getSliders(0, 50, true)
      .then((res) => {
        const active = (res.content || []).filter((s) => s.active);
        setSlides(active);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const goTo = useCallback(
    (index) => {
      if (isTransitioning || slides.length === 0) return;
      setIsTransitioning(true);
      setCurrent((index + slides.length) % slides.length);
      setTimeout(() => setIsTransitioning(false), 700);
    },
    [isTransitioning, slides.length]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-play every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(next, 5000);
    return () => clearInterval(timerRef.current);
  }, [next, slides.length]);

  const resolveImage = (src) => {
    if (!src) return "";
    return src.startsWith("http") ? src : `${API_BASE_URL}${src}`;
  };

  if (loading || slides.length === 0) return null;

  const slide = slides[current];

  return (
    <section style={styles.section}>
      {/* Section label */}
      <div style={styles.eyebrowWrap}>
        <span style={styles.eyebrow}>Exclusive Offers</span>
        <div style={styles.eyebrowLine} />
      </div>

      <div style={styles.sliderWrap}>
        {/* Slide Image Background */}
        <div
          style={{
            ...styles.bg,
            backgroundImage: `url(${resolveImage(slide.src)})`,
            opacity: isTransitioning ? 0 : 1,
          }}
        />
        {/* Dark overlay gradient */}
        <div style={styles.overlay} />

        {/* Content */}
        <div
          style={{
            ...styles.content,
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? "translateY(20px)" : "translateY(0)",
          }}
        >
          {slide.category && (
            <span style={styles.badge}>
              {categoryMap[slide.category] || slide.category}
            </span>
          )}
          <h2 style={styles.headline}>{slide.headline}</h2>
          {slide.body && <p style={styles.body}>{slide.body}</p>}
          {slide.cta && (
            <Link
              to={slide.category ? `/byCategory/${slide.category}` : "/shop"}
              style={styles.cta}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.color = "#0f172a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "white";
              }}
            >
              {slide.cta}
            </Link>
          )}
        </div>

        {/* Previous button */}
        {slides.length > 1 && (
          <>
            <button
              onClick={() => { clearInterval(timerRef.current); prev(); }}
              style={{ ...styles.navBtn, left: "20px" }}
              aria-label="Previous slide"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Next button */}
            <button
              onClick={() => { clearInterval(timerRef.current); next(); }}
              style={{ ...styles.navBtn, right: "20px" }}
              aria-label="Next slide"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}

        {/* Dot indicators */}
        {slides.length > 1 && (
          <div style={styles.dots}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => { clearInterval(timerRef.current); goTo(i); }}
                style={{
                  ...styles.dot,
                  background: i === current ? "white" : "rgba(255,255,255,0.35)",
                  width: i === current ? "28px" : "8px",
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Slide counter */}
        <div style={styles.counter}>
          <span style={{ color: "white", fontWeight: "bold" }}>{current + 1}</span>
          <span style={{ color: "rgba(255,255,255,0.5)", margin: "0 4px" }}>/</span>
          <span style={{ color: "rgba(255,255,255,0.5)" }}>{slides.length}</span>
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    width: "100%",
    padding: "60px 0 0",
    background: "#f8fafc",
  },
  eyebrowWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    marginBottom: "32px",
    padding: "0 20px",
  },
  eyebrow: {
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#6366f1",
    whiteSpace: "nowrap",
  },
  eyebrowLine: {
    height: "1px",
    width: "80px",
    background: "linear-gradient(to right, #6366f1, transparent)",
  },
  sliderWrap: {
    position: "relative",
    width: "100%",
    height: "500px",
    overflow: "hidden",
  },
  bg: {
    position: "absolute",
    inset: 0,
    backgroundSize: "cover",
    backgroundPosition: "center",
    transition: "opacity 0.7s ease, transform 0.7s ease",
    transform: "scale(1.03)",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to right, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.50) 50%, rgba(0,0,0,0.15) 100%)",
  },
  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    top: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "40px clamp(24px, 6vw, 96px)",
    maxWidth: "640px",
    transition: "opacity 0.7s ease, transform 0.7s ease",
    zIndex: 2,
  },
  badge: {
    display: "inline-block",
    background: "rgba(99, 102, 241, 0.85)",
    color: "white",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    padding: "4px 14px",
    borderRadius: "100px",
    marginBottom: "18px",
    width: "fit-content",
    backdropFilter: "blur(8px)",
  },
  headline: {
    fontSize: "clamp(24px, 4vw, 52px)",
    fontWeight: "800",
    color: "white",
    lineHeight: "1.15",
    marginBottom: "16px",
    textShadow: "0 2px 20px rgba(0,0,0,0.4)",
    letterSpacing: "-0.02em",
  },
  body: {
    fontSize: "clamp(14px, 1.5vw, 18px)",
    color: "rgba(255,255,255,0.85)",
    lineHeight: "1.65",
    marginBottom: "28px",
    maxWidth: "480px",
    textShadow: "0 1px 8px rgba(0,0,0,0.3)",
  },
  cta: {
    display: "inline-flex",
    alignItems: "center",
    padding: "14px 32px",
    border: "2px solid white",
    borderRadius: "100px",
    color: "white",
    fontWeight: "700",
    fontSize: "14px",
    letterSpacing: "0.05em",
    textDecoration: "none",
    background: "transparent",
    transition: "all 0.3s ease",
    width: "fit-content",
  },
  navBtn: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "50%",
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 10,
    backdropFilter: "blur(8px)",
    transition: "background 0.2s ease",
  },
  dots: {
    position: "absolute",
    bottom: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "6px",
    alignItems: "center",
    zIndex: 10,
  },
  dot: {
    height: "8px",
    borderRadius: "100px",
    border: "none",
    cursor: "pointer",
    padding: 0,
    transition: "all 0.4s ease",
  },
  counter: {
    position: "absolute",
    bottom: "24px",
    right: "24px",
    fontSize: "13px",
    fontWeight: "600",
    zIndex: 10,
    letterSpacing: "0.05em",
  },
};

export default PromoSlider;
