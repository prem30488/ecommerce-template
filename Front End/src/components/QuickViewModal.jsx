import React, { useState, useContext, useEffect } from 'react';
import { COMPANY_INFO } from '../constants/companyInfo';
import { ShopContext } from '../context/shop-context';
import { WishlistContext } from '../context/wishlist-context';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaTimes, FaPlus, FaMinus, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Alert from 'react-s-alert';
import './quick-view-modal.css';

const QuickViewModal = ({ product, isOpen, onClose }) => {
    const navigate = useNavigate();
    const { addToCart, removeFromCart, cartItems } = useContext(ShopContext);
    const { isInWishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
    
    const [currentImgIndex, setCurrentImgIndex] = useState(0);

    if (!isOpen || !product) return null;

    const { id, title, stock, img, imageURLs, offers } = product;
    const price = product.productFlavors?.[0]?.price || 0;
    const firstFlavorId = product.productFlavors?.[0]?.flavor_id;
    
    // Aggregated cart count across all flavors of this product
    const quantity = Object.keys(cartItems).reduce((sum, key) => key.startsWith(`${id}_`) ? sum + cartItems[key] : sum, 0);

    // Parse images
    let images = [];
    if (img) images.push(img);
    if (imageURLs) {
        const urlList = Array.isArray(imageURLs) ? imageURLs : imageURLs.split(',').map(u => u.trim());
        images = [...new Set([...images, ...urlList])];
    }
    if (images.length === 0) images.push(`https://picsum.photos/seed/${id}/600/600`);

    const activeOffer = offers?.find((o) => o.active);
    const discPrice = activeOffer && activeOffer.type === 0 && activeOffer.discount > 0
        ? (price - (price * activeOffer.discount) / 100).toFixed(0)
        : null;
    const discountPercent = activeOffer?.discount || 0;

    const inWishlist = isInWishlist(id);

    const handleAddToCart = () => {
        if (quantity >= stock) {
            Alert.info('Item Out of stock!');
            return false;
        }
        addToCart(id, 'S', firstFlavorId);
        Alert.success(`${title} added!`);
        return true;
    };

    const handleRemoveFromCart = () => {
        if (quantity > 0) {
            removeFromCart(id, 'S', firstFlavorId);
            Alert.warning(`${title} removed!`);
        }
    };

    const handleToggleWishlist = (e) => {
        e.stopPropagation();
        if (inWishlist) {
            removeFromWishlist(id);
            Alert.warning('Removed from wishlist');
        } else {
            addToWishlist(id);
            Alert.success('Added to wishlist');
        }
    };

    const nextImg = () => setCurrentImgIndex((prev) => (prev + 1) % images.length);
    const prevImg = () => setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);

    return (
        <div className="qv-overlay" onClick={onClose}>
            <div className="qv-content" onClick={(e) => e.stopPropagation()}>
                <button className="qv-close" onClick={onClose}><FaTimes /></button>
                
                <div className="qv-main">
                    {/* Image Gallery */}
                    <div className="qv-gallery">
                        <div className="qv-main-img-container">
                            <img src={images[currentImgIndex]} alt={title} title={COMPANY_INFO.name} className="qv-main-img" />
                            {images.length > 1 && (
                                <>
                                    <button className="qv-nav-btn qv-prev" onClick={prevImg}><FaChevronLeft /></button>
                                    <button className="qv-nav-btn qv-next" onClick={nextImg}><FaChevronRight /></button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="qv-info">
                        {discountPercent > 0 && <span className="qv-badge">-{discountPercent}%</span>}
                        <h2 className="qv-title">{title}</h2>
                        
                        <div className="qv-meta">
                            <span className="qv-fire">🔥</span>
                            <span className="qv-sold-text">8 sold in last 18 hours</span>
                        </div>

                        <div className="qv-price-container">
                            <span className="qv-price">₹{parseFloat(discPrice ?? price).toLocaleString('en-IN')}</span>
                            {discPrice && (
                                <span className="qv-old-price">₹{parseFloat(price).toLocaleString('en-IN')}</span>
                            )}
                        </div>

                        <div className="qv-actions">
                            <div className="qv-quantity-selector">
                                <button onClick={handleRemoveFromCart} className="qv-qty-btn"><FaMinus /></button>
                                <input type="number" value={quantity} readOnly className="qv-qty-input" />
                                <button onClick={handleAddToCart} className="qv-qty-btn"><FaPlus /></button>
                            </div>

                            <div className="qv-cart-row">
                                <button className="qv-add-btn" onClick={handleAddToCart}>ADD TO CART</button>
                                <button className="qv-wishlist-btn" onClick={handleToggleWishlist}>
                                    {inWishlist ? <FaHeart color="#ff4d4d" /> : <FaRegHeart />}
                                </button>
                            </div>

                            <button className="qv-buy-btn" onClick={() => { 
                                // Always attempt to add to cart if stock allows. 
                                // If already in cart, adding another one is fine for "Buy Now" 
                                // as long as stock allows it. If it fails due to stock but we 
                                // already have some, we still navigate.
                                if (quantity < stock) {
                                    handleAddToCart();
                                    onClose();
                                    navigate('/checkout');
                                } else if (quantity > 0) {
                                    // Already in cart but can't add more, just go to checkout
                                    onClose();
                                    navigate('/checkout');
                                } else {
                                    Alert.info('Item Out of stock!');
                                }
                            }}>BUY IT NOW</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickViewModal;
