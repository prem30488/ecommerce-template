import React, { useState, useRef, useContext } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useNavigate } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { useId } from 'react';
import Alert from 'react-s-alert';
import { FaEye } from 'react-icons/fa';
import { ShopContext } from '../../context/shop-context';
import WishlistIcon from '../../components/WishlistIcon';
import QuickViewModal from '../../components/QuickViewModal';
import './frequently-bought.css';

const SIZES = [
    { id: 'S', label: 'S', key: 'price' },
    { id: 'M', label: 'M', key: 'priceMedium' },
    { id: 'L', label: 'L', key: 'priceLarge' },
];

const FrequentlyBoughtCarousel = ({ currentProduct, frequentProducts, onSelectionsChange }) => {
    const uId = useId();
    const swiperRef = useRef(null);
    const navigate = useNavigate();
    const { addToCart, cartItems } = useContext(ShopContext);
    const [quickViewProduct, setQuickViewProduct] = useState(null);

    // Combine current product with frequently bought items
    const allProducts = [currentProduct, ...frequentProducts];

    // Ensure at least 5 products
    if (allProducts.length < 5) {
        const placeholdersNeeded = 5 - allProducts.length;
        for (let i = 0; i < placeholdersNeeded; i++) {
            allProducts.push({
                id: `placeholder-${i}`,
                title: `Premium Collection Item`,
                img: `https://picsum.photos/seed/recommend-${i}/300/300`,
                productFlavors: [{ price: 999, priceMedium: 1499, priceLarge: 1999, flavor_id: 1, Flavor: { name: 'Default' } }],
                brand: 'Hanley Health',
                stock: 10
            });
        }
    }

    // Per-card selection state: { [index]: { flavorIdx, size } }
    const [selections, setSelections] = useState(() =>
        Object.fromEntries(allProducts.map((_, i) => [i, { flavorIdx: 0, size: 'S' }]))
    );

    const updateSelections = (updater) => {
        setSelections(prev => {
            const next = updater(prev);
            onSelectionsChange?.(allProducts, next);
            return next;
        });
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
        if (getCartCount(product.id) >= (product.stock || 99)) { Alert.info('Out of stock!'); return; }
        addToCart(product.id, sel.size, flavorId);
        Alert.success(`${(product.title || '').slice(0, 20)} added!`);
    };

    return (
        <div className="frequent-carousel-container w-full">
            <Swiper
                style={{
                    '--swiper-navigation-color': '#0f172a',
                    '--swiper-navigation-size': '14px',
                    minHeight: "480px"
                }}
                loop={false}
                spaceBetween={20}
                slidesPerView={1}
                breakpoints={{
                    480: { slidesPerView: 2 },
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                    1280: { slidesPerView: 4 }
                }}
                navigation={true}
                modules={[Navigation]}
                className="frequent-swiper"
                onSwiper={(swiper) => { swiperRef.current = swiper; }}
                key={`${uId}-frequent`}
            >
                {allProducts.map((product, index) => {
                    const sel = selections[index] || { flavorIdx: 0, size: 'S' };
                    const flavors = product.productFlavors || [];
                    const selectedFlavor = flavors[sel.flavorIdx];
                    const price = getPrice(product, index);
                    const cartCount = getCartCount(product.id);
                    const isPlaceholder = String(product.id).startsWith('placeholder');

                    return (
                        <SwiperSlide key={`${uId}-frequent-${product.id || index}`}>
                            <div className="frequent-card">
                                {/* Image */}
                                <div className="frequent-card-image" onClick={() => !isPlaceholder && navigate(`/productDetails/${product.id}`)} style={{ cursor: isPlaceholder ? 'default' : 'pointer' }}>
                                    <img src={product.img} alt={product.title} loading="lazy" />

                                    {/* Action icons column */}
                                    <div className="fbc-action-col">
                                        {/* Plus / Cart count */}
                                        <button
                                            className="fbc-action-btn fbc-add-btn"
                                            title="Add to cart"
                                            onClick={(e) => handleAddToCart(e, product, index)}
                                            disabled={isPlaceholder}
                                        >
                                            {cartCount > 0
                                                ? <span className="fbc-cart-count">{cartCount}</span>
                                                : <span>+</span>
                                            }
                                        </button>

                                        {/* Quick View */}
                                        {!isPlaceholder && (
                                            <button
                                                className="fbc-action-btn fbc-eye-btn"
                                                title="Quick View"
                                                onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); }}
                                            >
                                                <FaEye size={12} />
                                            </button>
                                        )}

                                        {/* Wishlist */}
                                        {!isPlaceholder && (
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
                                        )}
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

                                    {/* Footer: Price + Stock */}
                                    <div className="frequent-card-footer">
                                        <span className="frequent-card-price">₹{price.toLocaleString()}</span>
                                        <span className="frequent-card-stock">In Stock</span>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>

            {/* Quick View Modal */}
            <QuickViewModal
                product={quickViewProduct}
                isOpen={!!quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />
        </div>
    );
};

export default FrequentlyBoughtCarousel;