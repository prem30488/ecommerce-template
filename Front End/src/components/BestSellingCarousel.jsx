import { useState, useEffect, useContext, useRef } from "react";
import { COMPANY_INFO } from '../constants/companyInfo';
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/shop-context";
import Alert from "react-s-alert";
import "./bestsellingcarousel.css";
import WishlistIcon from "./WishlistIcon";
import { FaEye } from "react-icons/fa";
import QuickViewModal from "./QuickViewModal";
import { API_BASE_URL } from "../constants";
/* ── Constants ──────────────────────────────────────────────────────────── */
const CARD_WIDTH = 200;   // px
const GAP = 16;    // px between cards
const VISIBLE = 5;     // cards shown at once
const SLIDE_STEP = CARD_WIDTH + GAP;

/* ── Offer label ────────────────────────────────────────────────────────── */
const getOfferLabel = (offers) => {
  if (!offers || !offers.length) return null;
  const o = offers.find((x) => x.active);
  if (!o) return null;
  if ((o.type === 1 || o.type === 2 || o.type === 3) && o.buy && o.buyget)
    return `Buy ${o.buy} Get ${o.buyget} Free`;
  if (o.discount > 0) return `${o.discount}% OFF`;
  return null;
};

/* ── Star rating ─────────────────────────────────────────────────────────── */
const Stars = ({ rating }) => {
  const score = parseFloat((rating || "0").split("/")[0]);
  const full = Math.floor(score);
  const half = score - full >= 0.5;
  return (
    <span className="bsc-stars">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={
            i < full ? "bsc-star bsc-star--on"
              : i === full && half ? "bsc-star bsc-star--half"
                : "bsc-star"
          }
        >★</span>
      ))}
    </span>
  );
};

/* ── Marquee strip ───────────────────────────────────────────────────────── */
const MarqueeStrip = ({ products }) => {
  // Build one item per product — use offer label if available, else fallback text
  const items = products.map((p) => {
    const lbl = getOfferLabel(p.offers);
    return {
      name: p.title.slice(0, 22),
      label: lbl,
      hasOffer: !!lbl,
    };
  });

  if (!items.length) return null;

  const doubled = [...items, ...items]; // seamless infinite loop

  return (
    <div className="bsc-marquee-wrapper" aria-hidden="true">
      <div className="bsc-marquee-track">
        {doubled.map((item, i) => (
          <span
            key={i}
            className={`bsc-marquee-item${item.hasOffer ? "" : " bsc-marquee-item--muted"
              }`}
          >
            <span className="bsc-marquee-sep">◆</span>
            <span className="bsc-marquee-name">{item.name}</span>
            <span className="bsc-marquee-divider">—</span>
            <span className={`bsc-marquee-label${item.hasOffer ? " bsc-marquee-label--offer" : ""
              }`}>
              {item.hasOffer ? item.label : "No active offers"}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};

/* ── Card-level marquee (per-product offers) ────────────────────────────── */
const getAllOfferLabels = (offers) => {
  if (!offers || !offers.length) return [];
  return offers
    .filter((o) => o.active)
    .map((o) => {
      if ((o.type === 1 || o.type === 2 || o.type === 3) && o.buy && o.buyget)
        return `Buy ${o.buy} Get ${o.buyget} Free`;
      if (o.discount > 0) return `${o.discount}% OFF`;
      return null;
    })
    .filter(Boolean);
};

const CardMarquee = ({ offers }) => {
  const labels = getAllOfferLabels(offers);
  const hasOffers = labels.length > 0;

  // Always at least two copies so the loop is seamless
  const items = hasOffers ? [...labels, ...labels] : ["No active offers on this product.", "No active offers on this product."];

  return (
    <div className={`bsc-card-marquee${hasOffers ? " bsc-card-marquee--has-offer" : " bsc-card-marquee--empty"}`}>
      <div className="bsc-card-marquee-track">
        {items.map((txt, i) => (
          <span key={i} className="bsc-card-marquee-item">
            {hasOffers && <span className="bsc-card-marquee-tag">🏷</span>}
            {txt}
            <span className="bsc-card-marquee-sep">·</span>
          </span>
        ))}
      </div>
    </div>
  );
};

/* ── Single card (compact for multi-item layout) ─────────────────────────── */
const BscCard = ({ product, onQuickView }) => {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useContext(ShopContext);

  const { id, title, stock, rating, img, offers } = product;
  const price = product.productFlavors?.[0]?.price || 0;
  const firstFlavorId = product.productFlavors?.[0]?.flavor_id;

  const categoryLabel = product.Category?.title || product.category || (product.catIds ? String(product.catIds).split(',').map(Number).join(', ') : 'Uncategorized');
  const formLabel = product.Form?.title || product.form?.title || (product.form ? String(product.form) : (product.formId ? `Form #${product.formId}` : 'No form'));

  const cartCount = Object.keys(cartItems).reduce((sum, key) => key.startsWith(`${id}_`) ? sum + cartItems[key] : sum, 0);
  const offerLabel = getOfferLabel(offers);
  const activeOffer = offers?.find((o) => o.active);
  const discPrice =
    activeOffer && activeOffer.type === 0 && activeOffer.discount > 0
      ? (price - (price * activeOffer.discount) / 100).toFixed(0)
      : null;

  // Fallback image from picsum if img is missing
  const imgSrc = product.image || img || `https://picsum.photos/seed/${encodeURIComponent(id)}/400/400`;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (cartCount >= stock) { Alert.info("Item out of stock!"); return; }
    addToCart(id, "S", firstFlavorId);
    Alert.success(`${title.slice(0, 20)} added!`);
  };

  return (
    <article className="bsc-card" tabIndex={0}>
      {/* Offer badge */}
      {offerLabel && <span className="bsc-offer-badge">{offerLabel}</span>}

      {/* Main image area */}
      <div
        className="bsc-main-img-wrap"
        onClick={() => navigate("/productDetails/" + id)}
        role="button"
        tabIndex={-1}
        aria-label={`View ${title}`}
      >
        <img
          className="bsc-main-img"
          src={imgSrc}
          alt={title}
          title={COMPANY_INFO.name}
          loading="lazy"
          onError={(e) => {
            e.target.src = `https://placehold.co/400x400?text=Product`;
          }}
        />
        {/* Plus Button - Top */}
        <button
          className="bsc-plus-btn"
          onClick={handleAdd}
          title="Add to cart"
          aria-label="Add to cart"
          disabled={stock === 0}
          style={{ top: '0.55rem' }}
        >
          {cartCount > 0
            ? <span className="bsc-plus-count">{cartCount}</span>
            : <span className="bsc-plus-icon">+</span>}
        </button>

        {/* Quick View Button - Middle */}
        <button
          className="bsc-eye-btn"
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

      {/* Card-level offer marquee */}
      <CardMarquee offers={offers} />

      {/* Info */}
      <div className="bsc-card-info">
        <div className="bsc-card-meta">
          <span className="bsc-card-meta-item bsc-card-meta-category">{categoryLabel}</span>
          <span className="bsc-card-meta-item bsc-card-meta-form">{formLabel}</span>
        </div>
        <h3 className="bsc-card-title" onClick={() => navigate("/productDetails/" + id)}>
          {title.length > 22 ? title.slice(0, 22) + "…" : title}
        </h3>
        <Stars rating={rating} />
        <div className="bsc-price-row">
          <span className="bsc-price-now">
            ₹{parseFloat(discPrice ?? price).toLocaleString("en-IN")}
          </span>
          {discPrice && (
            <span className="bsc-price-was">
              ₹{parseFloat(price).toLocaleString("en-IN")}
            </span>
          )}
        </div>
        <button className="bsc-info-btn" onClick={() => navigate("/productDetails/" + id)}>
          More Info
        </button>

      </div>
    </article>
  );
};

/* ── Fallback product ────────────────────────────────────────────────────── */
const WHEY_FALLBACK = {
  id: 31,
  title: "Hanley Whey Protein",
  img: "/images/hanley-whey-protein.jpg",
  price: 1999,
  rating: "4.9/5",
  stock: 100,
  bestseller: true,
  active: true,
  offers: [{ discount: 10, type: 0, active: true }],
  Category: { title: "Proteins" },
  Form: { title: "Powder" },
};

/* ── Main carousel ───────────────────────────────────────────────────────── */
const BestSellingCarousel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const autoRef = useRef(null);
  const { products: shopProducts } = useContext(ShopContext);

  const openQuickView = (product) => {
    setQuickViewProduct(product);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const best = (shopProducts || [])
      .filter((p) => p.bestseller === true && p.active !== false)
      .slice(0, 10);
    setProducts(best.length ? best : [WHEY_FALLBACK]);
    setLoading(false);
  }, [shopProducts]);

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
      <section className="bsc-section">
        <div className="bsc-skeleton-row">
          {Array.from({ length: VISIBLE }, (_, i) => (
            <div key={i} className="bsc-skeleton" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="bsc-section">
      {/* Header */}
      <div className="bsc-header">
        <span className="bsc-eyebrow">FUEL YOUR FITNESS GOALS</span>
        <h2 className="bsc-title">Top Performance Picks</h2>
      </div>

      {/* Marquee */}
      <MarqueeStrip products={products} />

      {/* Carousel row */}
      <div className="bsc-carousel">
        <button
          className="bsc-nav bsc-nav--prev"
          onClick={prev}
          aria-label="Previous"
          disabled={current === 0}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Clipped viewport */}
        <div className="bsc-viewport">
          <div
            className="bsc-track"
            style={{ transform: `translateX(-${current * SLIDE_STEP}px)` }}
          >
            {products.map((p, i) => (
              <div key={p.id ?? i} className="bsc-slide">
                <BscCard product={p} onQuickView={openQuickView} />
              </div>
            ))}
          </div>
        </div>

        <button
          className="bsc-nav bsc-nav--next"
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
      <div className="bsc-dots">
        {Array.from({ length: maxIndex + 1 }, (_, i) => (
          <button
            key={i}
            className={`bsc-dot${i === current ? " bsc-dot--active" : ""}`}
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

export default BestSellingCarousel;
