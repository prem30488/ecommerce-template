import React, { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../context/shop-context';
import { WishlistContext } from '../context/wishlist-context';
import { FaHeart, FaRegHeart, FaTimes, FaPlus, FaMinus, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Alert from 'react-s-alert';
import './quick-view-modal.css';

const QuickViewModal = ({ product, isOpen, onClose }) => {
    const { addToCart, removeFromCart, cartItems } = useContext(ShopContext);
    const { isInWishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
    
    const [currentImgIndex, setCurrentImgIndex] = useState(0);

    if (!isOpen || !product) return null;

    const { id, title, price, stock, img, imageURLs, offers } = product;
    
    // Use cart count directly
    const quantity = cartItems[id] || 0;

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
            return;
        }
        addToCart(id, 'S');
        Alert.success(`${title} added!`);
    };

    const handleRemoveFromCart = () => {
        if (quantity > 0) {
            removeFromCart(id, 'S');
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
                            <img src={images[currentImgIndex]} alt={title} className="qv-main-img" />
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

                            <button className="qv-buy-btn" onClick={() => { if (quantity === 0) handleAddToCart(); /* navigate to checkout logic */ }}>BUY IT NOW</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickViewModal;
