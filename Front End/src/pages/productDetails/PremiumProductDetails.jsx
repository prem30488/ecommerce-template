import React, { useContext, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ShopContext } from "../../context/shop-context";
import { WishlistContext } from "../../context/wishlist-context";
import WishlistIcon from "../../components/WishlistIcon";
import FrequentlyBoughtCarousel from "./FrequentlyBoughtCarousel";
import { findFrequentlyBoughtTogether } from "./eclatAlgorithm";
import StarRating from "./StarRating";
import Alert from "react-s-alert";
import axios from "axios";
import { API_BASE_URL } from "../../constants";
import "./premium-product.css";

// ─── Small helpers ───────────────────────────────────────────────
const Star = ({ filled }) => (
  <span className="ppp-star" style={{ color: filled ? "#f59e0b" : "#e2e8f0" }}>★</span>
);

const RatingStars = ({ rating = 4.5 }) => {
  const full = Math.floor(rating);
  return (
    <div className="ppp-stars">
      {[...Array(5)].map((_, i) => <Star key={i} filled={i < full} />)}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────
export const PremiumProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [allImages, setAllImages] = useState([]);
  const [flavors, setFlavors] = useState([]);
  const [selectedFlavor, setSelectedFlavor] = useState(null);
  const [selectedSize, setSelectedSize] = useState("M");
  const [faqs, setFaqs] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [frequentProducts, setFrequentProducts] = useState([]);

  const { addToCart, cartItems, martItems, lartItems } = useContext(ShopContext);

  // ── Fetch product ──────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/product/fetchById/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject("Not found"))
      .then(data => { setProduct(data); setLoading(false); })
      .catch(e => { setErr(String(e)); setLoading(false); });
  }, [id]);

  // ── Fetch folder images for active flavor ─────────────────────
  useEffect(() => {
    const flavorId = selectedFlavor || "default";
    const load = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/product/images/${id}/${flavorId}`);
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          setAllImages(json);
        } else {
          const fb = await fetch(`http://localhost:5000/api/product/images/${id}/default`);
          const fbj = await fb.json();
          setAllImages(Array.isArray(fbj) && fbj.length > 0 ? fbj : product?.img ? [product.img] : []);
        }
        setActiveImg(0);
      } catch { setAllImages(product?.img ? [product.img] : []); }
    };
    if (id) load();
  }, [id, selectedFlavor, product?.img]);

  // ── Fetch flavors ──────────────────────────────────────────────
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/flavor/getFlavors?size=1000`)
      .then(r => setFlavors(r.data.content || []))
      .catch(() => {});
  }, []);

  // ── Fetch FAQs ─────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:5000/api/faq?productId=${id}`)
      .then(r => r.json())
      .then(j => setFaqs(j.content || []))
      .catch(() => {});
  }, [id]);

  // ── Fetch frequently bought together ──────────────────────────
  useEffect(() => {
    if (!product) return;
    fetch("http://localhost:5000/api/product/getProducts?page=0&size=20")
      .then(r => r.json())
      .then(j => {
        const all = j.content || j;
        let recs = findFrequentlyBoughtTogether(product, all);
        if (recs.length < 3) {
          const rest = all.filter(p => p.id !== product.id && !recs.find(r => r.id === p.id));
          recs = [...recs, ...rest.sort(() => 0.5 - Math.random()).slice(0, 3 - recs.length)];
        }
        setFrequentProducts(recs.slice(0, 4));
      })
      .catch(() => {});
  }, [product?.id]);

  // ── Helpers ────────────────────────────────────────────────────
  const getSizeCount = () => {
    if (selectedSize === "S") return cartItems[product?.id] || 0;
    if (selectedSize === "M") return martItems[product?.id] || 0;
    return lartItems[product?.id] || 0;
  };

  const currentPrice = () => {
    if (!product) return 0;
    if (selectedSize === "S") return product.price;
    if (selectedSize === "M") return product.priceMedium;
    return product.priceLarge;
  };

  const handleAddToCart = () => {
    const total = (cartItems[product.id] || 0) + (martItems[product.id] || 0) + (lartItems[product.id] || 0);
    if (total < product.stock) {
      addToCart(product.id, selectedSize, selectedFlavor);
      Alert.success(`${product.title} added to collection!`);
    } else {
      Alert.warning("Out of stock!");
    }
  };

  const resolveImg = (src) =>
    src ? (src.startsWith("http") ? src : `http://localhost:5000${src}`) : "";

  // ── Size options ──────────────────────────────────────────────
  const sizes = product ? [
    { id: "S", label: "Small",  price: product.price,       unit: product.unitSmall  },
    { id: "M", label: "Medium", price: product.priceMedium, unit: product.unitMedium, popular: true },
    { id: "L", label: "Large",  price: product.priceLarge,  unit: product.unitLarge  },
  ] : [];

  // ── Loading / Error ───────────────────────────────────────────
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-14 h-14 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-bold text-sm">Loading product…</p>
    </div>
  );
  if (err || !product) return (
    <div className="h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
      <h2 className="text-2xl font-black text-slate-800">{err || "Product not found"}</h2>
      <Link to="/product" className="px-8 py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition-colors">
        ← Back to Products
      </Link>
    </div>
  );

  const displayImg = allImages[activeImg]
    ? resolveImg(allImages[activeImg])
    : (product.img ? resolveImg(product.img) : "https://placehold.co/600x600/f1f5f9/94a3b8?text=No+Image");

  return (
    <div className="ppp-root">
      {/* Breadcrumb */}
      <div className="ppp-breadcrumb">
        <Link to="/">Home</Link>
        <span>›</span>
        <Link to="/product">Products</Link>
        <span>›</span>
        <span>{product.title}</span>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="ppp-main">

        {/* ─── LEFT: Gallery ─── */}
        <div className="ppp-gallery">
          <div className="ppp-gallery-main">
            <img src={displayImg} alt={product.title} />
            <div className="ppp-gallery-badge">Premium</div>
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="ppp-thumbnails">
              {allImages.map((src, i) => (
                <div
                  key={i}
                  className={`ppp-thumb ${i === activeImg ? "active" : ""}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={resolveImg(src)} alt={`view-${i}`} />
                </div>
              ))}
            </div>
          )}

          {/* Benefit chips */}
          <div className="ppp-benefits">
            {[
              { icon: "🧪", label: "Lab Tested" },
              { icon: "🌿", label: "Natural Ingredients" },
              { icon: "🏆", label: "Award Winning" },
              { icon: "♻️", label: "Eco Packaging" },
            ].map(b => (
              <div key={b.label} className="ppp-benefit-chip">
                <span className="icon">{b.icon}</span> {b.label}
              </div>
            ))}
          </div>
        </div>

        {/* ─── RIGHT: Info ─── */}
        <div className="ppp-info">
          <div className="ppp-brand">{product.brand || "Premium Brand"}</div>
          <h1 className="ppp-title">{product.title}</h1>

          {/* Rating */}
          <div className="ppp-rating-row">
            <RatingStars rating={product.rating} />
            <span className="ppp-rating-num">{product.rating || "4.8"}</span>
            <span className="ppp-review-count">· 240 reviews</span>
          </div>

          {/* Price */}
          <div className="ppp-price-block">
            <div>
              <div className="ppp-price-label">Starting from</div>
              <div className="ppp-price-main">₹{currentPrice() || product.price}</div>
              <div className="ppp-price-tax">Inclusive of all taxes</div>
            </div>
            <div className="ppp-price-badge">🎉 Best Value</div>
          </div>

          <div className="ppp-divider" />

          {/* Flavor selector */}
          {flavors.length > 0 && (
            <>
              <div className="ppp-section-label">Choose Flavor</div>
              <div className="ppp-flavors">
                {flavors.map(f => (
                  <button
                    key={f.id}
                    className={`ppp-flavor-btn ${selectedFlavor === f.id ? "active" : ""}`}
                    onClick={() => setSelectedFlavor(f.id)}
                    title={f.name}
                  >
                    {f.image ? (
                      <img
                        src={resolveImg(f.image)}
                        alt={f.name}
                        className="ppp-flavor-img"
                      />
                    ) : (
                      <div className="ppp-flavor-placeholder">?</div>
                    )}
                    {f.name}
                  </button>
                ))}
              </div>
              <div className="ppp-divider" />
            </>
          )}

          {/* Size selector */}
          <div className="ppp-section-label">Choose Pack Size</div>
          <div className="ppp-sizes">
            {sizes.filter(s => s.price).map(s => (
              <div
                key={s.id}
                className={`ppp-size-option ${selectedSize === s.id ? "active" : ""}`}
                onClick={() => setSelectedSize(s.id)}
              >
                <div className="ppp-size-left">
                  <div className="ppp-size-radio">
                    {selectedSize === s.id && <div className="ppp-size-radio-dot" />}
                  </div>
                  <div>
                    <div className="ppp-size-name">{s.label}</div>
                    <div className="ppp-size-unit">{s.unit} {product.unit}</div>
                  </div>
                </div>
                <div className="ppp-size-right">
                  <div className="ppp-size-price">₹{s.price}</div>
                  {s.popular && <div className="ppp-size-popular">⚡ Best Seller</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Stock indicator */}
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>In Stock</span>
            <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>
              · {product.stock} units available
            </span>
          </div>

          {/* CTA */}
          <div className="ppp-cta-row">
            <button className="ppp-add-btn" onClick={handleAddToCart}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Add to Collection
              {getSizeCount() > 0 && (
                <span style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 10px', borderRadius: 100, fontSize: 11 }}>
                  {getSizeCount()} in cart
                </span>
              )}
            </button>
            <div>
              <WishlistIcon
                productId={String(product.id)}
                size="large"
                showText={false}
                customStyle={{
                  width: 54,
                  height: 54,
                  borderRadius: 14,
                  border: '2px solid #e2e8f0',
                  background: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              />
            </div>
          </div>

          {/* Trust strip */}
          <div className="ppp-trust">
            {[
              { icon: "🚚", label: "Free Shipping above ₹2000" },
              { icon: "🔄", label: "Easy 30-day Returns" },
              { icon: "🔒", label: "Secure Checkout" },
            ].map(t => (
              <div key={t.label} className="ppp-trust-item">
                <span className="ppp-trust-icon">{t.icon}</span>
                <span className="ppp-trust-label">{t.label}</span>
              </div>
            ))}
          </div>

          {/* Key highlights */}
          <div className="ppp-divider" />
          <div className="ppp-section-label">Key Highlights</div>
          <div className="ppp-highlights">
            {[
              { icon: "💊", title: "Clinically Dosed", body: "Each serving delivers precise, research-backed amounts of every active ingredient." },
              { icon: "🌿", title: "No Artificial Fillers", body: "Free from artificial colours, sweeteners, and unnecessary additives." },
              { icon: "✅", title: "Third-Party Tested", body: "Every batch is independently tested for purity and potency." },
              { icon: "🏋️", title: "Performance Driven", body: "Formulated to complement an active lifestyle and support peak performance." },
            ].map(h => (
              <div key={h.title} className="ppp-highlight-item">
                <div className="ppp-highlight-icon">{h.icon}</div>
                <div className="ppp-highlight-text">
                  <strong>{h.title}</strong> — {h.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BELOW THE FOLD ── */}
      <div className="ppp-below">

        {/* Stats */}
        <h2 className="ppp-section-title">By The Numbers</h2>
        <div className="ppp-stats">
          {[
            { num: "10K+", label: "Happy Customers" },
            { num: "4.8★", label: "Average Rating" },
            { num: "100%", label: "Purity Guaranteed" },
            { num: "30",   label: "Day Money Back" },
          ].map(s => (
            <div key={s.label} className="ppp-stat-card">
              <div className="ppp-stat-num">{s.num}</div>
              <div className="ppp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        <h2 className="ppp-section-title">About This Product</h2>
        <div className="ppp-desc-block">
          {product.description || "Premium quality supplement crafted with precision and care. Each serving is carefully dosed to deliver maximum results. Our formulas undergo rigorous third-party testing to ensure purity, potency, and safety. We believe in transparency — no proprietary blends, no hidden fillers, just pure science-backed ingredients."}
        </div>

        {/* Frequently Bought Together */}
        {frequentProducts.length > 0 && (
          <div className="ppp-bundle-section">
            <h2 className="ppp-section-title">Complete Your Stack</h2>
            <div style={{ background: '#fff', borderRadius: 28, padding: 40, border: '1px solid #e2e8f0' }}>
              <FrequentlyBoughtCarousel
                currentProduct={product}
                frequentProducts={frequentProducts}
              />
              <div style={{ marginTop: 32, paddingTop: 28, borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#94a3b8', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
                  Bundle Price
                </span>
                <div style={{ fontSize: 44, fontWeight: 900, color: '#0ea5e9', letterSpacing: '-0.04em', marginBottom: 24 }}>
                  ₹{(Number(product.price) + frequentProducts.reduce((s, p) => s + Number(p.price), 0)).toLocaleString()}
                </div>
                <button
                  style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: 16, padding: '16px 40px', fontWeight: 900, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.target.style.background = '#0ea5e9'}
                  onMouseLeave={e => e.target.style.background = '#0f172a'}
                >
                  Add Bundle to Collection →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FAQs */}
        {faqs.filter(f => f.isActive).length > 0 && (
          <>
            <h2 className="ppp-section-title">Frequently Asked Questions</h2>
            <div className="ppp-faq-list">
              {faqs.filter(f => f.isActive).map(faq => (
                <div key={faq.id} className={`ppp-faq-item ${openFaq === faq.id ? "open" : ""}`}>
                  <button
                    className="ppp-faq-trigger"
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  >
                    {faq.question}
                    <span className="ppp-faq-chevron">›</span>
                  </button>
                  <div className="ppp-faq-body">{faq.answer}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PremiumProductDetails;
