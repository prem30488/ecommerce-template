import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../../context/shop-context";
import { PremiumCartItem } from "./PremiumCartItem";
import { useNavigate, Link } from "react-router-dom";
import "./premium-cart.css";
import { API_BASE_URL } from "../../constants";

export const PremiumCart = ({ onClose }) => {
  const { cartItems, martItems, lartItems, freeCartItems, freeMartItems, freeLartItems, getTotalCartAmount, addTotalAfterDiscount, resetCart } = useContext(ShopContext);
  const totalAmount = getTotalCartAmount();
  const [products, setProducts] = useState([]);
  const [coupon, setCoupon] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const freeShippingThreshold = 2000;
  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/product/getProducts?page=0&size=1000`);
        if (!res.ok) throw new Error("Fetch failed");
        const json = await res.json();
        setProducts(json.content || []);
      } catch (err) {
        console.error(err);
      }
    };
    getData();
  }, []);

  // 7. Coupon code support (LOVERBOY50 should give 5% discount)
  const applyCoupon = () => {
    if (coupon.toUpperCase() === "LOVERBOY50") {
      setDiscountPercent(5);
      const discounted = totalAmount * 0.95;
      if (addTotalAfterDiscount) addTotalAfterDiscount(discounted);
    } else {
      setDiscountPercent(0);
    }
  };

  const discountAmount = totalAmount * (discountPercent / 100);
  const grandTotal = totalAmount - discountAmount;
  const progressPercent = Math.min((totalAmount / freeShippingThreshold) * 100, 100);
  const diff = Math.max(freeShippingThreshold - totalAmount, 0);

  // Count directly from raw cart state so hasItems is true even before product prices load
  const cartCount =
    Object.values(cartItems).reduce((a, b) => a + b, 0) +
    Object.values(martItems).reduce((a, b) => a + b, 0) +
    Object.values(lartItems).reduce((a, b) => a + b, 0) +
    Object.values(freeCartItems).reduce((a, b) => a + b, 0) +
    Object.values(freeMartItems).reduce((a, b) => a + b, 0) +
    Object.values(freeLartItems).reduce((a, b) => a + b, 0);
  const hasItems = cartCount > 0;

  return (
    <div className="premium-cart-container">
      {/* Header */}
      <div className="premium-cart-header">
        <div>
          <h2>Your Cart</h2>
          <span className="cart-status-badge">Professional Edition</span>
        </div>
        <div className="header-actions">
          {hasItems && (
            <button
              onClick={resetCart}
              className="clear-cart-btn"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              <span>Clear All</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="premium-close-btn"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {/* 5. Shipping Free or Complementary */}
      {hasItems && (
        <div className="premium-shipping-widget">
          <div className="p-progress-label">
            <span className="p-label-text">
              {diff > 0 ? `Spend ₹${diff.toLocaleString()} more for FREE shipping` : "🎉 Exclusive Shipping Unlocked"}
            </span>
            <span className="p-label-text" style={{ color: '#0ea5e9' }}>{Math.round(progressPercent)}%</span>
          </div>
          <div className="p-progress-bar">
            <div className={`p-progress-fill ${progressPercent === 100 ? 'full' : ''}`} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      )}

      <div className="premium-cart-body custom-scrollbar">
        {hasItems ? (
          products.length > 0 ? (
            products.map((product) => (
              <React.Fragment key={product.id}>
                {/* Render items by iterating over all keys that belong to this product */}
                {Object.keys(cartItems).map(key => {
                  const [pid, fid] = key.split('_');
                  if (pid === String(product.id) && cartItems[key] > 0) {
                    return <PremiumCartItem key={`${key}_S`} data={product} size="S" flavorId={fid} />;
                  }
                  return null;
                })}
                {Object.keys(martItems).map(key => {
                  const [pid, fid] = key.split('_');
                  if (pid === String(product.id) && martItems[key] > 0) {
                    return <PremiumCartItem key={`${key}_M`} data={product} size="M" flavorId={fid} />;
                  }
                  return null;
                })}
                {Object.keys(lartItems).map(key => {
                  const [pid, fid] = key.split('_');
                  if (pid === String(product.id) && lartItems[key] > 0) {
                    return <PremiumCartItem key={`${key}_L`} data={product} size="L" flavorId={fid} />;
                  }
                  return null;
                })}

                {/* Free items still use product.id keys for now */}
                {freeCartItems[product.id] > 0 && <PremiumCartItem data={product} size="S" isFree />}
                {freeMartItems[product.id] > 0 && <PremiumCartItem data={product} size="M" isFree />}
                {freeLartItems[product.id] > 0 && <PremiumCartItem data={product} size="L" isFree />}
              </React.Fragment>
            ))
          ) : (
            <div className="p-4 text-center p-label-text">Loading curation...</div>
          )
        ) : (
          <div className="p-empty">
            <div className="p-empty-icon">
              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '8px' }}>Your Cart is Quiet</h3>
            <p className="p-label-text" style={{ maxWidth: '200px', margin: '0 auto' }}>Curate your selection and discover your next piece.</p>
          </div>
        )}
      </div>

      {/* Footer / Summary (Including 6. Grand total and 8. Checkout button) */}
      {hasItems && (
        <div className="premium-cart-footer">
          <div className="p-summary-row">
            <span className="p-summary-label">Standard Subtotal</span>
            <span className="p-summary-value">₹{(totalAmount || 0).toLocaleString()}</span>
          </div>
          {discountPercent > 0 && (
            <div className="p-summary-row" style={{ color: '#10b981' }}>
              <span className="p-summary-label">Coupon Discount (5%)</span>
              <span className="p-summary-value">-₹{(discountAmount || 0).toLocaleString()}</span>
            </div>
          )}
          <div className="p-summary-row">
            <span className="p-summary-label">Shipping</span>
            <span className="p-summary-value" style={{ color: diff === 0 ? '#10b981' : '#94a3b8' }}>
              {diff === 0 ? "Complementary" : "Standard Calc"}
            </span>
          </div>

          <div className="p-grand-total">
            <div>
              <span className="p-label-text" style={{ color: '#0f172a' }}>Grand Total</span>
              <p className="p-label-text" style={{ fontSize: '8px' }}>Inclusive of all taxes</p>
            </div>
            <span className="p-total-price">₹{(grandTotal || 0).toLocaleString()}</span>
          </div>

          {/* 7. Coupon code support */}
          <div className="p-coupon-section">
            <input
              className="p-coupon-input"
              placeholder="LOVERBOY50"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
            />
            <button className="p-coupon-btn" onClick={applyCoupon}>Apply</button>
          </div>

          {/* 8. Checkout Button */}
          <button
            className="p-checkout-btn"
            onClick={() => { onClose(); navigate("/checkout"); }}
          >
            Checkout Securely
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      )}
    </div>
  );
};
