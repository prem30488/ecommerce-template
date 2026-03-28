import React, { useContext, useEffect, useState } from 'react';
import { WishlistContext } from '../../context/wishlist-context';
import WishlistItem from './wishlist-item';
import './wishlist.css';
import { FaHeart, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlistItems, getWishlistItemsWithDetails, clearWishlist, getWishlistShareLink } = useContext(WishlistContext);
  const [items, setItems] = useState([]);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWishlistItems = async () => {
      try {
        setIsLoading(true);
        console.log('Current wishlistItems:', wishlistItems);
        const wishlistProducts = await getWishlistItemsWithDetails();
        console.log('Loaded wishlist items:', wishlistProducts);
        setItems(wishlistProducts || []);
        setIsEmpty((wishlistProducts || []).length === 0);
      } catch (err) {
        console.error('Error loading wishlist items:', err);
        setItems([]);
        setIsEmpty(true);
      } finally {
        setIsLoading(false);
      }
    };
    loadWishlistItems();
  }, [wishlistItems, getWishlistItemsWithDetails]);

  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      clearWishlist();
      setItems([]);
      setIsEmpty(true);
    }
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="wishlist-container">
        <div className="wishlist-header">
          <h1 className="wishlist-title">
            <FaHeart /> My Wishlist
          </h1>
        </div>
        <div className="wishlist-loading" style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#666' }}>
          <p>Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="wishlist-container">
        <div className="wishlist-header">
          <h1 className="wishlist-title">
            <FaHeart /> My Wishlist
          </h1>
        </div>
        <div className="wishlist-empty">
          <div className="empty-icon">
            <FaHeart />
          </div>
          <h2>Your Wishlist is Empty</h2>
          <p>Start adding your favorite products to your wishlist!</p>
          <button
            className="btn-continue-shopping"
            onClick={handleContinueShopping}
          >
            <FaArrowLeft /> Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <div>
          <h1 className="wishlist-title">
            <FaHeart /> My Wishlist
          </h1>
          <p className="wishlist-count">{items.length} item{items.length !== 1 ? 's' : ''} in your wishlist</p>
        </div>
        <button
          className="btn-clear-wishlist"
          onClick={handleClearWishlist}
        >
          Clear Wishlist
        </button>
      </div>

      <div className="wishlist-content">
        <div className="wishlist-items">
          {items.map((item) => (
            <WishlistItem key={item.id} item={item} />
          ))}
        </div>

        <div className="wishlist-sidebar">
          <div className="wishlist-summary">
            <h3>Wishlist Summary</h3>
            <div className="summary-item">
              <span>Total Items:</span>
              <span className="summary-value">{items.length}</span>
            </div>
            <div className="summary-item">
              <span>Lowest Price:</span>
              <span className="summary-value">
                ${Math.min(...items.map(i => i.price)).toFixed(2)}
              </span>
            </div>
            <div className="summary-item">
              <span>Highest Price:</span>
              <span className="summary-value">
                ${Math.max(...items.map(i => i.price)).toFixed(2)}
              </span>
            </div>
            <div className="summary-item">
              <span>Average Price:</span>
              <span className="summary-value">
                ${(items.reduce((sum, i) => sum + i.price, 0) / items.length).toFixed(2)}
              </span>
            </div>
            <button
              className="btn-continue-shopping"
              onClick={handleContinueShopping}
            >
              Continue Shopping
            </button>
          </div>

          <div className="wishlist-sharing-info">
            <h3>Share Your Wishlist</h3>
            <p>Click the buttons below to share your entire wishlist with friends and family!</p>
            <div className="share-buttons" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getWishlistShareLink() || window.location.href)}`} target="_blank" rel="noopener noreferrer" className="btn-share facebook" style={{ padding: '8px 12px', background: '#3b5998', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>
                Facebook
              </a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(getWishlistShareLink() || window.location.href)}&text=Check%20out%20my%20wishlist!`} target="_blank" rel="noopener noreferrer" className="btn-share twitter" style={{ padding: '8px 12px', background: '#1da1f2', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>
                Twitter
              </a>
              <a href={`https://api.whatsapp.com/send?text=Check%20out%20my%20wishlist!%20${encodeURIComponent(getWishlistShareLink() || window.location.href)}`} target="_blank" rel="noopener noreferrer" className="btn-share whatsapp" style={{ padding: '8px 12px', background: '#25d366', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>
                WhatsApp
              </a>
              <a href={`mailto:?subject=Check%20out%20my%20wishlist!&body=Here%20is%20my%20wishlist:%20${encodeURIComponent(getWishlistShareLink() || window.location.href)}`} className="btn-share email" style={{ padding: '8px 12px', background: '#888', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>
                Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
