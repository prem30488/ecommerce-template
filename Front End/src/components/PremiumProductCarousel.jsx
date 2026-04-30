import React, { useState, useRef, useContext } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useNavigate } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';
import { useId } from 'react';
import Alert from 'react-s-alert';
import { FaEye } from 'react-icons/fa';
import { ShopContext } from '../context/shop-context';
import WishlistIcon from './WishlistIcon';
import QuickViewModal from './QuickViewModal';
import './premium-carousel.css';

const SIZES = [
    { id: 'S', label: 'S', key: 'price' },
    { id: 'M', label: 'M', key: 'priceMedium' },
    { id: 'L', label: 'L', key: 'priceLarge' },
];

const PremiumProductCarousel = ({ products }) => {
    const uId = useId();
    const swiperRef = useRef(null);
    const navigate = useNavigate();
    const { addToCart, removeFromCart, cartItems } = useContext(ShopContext);
    const [quickViewProduct, setQuickViewProduct] = useState(null);

    // Per-card selection state: { [index]: { flavorIdx, size } }
    const [selections, setSelections] = useState(() =>
        Object.fromEntries((products || []).map((_, i) => [i, { flavorIdx: 0, size: 'S' }]))
    );

    if (!products || products.length === 0) return null;

    const updateSelections = (updater) => {
        setSelections(prev => updater(prev));
    };

    const setFlavor = (cardIdx, flavorIdx) =>
        updateSelections(prev => ({ ...prev, [cardIdx]: { ...prev[cardIdx], flavorIdx } }));

    const setSize = (cardIdx, size) =>
        updateSelections(prev => ({ ...prev, [cardIdx]: { ...prev[cardIdx], size } }));

    const getPrice = (product, cardIdx) => {
        const sel = selections[cardIdx] || { flavorIdx: 0, size: 'S' };
        const flavor = product.productFlavors?.[sel.flavorIdx];
        if (!flavor) return 0;
        const sizeKey = SIZES.find(s => s.id === sel.size)?.key || 'price';
        return flavor[sizeKey] || flavor.price || 0;
    };

    const getCartCount = (productId) =>
        Object.keys(cartItems).reduce((sum, key) =>
            key.startsWith(`${productId}_`) ? sum + (cartItems[key] || 0) : sum, 0);

    const handleAddToCart = (e, product, cardIdx) => {
        e.stopPropagation();
        const sel = selections[cardIdx] || { flavorIdx: 0, size: 'S' };
        const flavor = product.productFlavors?.[sel.flavorIdx];
        const flavorId = flavor?.flavor_id;
        if (!flavorId) { Alert.warning('No flavor available'); return; }
        addToCart(product.id, sel.size, flavorId);
    };

    return (
        <div className="premium-carousel-container">
            <Swiper
                style={{
                    '--swiper-navigation-color': '#0f172a',
                    '--swiper-navigation-size': '14px',
                }}
                loop={false}
                spaceBetween={20}
                slidesPerView={1}
                breakpoints={{
                    480: { slidesPerView: 2 },
                    768: { slidesPerView: 3 },
                    1024: { slidesPerView: 4 },
                    1280: { slidesPerView: 5 }
                }}
                navigation={true}
                pagination={{ clickable: true, dynamicBullets: true }}
                modules={[Navigation, Pagination]}
                className="frequent-swiper"
                onSwiper={(swiper) => { swiperRef.current = swiper; }}
                key={`${uId}-premium-carousel`}
            >
                {products.map((product, index) => {
                    const sel = selections[index] || { flavorIdx: 0, size: 'S' };
                    const flavors = product.productFlavors || [];
                    const selectedFlavor = flavors[sel.flavorIdx];
                    const price = getPrice(product, index);
                    const cartCount = getCartCount(product.id);

                    return (
                        <SwiperSlide key={`${uId}-product-${product.id || index}`} style={{ height: 'auto' }}>
                            <div className="frequent-card">
                                {/* Image */}
                                <div className="frequent-card-image" onClick={() => navigate(`/productDetails/${product.id}`)}>
                                    <img src={product.image || product.img || "https://placehold.co/400x300?text=No+Image"} alt={product.title} loading="lazy" />

                                    {/* Action icons column */}
                                    <div className="fbc-action-col">
                                        {/* Plus / Cart count */}
                                        <button
                                            className="fbc-action-btn fbc-add-btn"
                                            title="Add to cart"
                                            onClick={(e) => handleAddToCart(e, product, index)}
                                        >
                                            {cartCount > 0
                                                ? <span className="fbc-cart-count">{cartCount}</span>
                                                : <span>+</span>
                                            }
                                        </button>

                                        {/* Quick View */}
                                        <button
                                            className="fbc-action-btn fbc-eye-btn"
                                            title="Quick View"
                                            onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); }}
                                        >
                                            <FaEye size={12} />
                                        </button>

                                        {/* Wishlist */}
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

                                {/* Content */}
                                <div className="frequent-card-content">
                                    <div className="frequent-card-brand">{product.brand || 'Elite Selection'}</div>
                                    <h6 className="frequent-card-title">{product.title}</h6>

                                    {/* Flavor Pills */}
                                    {flavors.length > 0 && (
                                        <div className="fbc-flavor-row">
                                            <span className="fbc-label">Flavor</span>
                                            <div className="fbc-pills">
                                                {flavors.map((pf, fi) => (
                                                    <button
                                                        key={fi}
                                                        className={`fbc-pill ${sel.flavorIdx === fi ? 'active' : ''}`}
                                                        onClick={() => setFlavor(index, fi)}
                                                        title={pf.Flavor?.name || `Flavor ${fi + 1}`}
                                                    >
                                                        {(pf.Flavor?.name || `F${fi + 1}`).slice(0, 7)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

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
                                                        onClick={() => available && setSize(index, s.id)}
                                                        disabled={!available}
                                                    >
                                                        {s.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    )}

                                    {/* Footer: Price + Stock */}
                                    <div className="frequent-card-footer">
                                        <span className="frequent-card-price">₹{price.toLocaleString()}</span>
                                        <span className="frequent-card-stock">In Stock ({product.stock})</span>
                                    </div>

                                    {/* CTA Row - Match PremiumCard */}
                                    <div className="parth" style={{ marginTop: '16px' }}>
                                        <button
                                            className="prem group rounded-[0.6rem] box-border bg-transparent transition-all duration-200 hover:-translate-y-[2px] flex items-center justify-center gap-2 font-[800] tracking-wide text-[11px]"
                                            style={{
                                                border: "2px solid var(--color-primary)",
                                                color: "var(--color-primary)",
                                                padding: "10px 20px"
                                            }}
                                            onClick={(e) => { e.stopPropagation(); navigate(`/productDetails/${product.id}`); }}
                                        >
                                            <span className="whitespace-nowrap" style={{ verticalAlign: "middle" }}>View details</span>
                                            <svg className="w-[16px] h-[16px]"
                                                viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="9 18 15 12 9 6"></polyline>
                                            </svg>
                                        </button>

                                        {cartCount > 0 ? (
                                            <div className="prem prem-stepper-container">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        const flavor = product.productFlavors?.[sel.flavorIdx];
                                                        const flavorId = flavor?.flavor_id;
                                                        removeFromCart(product.id, sel.size, flavorId);
                                                    }}
                                                    className="prem-stepper-btn minus"
                                                >
                                                    −
                                                </button>
                                                <div className="prem-stepper-count-wrap">
                                                    <span className="prem-stepper-count">{cartCount}</span>
                                                    <span className="prem-stepper-label">In Cart</span>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddToCart(e, product, index);
                                                    }}
                                                    className="prem-stepper-btn plus"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                className="prem group rounded-[0.6rem] box-border transition-all duration-200 hover:-translate-y-[2px] flex items-center justify-center gap-2 font-[800] tracking-wide text-[11px]"
                                                style={{
                                                    backgroundColor: "var(--color-primary)",
                                                    color: "white",
                                                    border: "2px solid var(--color-primary)",
                                                    boxShadow: "0 4px 12px var(--color-primary-shadow)",
                                                    padding: "10px 20px"
                                                }}
                                                onClick={(e) => handleAddToCart(e, product, index)}
                                            >
                                                <span className="whitespace-nowrap" style={{ verticalAlign: "middle" }}>
                                                    Add To Cart
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>

            {/* Quick View Modal */}
            {quickViewProduct && (
                 <QuickViewModal
                    product={quickViewProduct}
                    isOpen={!!quickViewProduct}
                    onClose={() => setQuickViewProduct(null)}
                />
            )}
        </div>
    );
};

export default PremiumProductCarousel;
