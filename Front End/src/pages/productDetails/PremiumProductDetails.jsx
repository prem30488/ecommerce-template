import React, { useContext, useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ShopContext } from "../../context/shop-context";
import { WishlistContext } from "../../context/wishlist-context";
import WishlistIcon from "../../components/WishlistIcon";
import FrequentlyBoughtCarousel from "./FrequentlyBoughtCarousel";
import { findFrequentlyBoughtTogether } from "./eclatAlgorithm";
import StarRating from "./StarRating";
import Alert from "react-s-alert";
import axios from "axios";
import { API_BASE_URL } from "../../constants";
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./premium-product.css";
import Compare from "../../components/Compare";
import SimilarProducts from "../../components/SimilarProducts";

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
  const navigate = useNavigate();
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
  const [reviews, setReviews] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', email: '', rating: 5, comment: '' });
  const [bundleSelections, setBundleSelections] = useState(null); // { allProducts, selections }
  const [isImageOverlayOpen, setIsImageOverlayOpen] = useState(false);

  const { addToCart, addFreeToCart, removeFromCart, cartItems, martItems, lartItems, flavorCart, categories: allCategories, products: allProducts, addToCompare, removeFromCompare, selectedItems } = useContext(ShopContext);

  // ── Category & Form Resolution ──────────────────────────────────
  const categoryItems = new Set();
  if (product) {
    if (product.Category?.title) categoryItems.add(product.Category.title);
    if (product.category) {
      String(product.category).split(',').map(c => c.trim()).filter(Boolean).forEach(c => categoryItems.add(c));
    }
    if (product.catIds && allCategories?.length > 0) {
      const idList = String(product.catIds).split(',').map(id => id.trim()).filter(Boolean);
      idList.forEach(id => {
        const catObj = allCategories.find(c => String(c.id) === String(id));
        if (catObj && catObj.title) categoryItems.add(catObj.title);
      });
    }
    if (product.categories && Array.isArray(product.categories)) {
      product.categories.forEach(c => {
        const title = typeof c === 'string' ? c : c.title || String(c);
        if (title) categoryItems.add(title);
      });
    }
  }
  const visibleCategories = Array.from(categoryItems);
  const getFormLabel = () => {
    if (product?.Form?.title) return product.Form.title;
    if (typeof product?.form === 'string' && product.form.trim()) return product.form;
    if (product?.form && typeof product.form !== 'object') return `Form #${product.form}`;
    //if (product?.formId) return `Form #${product.formId}`;
    return 'No Form';
  };
  const formLabel = getFormLabel();

  // ── Fetch product ──────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/product/fetchById/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject("Not found"))
      .then(async data => {
        setProduct(data);
        try {
          // Ensure offers are loaded — some API variants return offers separately
          const resp = await axios.get(`${API_BASE_URL}/api/offer/getOffersByProductId/${id}`);
          const offers = Array.isArray(resp.data) ? resp.data : (resp.data?.content || []);
          if (offers && offers.length) {
            setProduct(prev => ({ ...(prev || data), offers }));
          }
          if (data.faqs) setFaqs(data.faqs);
          if (data.reviews) setReviews(data.reviews);
        } catch (e) {
          // ignore; product may already contain offers
        }
        if (data.productFlavors && data.productFlavors.length > 0) {
          const firstFlavor = data.productFlavors[0];
          setSelectedFlavor(firstFlavor.flavor_id);
          if (!firstFlavor.priceMedium && firstFlavor.price) {
            setSelectedSize("S");
          } else if (firstFlavor.priceMedium) {
            setSelectedSize("M");
          }
        }
        setLoading(false);
      })
      .catch(e => { setErr(String(e)); setLoading(false); });
  }, [id]);

  // ── Resolve images for active flavor from already-loaded product data ──
  useEffect(() => {
    if (!product) return;

    const flavorId = selectedFlavor;
    const allProdImages = product.images || product.ProductImages || [];

    // Filter images for the selected flavor
    const flavorImages = flavorId
      ? allProdImages.filter(img => String(img.flavor_id) === String(flavorId)).map(img => img.url)
      : [];

    // Deduplicate images
    const uniqueFlavorImages = [...new Set(flavorImages)];

    let finalImages = [];

    if (uniqueFlavorImages.length > 0) {
      finalImages = [...uniqueFlavorImages];
    }

    // If no images for this specific flavor, fallback to all images
    if (finalImages.length === 0 && allProdImages.length > 0) {
      finalImages = [...new Set(allProdImages.map(img => img.url))];
    }

    // Fallback to primary product image
    if (finalImages.length === 0 && product.img) {
      finalImages.push(product.img);
    }

    setAllImages(finalImages);
    setActiveImg(0);
  }, [selectedFlavor, product]);

  // ── Fetch flavors ──────────────────────────────────────────────
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/flavor/getFlavors?size=1000`)
      .then(r => setFlavors(r.data.content || []))
      .catch(() => { });
  }, []);

  // ── Fetch FAQs ─────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE_URL}/api/faq?productId=${id}&size=100`)
      .then(r => r.json())
      .then(j => {
        const items = j.content || j || [];
        setFaqs(Array.isArray(items) ? items : []);
      })
      .catch(() => { });
  }, [id]);

  // ── Frequently bought together ──────────────────────────
  useEffect(() => {
    if (!product || !allProducts || allProducts.length === 0) return;
    try {
      const all = allProducts;
      let recs = findFrequentlyBoughtTogether(product, all);
      if (recs.length < 3) {
        const rest = all.filter(p => p.id !== product.id && !recs.find(r => r.id === p.id));
        recs = [...recs, ...rest.sort(() => 0.5 - Math.random()).slice(0, 3 - recs.length)];
      }
      setFrequentProducts(recs.slice(0, 4));
    } catch (e) {
      // ignore
    }
  }, [product, allProducts]);

  // ── Fetch Reviews ──────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE_URL}/api/review?productId=${id}&size=100`)
      .then(r => r.json())
      .then(j => {
        const items = j.content || j || [];
        setReviews(Array.isArray(items) ? items : []);
      })
      .catch(() => { });
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/review`, { ...newReview, productId: id });
      Alert.success("Thank you! Your review is pending approval.");
      setIsReviewModalOpen(false);
      setNewReview({ name: '', email: '', rating: 5, comment: '' });
    } catch (err) {
      Alert.error("Failed to submit review.");
    }
  };

  const avgRating = reviews.length ? (reviews.reduce((a, b) => a + Number(b.rating), 0) / reviews.length).toFixed(1) : "0.0";
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => Number(r.rating) === star).length,
    percentage: reviews.length ? (reviews.filter(r => Number(r.rating) === star).length / reviews.length) * 100 : 0
  }));

  // ── Helpers ────────────────────────────────────────────────────
  const getSizeCount = () => {
    const cartKey = selectedFlavor ? `${product?.id}_${selectedFlavor}` : product?.id;
    if (selectedSize === "S") return cartItems[cartKey] || 0;
    if (selectedSize === "M") return martItems[cartKey] || 0;
    return lartItems[cartKey] || 0;
  };

  const activeFlavorData = product?.productFlavors?.find(pf => String(pf.flavor_id) === String(selectedFlavor));

  const currentPrice = () => {
    if (activeFlavorData) {
      if (selectedSize === "S") return activeFlavorData.price || 0;
      if (selectedSize === "M") return activeFlavorData.priceMedium || 0;
      return activeFlavorData.priceLarge || 0;
    }
    return product?.price || 0;
  };

  const activeOffer = product?.offers?.find(
    (o) =>
      o.active &&
      o.discount > 0 &&
      o.type === 0 &&
      normalizeSize(o.size) === normalizeSize(selectedSize)
  );
  // Consider any offer that has a buy & buyget >= 1 as a free-offer (some offers use type 0)
  const activeFreeOffer = product?.offers?.find((o) => {
    const isActive = o.active === true || String(o.active).toLowerCase() === "true";
    return (
      isActive &&
      Number(o.buy) >= 1 &&
      Number(o.buyget) >= 1 &&
      normalizeSize(o.size) === normalizeSize(selectedSize)
    );
  });

  // helper to map size id to human label
  function getSizeLabel(sz) {
    const s = String(sz || '').trim().toUpperCase();
    if (!s) return '';
    if (s.startsWith('S')) return 'Small';
    if (s.startsWith('M')) return 'Medium';
    if (s.startsWith('L')) return 'Large';
    return sz;
  }
  // normalize various size representations to canonical short id: 'S'|'M'|'L'
  function normalizeSize(sz) {
    const s = String(sz || '').trim().toUpperCase();
    if (!s) return '';
    if (s.startsWith('S')) return 'S';
    if (s.startsWith('M')) return 'M';
    if (s.startsWith('L')) return 'L';
    return s;
  }
  const displayPrice = currentPrice() || product?.price || 0;
  const discountedPrice = activeOffer
    ? Math.round(displayPrice * (1 - activeOffer.discount / 100))
    : displayPrice;
  const offerLabel = activeOffer
    ? `${Math.round(activeOffer.discount)}% off`
    : null;

  const handleBuyNow = () => {
    // Attempt to add. If it succeeds, navigate.
    if (addToCart(product.id, selectedSize, selectedFlavor)) {
      navigate('/checkout');
    } else if (getSizeCount() > 0) {
      // If add failed but we already have items (e.g. at max stock), still allow going to checkout
      navigate('/checkout');
    }
  };

  const handleAddToCart = () => {
    return addToCart(product.id, selectedSize, selectedFlavor);
  };

  const resolveImg = (src) => {
    if (!src) return "";
    let cleanSrc = src.trim();
    // If it's a full backend URL, convert it to a root-relative path to use the Vercel proxy
    if (cleanSrc.startsWith('https://ecommerce-template-api-mu.vercel.app')) {
      cleanSrc = cleanSrc.replace('https://ecommerce-template-api-mu.vercel.app', '');
    }
    // If it doesn't start with http, ensure it has a leading slash
    if (!cleanSrc.startsWith('http')) {
      return cleanSrc.startsWith('/') ? cleanSrc : `/${cleanSrc}`;
    }
    return cleanSrc;
  };

  // ── Size options ──────────────────────────────────────────────
  const sizes = product && activeFlavorData ? [
    { id: "S", label: "Small", price: activeFlavorData.price, unit: product.unitSmall },
    { id: "M", label: "Medium", price: activeFlavorData.priceMedium, unit: product.unitMedium, popular: true },
    { id: "L", label: "Large", price: activeFlavorData.priceLarge, unit: product.unitLarge },
  ].filter(s => s.price) : [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questionData, setQuestionData] = useState({ name: '', email: '', phone: '', comment: '' });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      Alert.info("Link copied to clipboard!");
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        question: questionData.comment,
        askedBy: questionData.name,
        productId: product.id,
      };
      // Guest-friendly submission (Public endpoint now enabled in backend)
      await axios.post(`${API_BASE_URL}/api/faq`, payload);
      Alert.success("Question submitted! We will respond shortly.");
      setIsModalOpen(false);
      setQuestionData({ name: '', email: '', phone: '', comment: '' });
    } catch (err) {
      console.error("FAQ Submission Error:", err);
      const errMsg = err.response?.data?.error || "Failed to submit question. Please try again.";
      Alert.error(errMsg);
    }

  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-14 h-14 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-bold text-sm">Loading product…</p>
    </div>
  );
  if (err || !product) return (
    <div className="h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
      <h2 className="text-2xl font-black text-slate-800">{err || "Product not found"}</h2>
      <Link to="/products" className="px-8 py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition-colors">
        ← Back to Products
      </Link>
    </div>
  );

  const displayImg = allImages[activeImg]
    ? resolveImg(allImages[activeImg])
    : (product.img ? resolveImg(product.img) : "https://placehold.co/600x600/f1f5f9/94a3b8?text=No+Image");

  return (
    <div className="ppp-root" style={{ "paddingTop": "100px" }}>
      {/* Question Modal */}
      {isModalOpen && (
        <div className="ppp-modal-overlay">
          <div className="ppp-modal-card">
            <div className="ppp-modal-header">
              <h3>Ask A Question</h3>
              <button
                className="ppp-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleQuestionSubmit} className="ppp-modal-form">
              <div className="ppp-form-row">
                <div className="ppp-form-group">
                  <label>Name</label>
                  <input
                    required
                    value={questionData.name}
                    onChange={e => setQuestionData({ ...questionData, name: e.target.value })}
                    placeholder="Your Full Name"
                  />
                </div>
                <div className="ppp-form-group">
                  <label>Email</label>
                  <input
                    required
                    type="email"
                    value={questionData.email}
                    onChange={e => setQuestionData({ ...questionData, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div className="ppp-form-group">
                <label>Phone number</label>
                <input
                  required
                  value={questionData.phone}
                  onChange={e => setQuestionData({ ...questionData, phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div className="ppp-form-group">
                <label>Comment</label>
                <textarea
                  required
                  rows="4"
                  value={questionData.comment}
                  onChange={e => setQuestionData({ ...questionData, comment: e.target.value })}
                  placeholder="Ask anything about this product..."
                />
              </div>
              <button type="submit" className="ppp-submit-btn">
                SUBMIT NOW
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="ppp-breadcrumb">
        <Link to="/">Home</Link>
        <span>›</span>
        <Link to="/products">Products</Link>
        <span>›</span>
        <span>{product.title}</span>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="ppp-main">

        {/* ─── LEFT: Gallery ─── */}
        <div className="ppp-gallery">
          <div className="ppp-gallery-main">
            {allImages.length > 0 ? (
              <Carousel
                showArrows={true}
                showThumbs={true}
                infiniteLoop={false}
                stopOnHover={true}
                showStatus={false}
                selectedItem={activeImg}
                onChange={(index) => setActiveImg(index)}
                onClickItem={() => setIsImageOverlayOpen(true)}
                key={selectedFlavor || 'default'}
                className="ppp-main-carousel"
              >
                {allImages.map((src, i) => (
                  <div key={i} className="ppp-carousel-item" style={{ cursor: 'zoom-in' }}>
                    <img src={resolveImg(src)} alt={`${product.title} view ${i}`} />
                  </div>
                ))}
              </Carousel>
            ) : (
              <img src="https://placehold.co/600x600/f1f5f9/94a3b8?text=No+Image" alt="placeholder" style={{ borderRadius: '24px' }} />
            )}
            <div className="ppp-gallery-badge">PREMIUM</div>
          </div>

          {/* Image Overlay Modal */}
          {isImageOverlayOpen && (
            <div className="ppp-image-overlay" onClick={() => setIsImageOverlayOpen(false)}>
              <button className="ppp-overlay-close" onClick={() => setIsImageOverlayOpen(false)}>×</button>
              <div className="ppp-overlay-content" onClick={e => e.stopPropagation()}>
                <Carousel
                  showArrows={true}
                  showThumbs={true}
                  infiniteLoop={true}
                  showStatus={false}
                  selectedItem={activeImg}
                  onChange={(index) => setActiveImg(index)}
                  key="overlay-carousel"
                >
                  {allImages.map((src, i) => (
                    <div key={i} className="ppp-overlay-item">
                      <img src={resolveImg(src)} alt={`${product.title} view ${i}`} />
                    </div>
                  ))}
                </Carousel>
              </div>
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

          {/* Category & Form Chips */}
          {(visibleCategories.length > 0 || formLabel) && (
            <div className="ppp-meta-chips mb-4 flex flex-wrap gap-2">
              {visibleCategories.map((cat, idx) => (
                <span key={`cat-${idx}`} className="ppp-chip ppp-chip-category">{cat}</span>
              ))}
              {formLabel && (
                <span className="ppp-chip ppp-chip-form">{formLabel}</span>
              )}
            </div>
          )}

          <h1 className="ppp-title">{product.title}</h1>

          {/* Rating */}
          <div className="ppp-rating-row">
            <RatingStars rating={avgRating} />
            <span className="ppp-rating-num">{avgRating}</span>
            <span className="ppp-review-count">· {reviews.length} reviews</span>
          </div>

          {/* Price */}
          <div className="ppp-price-block">
            <div>
              <div className="ppp-price-label" style={{ "color": "#fff" }}>Starting from</div>
              <div className="ppp-price-row">
                {activeOffer && displayPrice > discountedPrice && (
                  <span className="ppp-price-original">₹{displayPrice}</span>
                )}
                <span className="ppp-price-main">₹{discountedPrice}</span>
              </div>
              {offerLabel && (
                <div className="ppp-offer-line">
                  <span className="ppp-offer-icon" aria-hidden="true">
                    <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                      <path d="M4 2h8l4 4v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                      <path d="M5 6a1 1 0 1 0 0 2h10a1 1 0 1 0 0-2H5zm0 4a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H5z" fill="#fff" opacity=".6" />
                    </svg>
                  </span>
                  <span>{offerLabel}</span>
                </div>
              )}
              {activeFreeOffer && (
                <div className="ppp-free-offer">
                  <span className="ppp-free-icon">🎁</span>
                  <div>
                    Special Offer: Buy {activeFreeOffer?.buy || 1} {getSizeLabel(activeFreeOffer.size || selectedSize)} pack and get {activeFreeOffer?.buyget || 1} {getSizeLabel(activeFreeOffer.freeProductsize || activeFreeOffer.size || selectedSize)} pack free
                  </div>
                </div>
              )}
              <div className="ppp-price-tax">Inclusive of all taxes</div>
            </div>
            <div className="ppp-price-badge">🎉 Best Value</div>
          </div>

          <div className="ppp-divider" />

          {/* Flavor selector */}
          {product?.productFlavors?.length > 0 && (
            <>
              <div className="ppp-section-label">Choose Flavor</div>
              <div className="ppp-flavors">
                {product.productFlavors.filter(pf => pf.Flavor).map((pf, index) => {
                  const f = pf.Flavor;
                  const prodImages = product.images || product.ProductImages || [];
                  const flavorImagesForThisFlavor = prodImages.filter(img => String(img.flavor_id) === String(f.id)).map(img => img.url);
                  const flavorImg = flavorImagesForThisFlavor.length > 0 ? flavorImagesForThisFlavor[0] : null;

                  // Enable if it's one of the product's official flavors
                  const isAssignedFlavor = product.productFlavors.some(pf => String(pf.flavor_id) === String(f.id));
                  const isDisabled = !flavorImg && !isAssignedFlavor && index !== 0;

                  const displayThumb = flavorImg || f.image;

                  return (
                    <button
                      key={f.id}
                      className={`ppp-flavor-btn ${String(selectedFlavor) === String(f.id) ? "active" : ""} ${isDisabled ? "disabled" : ""}`}
                      onClick={() => { if (!isDisabled) setSelectedFlavor(f.id); }}
                      disabled={isDisabled}
                      title={f.name}
                      style={{ opacity: isDisabled ? 0.5 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                    >
                      {displayThumb ? (
                        <img
                          src={resolveImg(displayThumb)}
                          alt={f.name}
                          className="ppp-flavor-img"
                        />
                      ) : (
                        <div className="ppp-flavor-placeholder">?</div>
                      )}
                      {f.name}
                    </button>
                  )
                })}
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

          {/* Free-offer banner shown when matching free offer is active for the selected size */}


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
            {getSizeCount() > 0 ? (
              /* ── Quantity stepper (shown once item is in cart) ── */
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                background: '#f8fafc',
                border: '2px solid #e2e8f0',
                borderRadius: 16,
                overflow: 'hidden',
                height: 54,
              }}>
                <button
                  onClick={() => removeFromCart(product.id, selectedSize)}
                  style={{
                    width: 54, height: '100%', border: 'none', background: 'transparent',
                    fontSize: 22, fontWeight: 900, color: '#64748b', cursor: 'pointer',
                    transition: 'all 0.15s', flexShrink: 0,
                  }}
                  onMouseEnter={e => { e.target.style.background = '#fee2e2'; e.target.style.color = '#ef4444'; }}
                  onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#64748b'; }}
                >
                  −
                </button>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{getSizeCount()}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>in cart</div>
                </div>
                <button
                  onClick={handleAddToCart}
                  style={{
                    width: 54, height: '100%', border: 'none', background: '#0ea5e9',
                    fontSize: 22, fontWeight: 900, color: '#fff', cursor: 'pointer',
                    transition: 'all 0.15s', flexShrink: 0,
                  }}
                  onMouseEnter={e => e.target.style.background = '#0369a1'}
                  onMouseLeave={e => e.target.style.background = '#0ea5e9'}
                >
                  +
                </button>
              </div>
            ) : (
              /* ── Add button (shown when 0 in cart) ── */
              <button className="ppp-add-btn" onClick={handleAddToCart} style={{ flex: 1 }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </button>
            )}

            <button
              className="ppp-buy-now-btn"
              onClick={handleBuyNow}
              style={{
                flex: 1,
                height: 54,
                backgroundColor: '#0f172a',
                color: '#fff',
                borderRadius: 16,
                fontWeight: 800,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={e => e.target.style.backgroundColor = '#1e293b'}
              onMouseLeave={e => e.target.style.backgroundColor = '#0f172a'}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Buy Now
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

            {/* Compare Button */}
            <div>
              <button
                onClick={() => {
                  const isItemCompared = selectedItems.some(p => p.id === product.id);
                  if (isItemCompared) {
                    removeFromCompare(product);
                    Alert.info("Removed from comparison");
                  } else {
                    addToCompare(product);
                    Alert.success("Added to comparison");
                  }
                }}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 14,
                  border: `2px solid ${selectedItems.some(p => p.id === product.id) ? '#0ea5e9' : '#e2e8f0'}`,
                  background: selectedItems.some(p => p.id === product.id) ? '#f0f9ff' : '#fff',
                  color: selectedItems.some(p => p.id === product.id) ? '#0ea5e9' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                title={selectedItems.some(p => p.id === product.id) ? "Remove from comparison" : "Add to comparison"}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
            </div>
          </div>

          {/* NEW: Ask Question & Share */}
          <div className="ppp-secondary-actions">
            <button className="ppp-sec-btn" onClick={() => setIsModalOpen(true)}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Ask A Question
            </button>
            <button className="ppp-sec-btn" onClick={handleShare}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              Share
            </button>
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

      <div className="ppp-below">

        {/* Stats */}
        <h2 className="ppp-section-title">By The Numbers</h2>
        <div className="ppp-stats">
          {[
            { num: "10K+", label: "Happy Customers" },
            { num: "4.8★", label: "Average Rating" },
            { num: "100%", label: "Purity Guaranteed" },
            { num: "30", label: "Day Money Back" },
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
          {product.description || "Premium quality supplement crafted with precision and care. Each serving is carefully dosed to deliver maximum results. Our formulas undergo rigorous third-party testing to ensure purity, potency, and safety. We believe in transparency - no proprietary blends, no hidden fillers, just pure science-backed ingredients."}
        </div>


        {/* FAQs */}
        {faqs.filter(f => f.isActive !== false).length > 0 && (
          <>
            <h2 className="ppp-section-title">Frequently Asked Questions</h2>
            <div className="ppp-faq-list">
              {faqs.filter(f => f.isActive !== false).map(faq => (
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
        {/* Customer Reviews Section */}
        <div id="reviews" className="ppp-reviews-section">
          <h2 className="ppp-section-title">Customer Reviews</h2>

          <div className="ppp-reviews-overview">
            <div className="ppp-overview-left">
              <div className="ppp-avg-box">
                <div className="ppp-avg-num">{avgRating}</div>
                <div className="ppp-avg-label">out of 5</div>
              </div>
              <div className="ppp-total-count">Based on {reviews.length} reviews</div>
              <RatingStars rating={avgRating} />
            </div>

            <div className="ppp-overview-middle">
              {ratingCounts.map(rc => (
                <div key={rc.star} className="ppp-rating-row">
                  <div className="ppp-star-label">{rc.star} <Star filled={true} /></div>
                  <div className="ppp-bar-bg">
                    <div className="ppp-bar-fill" style={{ width: `${rc.percentage}%` }} />
                  </div>
                  <div className="ppp-count-label">{rc.count}</div>
                </div>
              ))}
            </div>

            <div className="ppp-overview-right">
              <button
                className="ppp-write-btn"
                onClick={() => setIsReviewModalOpen(true)}
              >
                WRITE A REVIEW
              </button>
            </div>
          </div>

          <div className="ppp-divider" style={{ margin: '40px 0' }} />

          <div className="ppp-reviews-list">
            {reviews.length > 0 ? (
              reviews.map(rev => (
                <div key={rev.id} className="ppp-review-card">
                  <div className="ppp-rev-header">
                    <div className="ppp-rev-user">
                      <div className="ppp-rev-avatar">
                        {rev.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="ppp-rev-name">{rev.name}</div>
                        <div className="ppp-rev-date">{new Date(rev.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <RatingStars rating={rev.rating} />
                  </div>
                  <div className="ppp-rev-body">{rev.comment}</div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                No reviews yet. Be the first to share your experience!
              </div>
            )}
          </div>
        </div>

        {/* Write Review Modal */}
        {isReviewModalOpen && (
          <div className="ppp-modal-overlay">
            <div className="ppp-modal-card">
              <div className="ppp-modal-header">
                <h3>Write A Review</h3>
                <button className="ppp-modal-close" onClick={() => setIsReviewModalOpen(false)}>×</button>
              </div>
              <form onSubmit={handleReviewSubmit} className="ppp-modal-form">
                <div className="ppp-form-row">
                  <div className="ppp-form-group">
                    <label>Name</label>
                    <input
                      required
                      value={newReview.name}
                      onChange={e => setNewReview({ ...newReview, name: e.target.value })}
                      placeholder="Your Name"
                    />
                  </div>
                  <div className="ppp-form-group">
                    <label>Email</label>
                    <input
                      required
                      type="email"
                      value={newReview.email}
                      onChange={e => setNewReview({ ...newReview, email: e.target.value })}
                      placeholder="Email"
                    />
                  </div>
                </div>
                <div className="ppp-form-group">
                  <label>Rating</label>
                  <select
                    value={newReview.rating}
                    onChange={e => setNewReview({ ...newReview, rating: e.target.value })}
                    className="ppp-select"
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>
                <div className="ppp-form-group">
                  <label>Your Review</label>
                  <textarea
                    required
                    rows="4"
                    value={newReview.comment}
                    onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Tell us what you think..."
                  />
                </div>
                <button type="submit" className="ppp-submit-btn">SUBMIT REVIEW</button>
              </form>
            </div>
          </div>
        )}

        {/* Similar Products */}
        <SimilarProducts productCat={product} />

        {/* Comparison Section */}
        <Compare />

        {/* Frequently Bought Together */}
        {frequentProducts.length > 0 && (
          <div className="ppp-bundle-section">
            <h2 className="ppp-section-title">Complete Your Stack</h2>
            <div className="ppp-bundle-container">
              <FrequentlyBoughtCarousel
                currentProduct={product}
                frequentProducts={frequentProducts}
                onSelectionsChange={(allProds, sels) => setBundleSelections({ allProducts: allProds, selections: sels })}
              />
              <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#94a3b8', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
                  Total Bundle Value
                </span>
                <div style={{ fontSize: 44, fontWeight: 950, color: '#0ea5e9', letterSpacing: '-0.04em', marginBottom: 24 }}>
                  ₹{(
                    bundleSelections ?
                      bundleSelections.allProducts.reduce((sum, p, idx) => {
                        const sel = bundleSelections.selections[idx] || { flavorIdx: 0, size: 'S' };
                        const flavor = p.productFlavors?.[sel.flavorIdx];
                        if (!flavor) return sum;
                        const sizePrice = sel.size === 'S' ? flavor.price : (sel.size === 'M' ? flavor.priceMedium : flavor.priceLarge);
                        return sum + (sizePrice || flavor.price || 0);
                      }, 0) :
                      ((product?.productFlavors?.[0]?.price || 0) + frequentProducts.reduce((sum, p) => sum + (p.productFlavors?.[0]?.price || 0), 0))
                  ).toLocaleString()}
                </div>
                <button
                  className="ppp-bundle-buy-btn"
                  onClick={() => {
                    const allBundle = bundleSelections?.allProducts || [product, ...frequentProducts];
                    const sels = bundleSelections?.selections || {};
                    allBundle.forEach((item, idx) => {
                      if (String(item.id).startsWith('placeholder')) return;
                      const sel = sels[idx] || { flavorIdx: 0, size: 'S' };
                      const flavor = item.productFlavors?.[sel.flavorIdx];
                      const fid = flavor?.flavor_id;
                      if (fid) addToCart(item.id, sel.size, fid);
                    });
                    Alert.success("Bundle added to collection!");
                  }}
                >
                  Add Bundle to Collection →
                </button>
              </div>
            </div>
          </div>
        )}
        <img src="/images/certifications.png" alt="Certifications" className="certifications-banner" />
      </div>
    </div>
  );
};

export default PremiumProductDetails;
