import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/shop-context";
import WishlistIcon from "./WishlistIcon";
import { FaExchangeAlt, FaEye } from 'react-icons/fa';
import Alert from 'react-s-alert';
import { resolveImageUrl } from "../util/imageUrl";

const SimilarProduct = ({ product }) => {
  const { id, title, brand, productFlavors, categories, stock } = product;
  const { addToCart, cartItems, addToCompare, removeFromCompare, selectedItems } = useContext(ShopContext);
  const navigate = useNavigate();

  const isCompared = selectedItems.some(p => p.id === id);
  const price = productFlavors?.[0]?.price || 0;
  const imageUrl = resolveImageUrl(product.image || product.imageURLs?.split(',')[0]);

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeFromCompare(product);
      Alert.info("Removed from comparison");
    } else {
      addToCompare(product);
      Alert.success("Added to comparison");
    }
  };

  const currentCartCount = Object.keys(cartItems).reduce((sum, key) =>
    key.startsWith(`${id}_`) ? sum + (cartItems[key] || 0) : sum, 0);

  return (
    <div className="frequent-card" style={{ height: '100%' }}>
      {/* Image Section */}
      <div className="frequent-card-image" onClick={() => navigate(`/productDetails/${id}`)}>
        <img src={imageUrl} alt={title} loading="lazy" />

        {/* Action Column */}
        <div className="fbc-action-col">
          <button
            className={`fbc-action-btn fbc-add-btn ${currentCartCount > 0 ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              const flavorId = productFlavors?.[0]?.flavor_id;
              if (flavorId) {
                addToCart(id, 'S', flavorId);
              }
            }}
          >
            {currentCartCount > 0 ? <span className="fbc-cart-count">{currentCartCount}</span> : "+"}
          </button>

          <button
            className="fbc-action-btn fbc-eye-btn"
            onClick={(e) => { e.stopPropagation(); navigate(`/productDetails/${id}`); }}
            title="View Details"
          >
            <FaEye size={12} />
          </button>

          <button
            className={`fbc-action-btn ${isCompared ? 'active' : ''}`}
            onClick={handleCompare}
            title={isCompared ? "Remove from Compare" : "Add to Compare"}
            style={{
              color: isCompared ? 'var(--color-primary)' : 'inherit',
              background: isCompared ? 'var(--color-primary-glow)' : ''
            }}
          >
            <FaExchangeAlt size={12} />
          </button>

          <WishlistIcon
            productId={id}
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
              border: '1px solid #f1f5f9'
            }}
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="frequent-card-content">
        <div className="frequent-card-brand">{brand || 'Premium Selection'}</div>
        <Link to={`/productDetails/${id}`} className="frequent-card-title">{title}</Link>

        <div className="fbc-rating">
          <span className="stars">★★★★★</span>
          <span className="rating-val">4.8</span>
        </div>

        <div className="frequent-card-footer">
          <span className="frequent-card-price">₹{price.toLocaleString()}</span>
          <span className="frequent-card-stock">{stock > 0 ? `In Stock (${stock})` : 'Out of Stock'}</span>
        </div>
      </div>
    </div>
  );
};

export default SimilarProduct;