import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from 'react-s-alert';
import { FaEye } from 'react-icons/fa';
import { ShopContext } from '../context/shop-context';
import WishlistIcon from './WishlistIcon';
import { COMPANY_INFO } from '../constants/companyInfo';
import QuickViewModal from './QuickViewModal';
import ImageCarousel from '../pages/productDetails/ImageCarousel';
import './premium-carousel.css';

const SIZES = [
    { id: 'S', label: 'S', key: 'price' },
    { id: 'M', label: 'M', key: 'priceMedium' },
    { id: 'L', label: 'L', key: 'priceLarge' },
];

const PremiumProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart, cartItems, categories: allCategories } = useContext(ShopContext);
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [sel, setSel] = useState({ flavorIdx: 0, size: 'S' });

    if (!product) return null;

    const setFlavor = (flavorIdx) => setSel(prev => ({ ...prev, flavorIdx }));
    const setSize = (size) => setSel(prev => ({ ...prev, size }));

    const getPriceData = () => {
        const flavor = product.productFlavors?.[sel.flavorIdx];
        const sizeKey = SIZES.find(s => s.id === sel.size)?.key || 'price';
        let basePrice = 0;

        if (flavor) {
            basePrice = flavor[sizeKey] || flavor.price || product.price || 0;
        } else {
            basePrice = product.price || 0;
        }

        // Check for active discount offer matching selected size
        const activeOffer = product.offers?.find(o =>
            o.active &&
            o.discount > 0 &&
            (o.size === sel.size || !o.size)
        );

        let finalPrice = basePrice;
        let discountInfo = null;

        if (activeOffer) {
            if (activeOffer.type === 2) { // Flat Discount
                finalPrice = Math.max(0, basePrice - activeOffer.discount);
                discountInfo = `₹${activeOffer.discount} FLAT OFF`;
            } else { // Percentage Discount (default)
                finalPrice = basePrice * (1 - activeOffer.discount / 100);
                discountInfo = `${activeOffer.discount}% OFF`;
            }
        }

        return {
            originalPrice: basePrice,
            finalPrice: finalPrice,
            discountInfo: discountInfo
        };
    };

    const getCartCount = () =>
        Object.keys(cartItems).reduce((sum, key) =>
            key.startsWith(`${product.id}_`) ? sum + (cartItems[key] || 0) : sum, 0);

    const handleAddToCart = (e) => {
        e.stopPropagation();
        const flavor = product.productFlavors?.[sel.flavorIdx];
        const flavorId = flavor?.flavor_id || (product.productFlavors && product.productFlavors.length > 0 ? product.productFlavors[0].flavor_id : null);

        if (getCartCount() >= (product.stock || 99)) { Alert.info('Out of stock!'); return; }
        addToCart(product.id, sel.size, flavorId);
        Alert.success(`${(product.title || '').slice(0, 20)} added!`);
    };

    const flavors = product.productFlavors || [];
    const selectedFlavor = flavors[sel.flavorIdx] || flavors[0];
    const { originalPrice, finalPrice, discountInfo } = getPriceData();
    const cartCount = getCartCount();

    const categoryItems = new Set();

    // 1. From Associated Category Object
    if (product.Category?.title) {
        categoryItems.add(product.Category.title);
    }

    // 2. From raw category string (comma-separated)
    if (product.category) {
        String(product.category)
            .split(',')
            .map(c => c.trim())
            .filter(Boolean)
            .forEach(c => categoryItems.add(c));
    }

    // 3. From catIds string (comma separated IDs) using global categories map
    if (product.catIds && allCategories && allCategories.length > 0) {
        const idList = String(product.catIds).split(',').map(id => id.trim()).filter(Boolean);
        idList.forEach(id => {
            const catObj = allCategories.find(c => String(c.id) === String(id));
            if (catObj && catObj.title) categoryItems.add(catObj.title);
        });
    }

    // 4. From categories array
    if (product.categories && Array.isArray(product.categories)) {
        product.categories.forEach(c => {
            const title = typeof c === 'string' ? c : c.title || String(c);
            if (title) categoryItems.add(title);
        });
    }

    const visibleCategories = categoryItems.size > 0 ? Array.from(categoryItems) : ['Premium Product'];

    const getFormLabel = () => {
        if (product.Form?.title) return product.Form.title;
        if (typeof product.form === 'string' && product.form.trim()) return product.form;
        if (product.form && typeof product.form !== 'object') return `Form #${product.form}`;
        //if (product.formId) return `Form #${product.formId}`;
        return 'No Form';
    };
    const formLabel = getFormLabel();

    return (
        <React.Fragment>
            <div className="frequent-card" style={{ minHeight: "420px", display: "flex", flexDirection: "column" }}>
                {/* Content */}
                <div className="frequent-card-content flex-grow flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-1">
                            <div>
                                <div className="frequent-card-brand">{product.brand || 'Elite Selection'}</div>
                                <div className="frequent-card-meta">
                                    {visibleCategories.map((cat, idx) => (
                                        <span key={`cat-${idx}`} className="frequent-card-meta-item frequent-card-category">{cat}</span>
                                    ))}
                                    {formLabel && (
                                        <span className="frequent-card-meta-item frequent-card-form">{formLabel}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <h6 className="frequent-card-title mb-1" style={{ marginBottom: "6px" }}>{product.title}</h6>                        {/* Active Offers Marquee */}
                        {product.offers && product.offers.filter(o => o.active).length > 0 ? (
                            <div className="premium-marquee-wrapper"
                                style={{
                                    position: 'relative',
                                    overflow: 'hidden',
                                    backgroundColor: 'black',
                                    border: '1px solid #0ea5e9',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: '27px',
                                    width: '100%',
                                    marginBottom: '4px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                            >
                                {/* Static Label on Left */}
                                <div style={{
                                    position: 'absolute',
                                    left: 0,
                                    zIndex: 20,
                                    backgroundColor: 'black',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    paddingLeft: '8px',
                                    paddingRight: '8px',
                                    borderRight: '1px solid rgba(255,255,255,0.2)'
                                }}>
                                    <img src="/images/offer.gif" alt="Offer" title={COMPANY_INFO.name} style={{ height: '54px', width: '100px' }} />
                                </div>

                                {/* Scrolling Ticker */}
                                <div className="animate-marquee"
                                    style={{
                                        whiteSpace: 'nowrap',
                                        fontSize: '9.5px',
                                        fontWeight: '800',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '24px',
                                        paddingLeft: '60px'
                                    }}>
                                    {product.offers.filter(o => o.active).map((offer, idx) => {
                                        let pieces = [];
                                        if (offer.discount > 0) pieces.push(`${offer.discount}${offer.type === 2 ? ' FLAT' : '%'} OFF`);
                                        if (offer.buy > 0 && offer.buyget > 0) pieces.push(`Buy ${offer.buy} Get ${offer.buyget} FREE`);
                                        if (offer.freeProducttitle) pieces.push(`+ Free ${offer.freeProducttitle}`);
                                        return (
                                            <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                                <span style={{ color: '#fbbf24', fontSize: '11px' }}>⚡</span>
                                                <b style={{ letterSpacing: '0.02em' }}>{pieces.join(' | ')}</b>
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: '600', marginBottom: '4px', display: 'flex', alignItems: 'center', height: '22px', textTransform: 'uppercase' }}>
                                No immediate offers
                            </div>
                        )}
                        <div className="frequent-card-image">
                            {(product.cardCarouselImages?.length || product.image || product.img || product.ProductImages?.length) ? (
                                <ImageCarousel
                                    id={product.id}
                                    title={product.title}
                                    mainImage={product.image || product.img}
                                    imageList={product.cardCarouselImages || product.imageURLs}
                                    additionalImages={product.ProductImages}
                                    thumbs={true}
                                    thumbDirection="vertical"
                                    style={{ width: "100%", height: "500px !important" }}
                                />
                            ) : (
                                <img src={'https://placehold.co/800x800?text=No+Image'} alt={product.title} title={COMPANY_INFO.name} loading="lazy" />
                            )}
                            {/* Action icons column */}
                            <div className="fbc-action-col">
                                <button
                                    className="fbc-action-btn fbc-add-btn"
                                    title="Add to cart"
                                    onClick={handleAddToCart}
                                >
                                    {cartCount > 0
                                        ? <span className="fbc-cart-count">{cartCount}</span>
                                        : <span>+</span>
                                    }
                                </button>

                                <button
                                    className="fbc-action-btn fbc-eye-btn"
                                    title="Quick View"
                                    onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); }}
                                >
                                    <FaEye size={12} />
                                </button>

                                <WishlistIcon
                                    productId={product.id}
                                    size="small"
                                    showText={false}
                                    customStyle={{
                                        position: 'relative',
                                        background: 'white',
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: 0,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                        cursor: 'pointer',
                                        border: '1px solid #f1f5f9'
                                    }}
                                />
                            </div>
                        </div>
                        {/* CTA Row */}
                        <div

                            className="flex w-full items-center justify-start gap-[10px] mt-4 mb-2 z-10 overflow-x-auto pb-2 custom-scrollbar">

                            {/* View Details */}
                            <button
                                className="group rounded-[0.6rem] box-border bg-transparent transition-all duration-200 hover:-translate-y-[2px] flex items-center justify-center gap-2 font-[800] tracking-wide text-[11px]"
                                style={{
                                    border: "2px solid #0d9488", color: "#0d9488", hover: "#0d9488",
                                    maxWidth: "200px", paddingLeft: "40px", paddingRight: "40px", marginRight: "20px"
                                }}
                                onClick={(e) => { e.stopPropagation(); navigate(`/productDetails/${product.id}`); }}

                            >
                                <span className="whitespace-nowrap" style={{ verticalAlign: "middle" }}>View details
                                    <svg className="w-[18px] h-[18px]"
                                        style={{ "paddingLeft": "150px" }}
                                        viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                </span>

                            </button>

                            {/* Add to Cart */}
                            <button
                                className="group rounded-[0.6rem] box-border transition-all duration-200 hover:-translate-y-[2px] flex items-center justify-center gap-2 font-[800] tracking-wide text-[11px]"
                                style={{
                                    backgroundColor: "#0d9488", color: "white", border: "2px solid #0d9488", boxShadow: "0 4px 12px rgba(13, 148, 136, 0.2)",
                                    maxWidth: "200px", paddingLeft: "40px", paddingRight: "40px", marginRight: "20px"
                                }}
                                onClick={handleAddToCart}
                            >
                                <span className="whitespace-nowrap" style={{ verticalAlign: "middle" }}>{cartCount > 0 ? `In Cart (${cartCount})` : "Add To Cart"}

                                </span>
                                <svg
                                    className="w-[30px] h-[30px]"
                                    style={{ "paddingLeft": "150px" }}
                                    viewBox="0 0 30 30"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="0.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                            </button>

                            <img src="/images/iso.png" alt="ISO" title={COMPANY_INFO.name} style={{ height: '70px', width: '200px', float: "center", marginLeft: "40px", verticalAlign: "top" }} />
                            <img src="/images/time.png" alt="Delievry time" title={COMPANY_INFO.name} style={{ height: '70px', width: '350px', float: "center", marginLeft: "20px", verticalAlign: "top" }} />
                        </div>

                        {/* Flavor and Metas (side by side) */}
                        {flavors.length > 0 && (
                            <div className="fbc-flavor-meta-wrap">
                                <div className="fbc-flavor-row">
                                    <span className="fbc-label">Flavor</span>
                                    <div className="fbc-pills">
                                        {flavors.map((pf, fi) => (
                                            <button
                                                style={{ minWidth: "auto" }}
                                                key={fi}
                                                className={`fbc-pill ${sel.flavorIdx === fi ? 'active' : ''}`}
                                                onClick={() => setFlavor(fi)}
                                                title={pf.Flavor?.name || `Flavor ${fi + 1}`}
                                            >
                                                {(pf.Flavor?.name || `F${fi + 1}`).slice(0, 15)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="fbc-meta-side">
                                    {visibleCategories.map((cat, idx) => (
                                        <span key={`prod-cat-${idx}`} className="fbc-meta-pill fbc-meta-category">{cat}</span>
                                    ))}
                                    {formLabel && (
                                        <span className="fbc-meta-pill fbc-meta-form">{formLabel}</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Repositioned Gold Rating Section - Below Categories & Form */}
                        <div className="flex justify-end mb-4">
                            <div className="fbc-review-pill flex items-center gap-3">
                                <div className="fbc-stars-gold">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={`text-[13px] ${i < Math.floor(product.rating || 0) ? '' : 'opacity-50'}`}>
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <div className="flex items-center gap-1.5 border-l border-amber-200/50 pl-3">
                                    <span style={{ color: "#b45309", fontSize: "14px", fontWeight: "900" }}>{product.rating || '0.0'}</span>
                                    <span className="text-[9px] font-black text-amber-600/70 tracking-tighter uppercase">
                                        ({product.reviews?.length || 0} Reviews)
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Size Toggles */}
                        {flavors.length > 0 && (
                            <div className="fbc-size-row">
                                <span className="fbc-label">Size</span>
                                <div className="fbc-sizes">
                                    {SIZES.map(s => {
                                        const available = selectedFlavor?.[s.key] != null;
                                        return (
                                            <button
                                                key={s.id}
                                                className={`fbc-size ${sel.size === s.id ? 'active' : ''} ${!available ? 'disabled' : ''}`}
                                                onClick={() => available && setSize(s.id)}
                                                disabled={!available}
                                            >
                                                {s.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer: Price + Stock */}
                    <div className="frequent-card-footer mt-4">
                        <div className="flex flex-col">
                            {discountInfo ? (
                                <>
                                    <span style={{ fontSize: '11px', color: '#94a3b8', textDecoration: 'line-through', fontWeight: '600', marginBottom: '-2px' }}>
                                        ₹{originalPrice.toLocaleString()}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span style={{ fontSize: '16px', fontWeight: '900', color: '#D4AF37', letterSpacing: '-0.02em' }}>
                                            ₹{Math.round(finalPrice).toLocaleString()}
                                        </span>
                                        <span style={{ fontSize: '9px', fontWeight: '900', backgroundColor: '#fffbeb', color: '#d97706', padding: '2px 6px', borderRadius: '4px', border: '1px solid #fef3c7', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                                            {discountInfo}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <span className="frequent-card-price">₹{originalPrice.toLocaleString()}</span>
                            )}
                        </div>
                        <span className="frequent-card-stock">In Stock</span>
                    </div>

                    {/* Elite Trust Metrics: FAQs & Reviews Side-by-Side */}
                    {(product.faqs?.length > 0 || product.reviews?.length > 0) && (
                        <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
                            {/* Reviews Snapshot */}
                            <div className="fbc-trust-snapshot fbc-trust-reviews">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span style={{ fontSize: "14px" }}>✨</span>
                                    <span style={{ fontSize: "9px", fontWeight: "900", color: "#451a03", textTransform: "uppercase", letterSpacing: "0.1em" }}>Verified Story</span>
                                </div>
                                <p style={{ fontSize: "9px", fontWeight: "800", color: "#d97706", display: "flex", alignItems: "center", gap: "4px" }}>
                                    {product.reviews?.length || 0} Customer Experiences
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Interactive Feedback & FAQ Section */}
                    <div className="mt-6">
                        {/* Verified Feedback Tab */}
                        <div className="fbc-reviews-section">
                            <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1 no-scrollbar">
                                {product.reviews && product.reviews.length > 0 ? (
                                    product.reviews.map((rev, ri) => (
                                        <div key={ri} className="fbc-review-item">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="fbc-review-name">{rev.name || 'Verified Buyer'}</span>
                                                <div className="fbc-stars-gold scale-75">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={`${i < (rev.rating || 0) ? '' : 'opacity-20 text-slate-300'}`}>
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="fbc-review-comment">
                                                "{rev.comment || 'Safe and effective - highly recommended.'}"
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 border-2 border-dashed border-slate-50 rounded-2xl">
                                        <span className="text-xl block mb-2 opacity-30">✨</span>
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-loose">
                                            No reviews yet.<br />Be the first to share!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
                            {/* FAQs Snapshot */}
                            <div className="fbc-trust-snapshot fbc-trust-faq">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span style={{ fontSize: "14px" }}>❓</span>
                                    <span style={{ fontSize: "9px", fontWeight: "900", color: "#0c4a6e", textTransform: "uppercase", letterSpacing: "0.1em" }}>Expert FAQs</span>
                                </div>
                                <p style={{ fontSize: "9px", fontWeight: "800", color: "#0ea5e9", display: "flex", alignItems: "center", gap: "4px" }}>
                                    {product.faqs?.length || 0} Professional Answers
                                </p>
                            </div>
                        </div>
                        {/* Product FAQs Tab */}
                        <div className="fbc-faq-section">
                            <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1 no-scrollbar">
                                {product.faqs && product.faqs.length > 0 ? (
                                    product.faqs.map((faq, fi) => (
                                        <div key={fi} className="fbc-faq-item">
                                            <div className="fbc-faq-question">
                                                <span className="text-[11px] text-sky-500">Q.</span>
                                                {faq.question || 'How do I use this product?'}
                                            </div>
                                            <p className="fbc-faq-answer">
                                                {faq.answer || 'Follow the recommended guidelines for optimal results.'}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 border-2 border-dashed border-slate-50 rounded-2xl">
                                        <span className="text-xl block mb-2 opacity-30">❓</span>
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-loose">
                                            Got questions?<br />Consult our experts!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick View Modal */}
            {
                quickViewProduct && (
                    <QuickViewModal
                        product={quickViewProduct}
                        isOpen={!!quickViewProduct}
                        onClose={() => setQuickViewProduct(null)}
                    />
                )
            }
        </React.Fragment >
    );
};

export default PremiumProductCard;
