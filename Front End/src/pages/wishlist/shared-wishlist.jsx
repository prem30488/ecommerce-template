import React, { useContext, useEffect, useState } from 'react';
import { API_BASE_URL } from '../../constants/index.jsx';
import { useSearchParams } from 'react-router-dom';
import './shared-wishlist.css';
import { FaArrowLeft, FaShare, FaHeart } from 'react-icons/fa';

const SharedWishlist = () => {
  const [searchParams] = useSearchParams();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('');

  const userId = searchParams.get('userId');
  const productId = searchParams.get('product'); // Optional specific product

  const parsePrice = (productOrItem) => {
    if (!productOrItem) return 0;
    const product = productOrItem.Product || productOrItem;
    const flavor = product?.productFlavors?.[0];
    if (flavor) {
      const val = flavor.price ?? flavor.priceMedium ?? flavor.priceLarge;
      if (val !== undefined && val !== null && !Number.isNaN(Number(val))) {
        return Number(val);
      }
    }
    const fallback = product.price ?? product.priceMedium ?? product.priceLarge;
    if (fallback !== undefined && fallback !== null && !Number.isNaN(Number(fallback))) {
      return Number(fallback);
    }
    return 0;
  };

  const formatINR = (amount) => {
    const n = Number(amount);
    if (Number.isNaN(n)) {
      return '₹0.00';
    }
    return `₹${n.toFixed(2)}`;
  };

  useEffect(() => {
    const loadSharedWishlist = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/wishlist/shared/${userId}`);

        if (!response.ok) {
          throw new Error('Failed to load shared wishlist');
        }

        const data = await response.json();
        let items = data;

        // Filter to specific product if provided
        if (productId) {
          items = items.filter(item => item.product_id === parseInt(productId));
        }

        setWishlistItems(items);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (userId) {
      loadSharedWishlist();
    }
  }, [userId, productId]);

  const handleAddToCart = (item) => {
    // Redirect to product details or add to cart
    window.location.href = `/productDetails/${item.product_id}`;
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'Check Out This Wishlist',
        url: url
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="shared-wishlist-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error || !userId) {
    return (
      <div className="shared-wishlist-container">
        <div className="error">
          <p>{error || 'Invalid wishlist link'}</p>
          <a href="/" className="back-link">
            <FaArrowLeft /> Back to Home
          </a>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="shared-wishlist-container">
        <div className="empty">
          <FaHeart className="empty-icon" />
          <h2>This Wishlist is Empty</h2>
          <p>The person who shared this wishlist hasn't added any items yet.</p>
          <a href="/" className="back-link">
            <FaArrowLeft /> Back to Home
          </a>
        </div>
      </div>
    );
  }

  const totalPrice = wishlistItems.reduce((sum, item) => sum + parsePrice(item), 0);

  return (
    <div className="shared-wishlist-container">
      <div className="shared-wishlist-header">
        <div>
          <h1>
            <FaHeart /> Shared Wishlist
          </h1>
          <p className="item-count">{wishlistItems.length} items</p>
        </div>
        <button className="share-btn" onClick={handleShare}>
          <FaShare /> Share
        </button>
      </div>

      <div className="shared-wishlist-content">
        <div className="items-grid">
          {wishlistItems.map((item) => (
            <div key={item.id} className="wishlist-card">
              <div className="card-image">
                <img
                  src={item.Product?.img || (item.Product?.imageURLs ? (item.Product?.imageURLs.split(',')[0].startsWith('http') ? item.Product?.imageURLs.split(',')[0] : `${API_BASE_URL}/api/product/image/${item.product_id}/${item.Product?.imageURLs.split(',')[0]}`) : `https://picsum.photos/seed/${item.product_id}/400/400`)}
                  alt={item.Product?.title}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://placehold.co/400x400?text=${encodeURIComponent(item.Product?.title || 'Product')}`;
                  }}
                />
                <span className="category-badge">{item.Product?.category}</span>
              </div>
              <div className="card-body">
                <h3>{item.Product?.title}</h3>
                <p className="description">{item.Product?.description?.substring(0, 60)}...</p>
                <div className="prices">
                  <span className="price-label">S/M/L:</span>
                  <span className="price">{formatINR(item.Product?.productFlavors?.[0]?.price)}</span>
                  <span className="price-sep">/</span>
                  <span className="price">{formatINR(item.Product?.productFlavors?.[0]?.priceMedium)}</span>
                  <span className="price-sep">/</span>
                  <span className="price">{formatINR(item.Product?.productFlavors?.[0]?.priceLarge)}</span>
                </div>
              </div>
              <div className="card-footer">
                <button
                  className="btn-view"
                  onClick={() => handleAddToCart(item)}
                >
                  View / Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="wishlist-summary">
          <h3>Wishlist Summary</h3>
          <div className="summary-stats">
            <div className="stat">
              <span>Total Items:</span>
              <span className="value">{wishlistItems.length}</span>
            </div>
            <div className="stat">
              <span>Total Value:</span>
              <span className="value">{formatINR(totalPrice)}</span>
            </div>
            <div className="stat">
              <span>Lowest Price (S):</span>
              <span className="value">
                {formatINR(Math.min(...wishlistItems.map(parsePrice)))}
              </span>
            </div>
            <div className="stat">
              <span>Highest Price (L):</span>
              <span className="value">
                {formatINR(Math.max(...wishlistItems.map(parsePrice)))}
              </span>
            </div>
            <div className="stat">
              <span>Average Price (M):</span>
              <span className="value">
                {formatINR(wishlistItems.length ? (wishlistItems.reduce((sum, i) => sum + parsePrice(i), 0) / wishlistItems.length) : 0)}
              </span>
            </div>
          </div>
          <button className="btn-add-all" onClick={() => window.location.href = '/shop'}>
            Browse All Products
          </button>
        </div>
      </div>

      <div className="shared-wishlist-footer">
        <p>💡 Click on any item to view details and add it to your cart!</p>
      </div>
    </div>
  );
};

export default SharedWishlist;
