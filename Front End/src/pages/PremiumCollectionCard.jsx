import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from 'react-s-alert';
import { ShopContext } from '../context/shop-context';
import { WishlistContext } from '../context/wishlist-context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStarHalfAlt, faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import './PremiumCollectionCard.css';

const PremiumCollectionCard = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart, categories, cartItems, martItems, lartItems } = useContext(ShopContext);
    const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);

    if (!product) return null;

    // Aggregated cart count across all flavors and sizes for this product
    const cartCount = 
        (Object.keys(cartItems).reduce((sum, key) => key.startsWith(`${product.id}_`) || key === String(product.id) ? sum + cartItems[key] : sum, 0)) +
        (Object.keys(martItems).reduce((sum, key) => key.startsWith(`${product.id}_`) || key === String(product.id) ? sum + martItems[key] : sum, 0)) +
        (Object.keys(lartItems).reduce((sum, key) => key.startsWith(`${product.id}_`) || key === String(product.id) ? sum + lartItems[key] : sum, 0));

    const isComingSoon = product.comingSoon === true || product.comingSoon === 'true';

    const isWishlisted = isInWishlist(product.id);

    const handleWishlistToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isWishlisted) {
            removeFromWishlist(product.id);
            Alert.success("Removed from wishlist");
        } else {
            addToWishlist(product.id);
            Alert.success("Added to wishlist");
        }
    };


    const getDisplayCategories = () => {
        if (product.catIds) {
            const ids = String(product.catIds).split(',').map(Number);
            const matches = categories
                .filter(c => ids.includes(c.id))
                .map(c => c.title);
            if (matches.length > 0) return matches.join(' • ');
        }
        return product.Category?.title || product.category || '';
    };

    const getDisplayForm = () => {
        if (product.Form?.title) return product.Form.title;
        if (product.form) return typeof product.form === 'string' ? product.form : `Form #${product.form}`;
        if (product.formId) return `Form #${product.formId}`;
        return '';
    };

    // Handle pricing logic: check flavors if main price is 0 or null
    let basePrice = product.price ? parseFloat(product.price) : 0;

    if (basePrice === 0 && product.productFlavors && product.productFlavors.length > 0) {
        const firstFlavor = product.productFlavors[0];
        // Use the first available numeric price from the flavor
        basePrice = parseFloat(firstFlavor.price) ||
            parseFloat(firstFlavor.priceMedium) ||
            parseFloat(firstFlavor.priceLarge) || 0;
    }

    const activeOffer = product.offers?.find(o => o.active && o.discount > 0);

    let finalPrice = basePrice;
    let discountInfo = null;

    if (activeOffer) {
        if (activeOffer.type === 2) {
            finalPrice = Math.max(0, basePrice - activeOffer.discount);
            discountInfo = `₹${activeOffer.discount} OFF`;
        } else {
            finalPrice = basePrice * (1 - activeOffer.discount / 100);
            discountInfo = `${activeOffer.discount}% OFF`;
        }
    }

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const firstFlavor = product.productFlavors?.[0];
        const flavorId = firstFlavor?.flavor_id || null;
        
        // Determine the best size to add based on price availability
        let bestSize = 'S';
        if (firstFlavor) {
            if (firstFlavor.price) bestSize = 'S';
            else if (firstFlavor.priceMedium) bestSize = 'M';
            else if (firstFlavor.priceLarge) bestSize = 'L';
        }

        addToCart(product.id, bestSize, flavorId);
    };

    const handleQuickView = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/productDetails/${product.id}`);
    };

    return (
        <div className={`collection-card${isComingSoon ? ' coming-soon-card-product' : ''}`} onClick={() => navigate(`/productDetails/${product.id}`)}>
            <div className="card-image-wrapper">
                <div className="card-badge-container">
                    {isComingSoon && <span className="card-status-badge coming-soon-badge">✨ Coming Soon</span>}
                    {product.isNew && !isComingSoon && <span className="card-status-badge">New</span>}
                    {product.bestseller && <span className="card-status-badge bestseller">Bestseller</span>}
                    {product.featured && <span className="card-status-badge featured">Featured</span>}
                </div>
                {discountInfo && <span className="card-discount-badge">{discountInfo}</span>}

                {activeOffer && (
                    <div className="card-marquee-wrapper">
                        <div className="card-marquee-content">
                            <span>{activeOffer.discount}% OFF LIMITED TIME OFFER • </span>
                            <span>{activeOffer.discount}% OFF LIMITED TIME OFFER • </span>
                        </div>
                    </div>
                )}

                <img
                    src={product.image || product.img || (product.ProductImages?.[0]?.imageUrl) || 'https://placehold.co/600x600?text=Product'}
                    alt={product.title}
                    className="card-image"
                    loading="lazy"
                />

                {isComingSoon ? (
                    <div className="card-coming-soon-overlay">
                        <div className="coming-soon-overlay-content">
                            <div className="coming-soon-marquee-track">
                                <span>COMING SOON ✨ COMING SOON ✨ COMING SOON ✨ COMING SOON ✨&nbsp;</span>
                                <span>COMING SOON ✨ COMING SOON ✨ COMING SOON ✨ COMING SOON ✨&nbsp;</span>
                            </div>
                            <p className="coming-soon-overlay-label">Notify Me</p>
                        </div>
                    </div>
                ) : (
                    <div className="card-overlay">
                        <div className="overlay-top-row">
                            <button className="overlay-btn overlay-btn-primary" onClick={handleAddToCart}>
                                {cartCount > 0 ? `In Cart (${cartCount})` : 'Add to Cart'}
                            </button>
                            <button className="overlay-btn overlay-btn-secondary" onClick={handleQuickView}>
                                View Details
                            </button>
                        </div>
                        <button
                            className={`overlay-btn overlay-btn-wishlist ${isWishlisted ? 'active' : ''}`}
                            onClick={handleWishlistToggle}
                        >
                            <FontAwesomeIcon icon={isWishlisted ? faHeartSolid : faHeartRegular} />
                            <span>{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
                        </button>
                    </div>
                )}

            </div>

            <div className="card-content">
                <div className="card-brand-row">
                    <span className="card-brand">{product.brand || 'Elite Healthcare'}</span>
                    {getDisplayCategories() && (
                        <span className="card-category">  • {getDisplayCategories()}</span>
                    )}
                    {getDisplayForm() && (
                        <span className="card-form">  • {getDisplayForm()}</span>
                    )}
                </div>
                <h3 className="card-title">{product.title}</h3>
                <div className="card-rating">
                    <div className="card-stars">
                        {[1, 2, 3, 4, 5].map(star => {
                            const ratingNum = parseFloat(product.rating || 5);
                            if (ratingNum >= star) return <FontAwesomeIcon key={star} icon={faStar} className="star-filled" />;
                            if (ratingNum >= star - 0.5) return <FontAwesomeIcon key={star} icon={faStarHalfAlt} className="star-half" />;
                            return <FontAwesomeIcon key={star} icon={faStar} className="star-empty" />;
                        })}
                    </div>
                    <span className="rating-value">{product.rating || '5.0'}</span>
                </div>
                <div className="card-price-row">
                    <span className="card-final-price">₹{Math.round(finalPrice).toLocaleString()}</span>
                    {discountInfo && (
                        <span className="card-original-price">₹{basePrice.toLocaleString()}</span>
                    )}
                </div>
                <div className="card-stock-status">
                    {product.stock > 0 ? (
                        <span className="in-stock">In Stock ({product.stock})</span>
                    ) : (
                        <span className="out-of-stock">Out of Stock</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PremiumCollectionCard;
