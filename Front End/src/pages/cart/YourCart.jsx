import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../../context/shop-context";
import { PremiumCartItem } from "./PremiumCartItem";
import { useNavigate, Link } from "react-router-dom";
import "./your-cart.css";
import { getCoupons } from "../../util/APIUtils";
import ConfirmationModal from "../../components/ConfirmationModal";


export const YourCart = () => {
  const { cartItems, martItems, lartItems, freeCartItems, freeMartItems, freeLartItems, getTotalCartAmount, addTotalAfterDiscount, resetCart, products } = useContext(ShopContext);
  const totalAmount = getTotalCartAmount();
  const [coupon, setCoupon] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const freeShippingThreshold = 2000;
  const navigate = useNavigate();

  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponError, setCouponError] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchCoupons = async () => {
      try {
        const data = await getCoupons(0, 100);
        setAvailableCoupons(data.content || []);
      } catch (err) {
        console.error("Failed to fetch coupons:", err);
      }
    };
    fetchCoupons();
  }, []);

  const applyCoupon = () => {
    setCouponError("");
    const found = availableCoupons.find(c => c.code.toUpperCase() === coupon.toUpperCase());

    if (found) {
      setDiscountPercent(found.discount);
      const discounted = totalAmount * (1 - found.discount / 100);
      if (addTotalAfterDiscount) addTotalAfterDiscount(discounted);
    } else {
      setDiscountPercent(0);
      setCouponError("Invalid or expired coupon code.");
    }
  };

  const handleClearCart = () => {
    setIsConfirmModalOpen(true);
  };

  const confirmClearCart = () => {
    resetCart();
    setIsConfirmModalOpen(false);
  };

  const discountAmount = totalAmount * (discountPercent / 100);
  const grandTotal = totalAmount - discountAmount;
  const progressPercent = Math.min((totalAmount / freeShippingThreshold) * 100, 100);
  const diff = Math.max(freeShippingThreshold - totalAmount, 0);

  const cartCount =
    Object.values(cartItems).reduce((a, b) => a + b, 0) +
    Object.values(martItems).reduce((a, b) => a + b, 0) +
    Object.values(lartItems).reduce((a, b) => a + b, 0) +
    Object.values(freeCartItems).reduce((a, b) => a + b, 0) +
    Object.values(freeMartItems).reduce((a, b) => a + b, 0) +
    Object.values(freeLartItems).reduce((a, b) => a + b, 0);
  const hasItems = cartCount > 0;

  return (
    <div className="your-cart-page">
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmClearCart}
        title="Clear Bag"
        message="Are you sure you want to clear your entire bag? This action cannot be undone."
      />
      <div className="your-cart-container">
        {/* Header Section */}
        <div className="your-cart-header">
          <div className="header-left">
            <h1 className="page-title">Shopping Bag</h1>
            <p className="item-count-badge">{cartCount} {cartCount === 1 ? 'Item' : 'Items'} Selected</p>
          </div>
          <div className="header-actions">
            {hasItems && (
              <button onClick={handleClearCart} className="yc-clear-btn">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                <span>Clear Bag</span>
              </button>
            )}
            <Link to="/products" className="yc-continue-btn">
               Continue Shopping
            </Link>
          </div>
        </div>

        {hasItems ? (
          <div className="your-cart-content">
            {/* Left Column: Cart Items */}
            <div className="cart-items-section">
              {/* Shipping Progress */}
              <div className="yc-shipping-widget">
                 <div className="yc-progress-info">
                   <span className="yc-progress-text">
                     {diff > 0 ? `ADD ₹${diff.toLocaleString()} MORE FOR FREE SHIPPING` : "YOUR SHIPPING IS COMPLIMENTARY"}
                   </span>
                   <span className="yc-progress-percent">{Math.round(progressPercent)}%</span>
                 </div>
                 <div className="yc-progress-track">
                   <div className={`yc-progress-fill ${progressPercent === 100 ? 'complete' : ''}`} style={{ width: `${progressPercent}%` }}></div>
                 </div>
              </div>

              <div className="items-list custom-scrollbar">
                {products.length > 0 ? (
                  products.map((product) => (
                    <React.Fragment key={product.id}>
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
                      {freeCartItems[product.id] > 0 && <PremiumCartItem data={product} size="S" isFree />}
                      {freeMartItems[product.id] > 0 && <PremiumCartItem data={product} size="M" isFree />}
                      {freeLartItems[product.id] > 0 && <PremiumCartItem data={product} size="L" isFree />}
                    </React.Fragment>
                  ))
                ) : (
                  <div className="yc-loading">Curating your selection...</div>
                )}
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="cart-summary-section">
              <div className="summary-card">
                <h2 className="summary-title">Order Summary</h2>
                
                <div className="summary-rows">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{(totalAmount || 0).toLocaleString()}</span>
                  </div>
                  
                  {discountPercent > 0 && (
                    <div className="summary-row discount">
                      <span>Discount ({discountPercent}%)</span>
                      <span>-₹{(discountAmount || 0).toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="summary-row">
                    <span>Estimated Shipping</span>
                    <span className={diff === 0 ? "free-shipping-text" : ""}>
                      {diff === 0 ? "FREE" : "Calculated at next step"}
                    </span>
                  </div>
                </div>

                <div className="summary-total">
                  <div className="total-label">
                    <span>Grand Total</span>
                    <small>Inclusive of all taxes</small>
                  </div>
                  <span className="total-amount">₹{(grandTotal || 0).toLocaleString()}</span>
                </div>

                {/* Coupon Section */}
                <div className="yc-coupon-box">
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="PROMO CODE"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                    />
                    <button onClick={applyCoupon}>Apply</button>
                  </div>
                  {couponError && <p className="coupon-error">{couponError}</p>}
                  {discountPercent > 0 && <p className="coupon-success">Success! {discountPercent}% discount applied.</p>}
                </div>

                <button
                  className="yc-checkout-btn"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>

                <div className="secure-checkout-badge">
                   <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zm3 8H9V7c0-1.654 1.346-3 3-3s3 1.346 3 3v3zm-3 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>
                   <span>Secure & SSL Encrypted Checkout</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="yc-empty-state">
            <div className="empty-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
            <h2>Your Bag is Empty</h2>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <Link to="/products" className="explore-btn">Explore Collections</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default YourCart;
