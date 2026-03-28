import React, { useContext, useState } from 'react';
import { WishlistContext } from '../../context/wishlist-context';
import { ShopContext } from '../../context/shop-context';
import { FaTrash, FaShoppingCart, FaShareAlt } from 'react-icons/fa';
import './wishlist-item.css';
import WishlistShareModal from './WishlistShareModal';
import { useNavigate } from 'react-router-dom';
import Alert from 'react-s-alert';

const WishlistItem = ({ item }) => {
  const { removeFromWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(ShopContext);
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);

  if (!item) {
    return null;
  }

  const handleRemove = async () => {
    if (window.confirm('Remove this item from wishlist?')) {
      await removeFromWishlist(item.id);
      Alert.success('Removed from wishlist');
    }
  };

  const handleAddToCart = () => {
    addToCart(item.id, 'S');
    Alert.success('Added to cart');
  };

  // Get image URL - handle both old and new backend formats
  const getImageUrl = () => {
    // 1. If 'img' exists (absolute URL or relative path), use it
    if (item.img) {
      return item.img;
    }

    // 2. If 'imageURLs' exists, try to get the first image from the list
    if (item.imageURLs) {
      // imageURLs could be a string "img1.png,img2.png" or an array
      const imagesArr = Array.isArray(item.imageURLs) 
        ? item.imageURLs 
        : item.imageURLs.split(',').map(u => u.trim());
      
      const firstImage = imagesArr[0];
      if (firstImage) {
        // If it looks like a full URL, use it
        if (firstImage.startsWith('http')) {
          return firstImage;
        }
        // Otherwise use the backend endpoint
        return `http://localhost:5000/api/product/image/${item.id}/${firstImage}`;
      }
    }

    // 3. Fallback to picsum with a deterministic seed based on product ID
    return `https://picsum.photos/seed/${item.id}/400/400`;
  };

  return (
    <>
      <div className="wishlist-item">
        <div className="wishlist-item-image">
          <img
            src={getImageUrl()}
            alt={item.title}
            loading="lazy"
            onError={(e) => { 
                e.target.onerror = null; 
                e.target.src = `https://placehold.co/400x400?text=${encodeURIComponent(item.title)}`; 
            }}
          />
        </div>
        <div className="wishlist-item-details">
          <h3 className="wishlist-item-title">{item.title}</h3>
          {item.audience && (
            <p className="wishlist-item-category">{item.audience}</p>
          )}
          {item.description && (
            <p className="wishlist-item-description">{item.description.substring(0, 100)}...</p>
          )}
          <div className="wishlist-item-prices">
            <span className="price-label">Prices: </span>
            <span className="price-s">₹{item.price}</span>
            {item.priceMedium && (
              <>
                <span className="price-separator"> | </span>
                <span className="price-m">₹{item.priceMedium}</span>
              </>
            )}
            {item.priceLarge && (
              <>
                <span className="price-separator"> | </span>
                <span className="price-l">₹{item.priceLarge}</span>
              </>
            )}
          </div>
        </div>
        <div className="wishlist-item-actions">
          <button
            className="btn btn-add-cart"
            onClick={handleAddToCart}
            title="Add to cart"
          >
            <FaShoppingCart /> Add to Cart
          </button>
          <button
            className="btn btn-share"
            onClick={() => setShowShareModal(true)}
            title="Share this item"
          >
            <FaShareAlt /> Share
          </button>
          <button
            className="btn btn-remove"
            onClick={handleRemove}
            title="Remove from wishlist"
          >
            <FaTrash />
          </button>
        </div>
      </div>
      {showShareModal && (
        <WishlistShareModal
          item={item}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
};

export default WishlistItem;
