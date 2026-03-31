import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/shop-context";
import Alert from "react-s-alert";
import "./featureproductscarousel.css";
import WishlistIcon from "./WishlistIcon";
import { FaEye } from "react-icons/fa";
import QuickViewModal from "./QuickViewModal";

/* ── Constants ──────────────────────────────────────────────────────────── */
const CARD_WIDTH = 200;   // px
const GAP = 16;    // px between cards
const VISIBLE = 5;     // cards shown at once
const SLIDE_STEP = CARD_WIDTH + GAP;

/* ── Star rating ─────────────────────────────────────────────────────────── */
const Stars = ({ rating }) => {
  const score = parseFloat((rating || "0").split("/")[0]);
  const full = Math.floor(score);
  const half = score - full >= 0.5;
  return (
    <span className="fpc-stars">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={
            i < full ? "fpc-star fpc-star--on"
              : i === full && half ? "fpc-star fpc-star--half"
                : "fpc-star"
          }
        >★</span>
      ))}
    </span>
  );
};

/* ── Marquee strip ───────────────────────────────────────────────────────── */
const MarqueeStrip = ({ products }) => {
  const items = products.map((p) => {
    return {
      name: p.title.slice(0, 22),
      label: "FEATURED",
      hasOffer: true,
    };
  });

  if (!items.length) return null;

  const doubled = [...items, ...items]; // seamless infinite loop

  return (
    <div className="fpc-marquee-wrapper" aria-hidden="true">
      <div className="fpc-marquee-track">
        {doubled.map((item, i) => (
          <span
            key={i}
            className={`fpc-marquee-item${item.hasOffer ? "" : " fpc-marquee-item--muted"
              }`}
          >
            <span className="fpc-marquee-sep">◆</span>
            <span className="fpc-marquee-name">{item.name}</span>
            <span className="fpc-marquee-divider">—</span>
            <span className={`fpc-marquee-label${item.hasOffer ? " fpc-marquee-label--offer" : ""
              }`}>
              {item.label}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};

/* ── Card-level marquee (Featured instead of offers) ────────────────────── */
const CardMarquee = () => {
  const items = ["FEATURED PRODUCT", "FEATURED PRODUCT"];

  return (
    <div className="fpc-card-marquee fpc-card-marquee--featured">
      <div className="fpc-card-marquee-track">
        {items.map((txt, i) => (
          <span key={i} className="fpc-card-marquee-item">
            <span className="fpc-card-marquee-tag">💎</span>
            {txt}
            <span className="fpc-card-marquee-sep">·</span>
          </span>
        ))}
      </div>
    </div>
  );
};

/* ── Single card ─────────────────────────────────────────────────────────── */
const FpcCard = ({ product, onQuickView }) => {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useContext(ShopContext);

  const { id, title, stock, rating, img } = product;
  const price = product.productFlavors?.[0]?.price || 0;
  const firstFlavorId = product.productFlavors?.[0]?.flavor_id;
  const cartCount = Object.keys(cartItems).reduce((sum, key) => key.startsWith(`${id}_`) ? sum + cartItems[key] : sum, 0);

  // Fallback image from picsum if img is missing
  const imgSrc = img || `https://picsum.photos/seed/${encodeURIComponent(id)}/400/400`;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (cartCount >= stock) { Alert.info("Item out of stock!"); return; }
    addToCart(id, "S", firstFlavorId);
    Alert.success(`${title.slice(0, 20)} added!`);
  };

  return (
    <article className="fpc-card" tabIndex={0}>
      {/* Featured badge replacing offer badge */}
      <span className="fpc-featured-badge">FEATURED</span>

      {/* Main image area */}
      <div
        className="fpc-main-img-wrap"
        onClick={() => navigate("/productDetails/" + id)}
        role="button"
        tabIndex={-1}
        aria-label={`View ${title}`}
      >
        <img
          className="fpc-main-img"
          src={imgSrc}
          alt={title}
          loading="lazy"
          onError={(e) => {
            e.target.src = `https://placehold.co/400x400?text=Product`;
          }}
        />
        {/* Plus Button - Top */}
        <button
          className="fpc-plus-btn"
          onClick={handleAdd}
          title="Add to cart"
          aria-label="Add to cart"
          disabled={stock === 0}
          style={{ top: '0.55rem' }}
        >
          {cartCount > 0
            ? <span className="fpc-plus-count">{cartCount}</span>
            : <span className="fpc-plus-icon">+</span>}
        </button>

        {/* Quick View Button - Middle */}
        <button
          className="fpc-eye-btn"
          onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
          title="Quick View"
          aria-label="Quick View"
          style={{ top: 'calc(0.55rem + 30px + 8px)' }}
        >
          <FaEye />
        </button>

        {/* Wishlist icon - Bottom */}
        <WishlistIcon
          productId={id}
          size="medium"
          showText={false}
          customStyle={{
            position: 'absolute',
            top: 'calc(0.55rem + 60px + 16px)',
            right: '0.55rem',
            zIndex: 10,
            background: '#fff',
            boxShadow: '0 3px 12px rgba(0,0,0,0.1)',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0
          }}
        />
      </div>

      {/* Card-level feature marquee */}
      <CardMarquee />

      {/* Info */}
      <div className="fpc-card-info">
        <h3 className="fpc-card-title" onClick={() => navigate("/productDetails/" + id)}>
          {title.length > 22 ? title.slice(0, 22) + "…" : title}
        </h3>
        <Stars rating={rating} />
        <div className="fpc-price-row">
          <span className="fpc-price-now">
            ₹{parseFloat(price || 0).toLocaleString("en-IN")}
          </span>
        </div>
        <button className="fpc-info-btn" onClick={() => navigate("/productDetails/" + id)}>
          More Info
        </button>
      </div>
    </article>
  );
};

/* ── Fallback product ────────────────────────────────────────────────────── */
const FALLBACK_PRODUCT = {
  id: 31,
  title: "Hanley Whey Protein",
  img: "/images/hanley-whey-protein.jpg",
  price: 1999,
  rating: "4.9/5",
  stock: 100,
  featured: true,
  active: true,
};

/* ── Main carousel ───────────────────────────────────────────────────────── */
const FeatureProductsCarousel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const autoRef = useRef(null);

  const openQuickView = (product) => {
    setQuickViewProduct(product);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetch("//localhost:5000/api/product/getProducts?page=0&size=1000&sorted=true")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const featured = (data?.content || [])
          .filter((p) => p.featured === true && p.active !== false)
          .slice(0, 10);
        setProducts(featured.length ? featured : [FALLBACK_PRODUCT]);
        setLoading(false);
      })
      .catch(() => { setProducts([FALLBACK_PRODUCT]); setLoading(false); });
  }, []);

  const maxIndex = Math.max(0, products.length - VISIBLE);

  // Auto-advance
  useEffect(() => {
    if (!products.length) return;
    autoRef.current = setInterval(() => {
      setCurrent((c) => (c >= maxIndex ? 0 : c + 1));
    }, 3500);
    return () => clearInterval(autoRef.current);
  }, [products, maxIndex]);

  const goTo = (i) => { clearInterval(autoRef.current); setCurrent(Math.max(0, Math.min(i, maxIndex))); };
  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  if (loading) {
    return (
      <section className="fpc-section">
        <div className="fpc-skeleton-row">
          {Array.from({ length: VISIBLE }, (_, i) => (
            <div key={i} className="fpc-skeleton" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="fpc-section">
      {/* Header */}
      <div className="fpc-header">
        <span className="fpc-eyebrow">HANDPICKED FOR YOU</span>
        <h2 className="fpc-title">Featured Products</h2>
      </div>

      {/* Marquee */}
      <MarqueeStrip products={products} />

      {/* Carousel row */}
      <div className="fpc-carousel">
        <button
          className="fpc-nav fpc-nav--prev"
          onClick={prev}
          aria-label="Previous"
          disabled={current === 0}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Clipped viewport */}
        <div className="fpc-viewport">
          <div
            className="fpc-track"
            style={{ transform: `translateX(-${current * SLIDE_STEP}px)` }}
          >
            {products.map((p, i) => (
              <div key={p.id ?? i} className="fpc-slide">
                <FpcCard product={p} onQuickView={openQuickView} />
              </div>
            ))}
          </div>
        </div>

        <button
          className="fpc-nav fpc-nav--next"
          onClick={next}
          aria-label="Next"
          disabled={current >= maxIndex}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Dots — one per slide step */}
      <div className="fpc-dots">
        {Array.from({ length: maxIndex + 1 }, (_, i) => (
          <button
            key={i}
            className={`fpc-dot${i === current ? " fpc-dot--active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Go to position ${i + 1}`}
          />
        ))}
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
};

export default FeatureProductsCarousel;
