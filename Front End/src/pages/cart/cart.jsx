import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../../context/shop-context";
import { CartItem } from "./cart-item";
import { useNavigate, Link } from "react-router-dom";
import "./cart.css";
import CouponCode from "../checkout/CouponCode";
import { API_BASE_URL } from "../../constants";

export const Cart = ({ onClose }) => {
  const { cartItems, martItems, lartItems, freeCartItems, freeMartItems, freeLartItems, getTotalCartAmount, getTotalCartCount } = useContext(ShopContext);
  const totalAmount = getTotalCartAmount();
  const [products, setProducts] = useState([]);
  const freeShippingThreshold = 2000;

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/product/getProducts?page=0&size=1000&sorted=true`);
        if (!res.ok) throw new Error("Oops! An error has occured");
        const json = await res.json();
        setProducts(json.content);
      } catch (err) {
        console.error(err);
      }
    };
    getData();
  }, []);

  const hasItems = getTotalCartCount() > 0;
  const progressToFreeShipping = Math.min((totalAmount / freeShippingThreshold) * 100, 100);
  const remainingForFreeShipping = Math.max(freeShippingThreshold - totalAmount, 0);

  return (
    <div className="flex flex-col h-screen max-h-screen bg-white shadow-2xl cart-drawer-container overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-8 border-b border-slate-50/80 bg-white/50 backdrop-blur-sm z-20">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Your Cart
            <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">{products.length ? "Live" : "Empty"}</span>
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none">Security Secured Checkout</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all duration-500 hover:rotate-90 shadow-sm border border-slate-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Progress Bar for Free Shipping */}
      {hasItems && (
        <div className="px-8 py-5 bg-slate-50/30 border-b border-slate-50/50">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              {remainingForFreeShipping > 0
                ? `Spend ₹${remainingForFreeShipping.toLocaleString()} more for FREE shipping`
                : "🎉 You've unlocked FREE shipping!"}
            </span>
            <span className="text-[10px] font-black text-sky-600 bg-sky-50 px-2 py-0.5 rounded-lg">{Math.round(progressToFreeShipping)}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-[2px] border border-slate-200/50">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(14,165,233,0.3)] ${progressToFreeShipping === 100 ? 'bg-emerald-500' : 'bg-sky-500'} shipping-progress-candy`}
              style={{ width: `${progressToFreeShipping}%` }}
            />
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex-grow overflow-y-scroll p-8 space-y-6 custom-scrollbar bg-white min-h-[400px] relative z-10 touch-pan-y pointer-events-auto">
        {hasItems ? (
          <div className="space-y-6 pb-12">
            {products.length > 0 ? (
              products.map((product) => {
                const renderAllFlavors = (items, size, isFree = false) => {
                  return Object.keys(items).map(key => {
                    const [pid, flavorId] = key.split('_');
                    if (Number(pid) === product.id && items[key] > 0) {
                      return <CartItem key={`${key}_${size}_${isFree}`} data={product} size={size} flavorId={flavorId} isFree={isFree} />
                    }
                    return null;
                  });
                };

                return (
                  <React.Fragment key={product.id}>
                    {renderAllFlavors(cartItems, "S")}
                    {renderAllFlavors(martItems, "M")}
                    {renderAllFlavors(lartItems, "L")}
                    {renderAllFlavors(freeCartItems, "S", true)}
                    {renderAllFlavors(freeMartItems, "M", true)}
                    {renderAllFlavors(freeLartItems, "L", true)}
                  </React.Fragment>
                );
              })
            ) : (
              <div className="p-4 text-center text-slate-400">Loading products...</div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-10">
            <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mb-10 border border-slate-100/50 shadow-inner empty-cart-float">
              <svg className="w-16 h-16 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Your Cart is Quiet</h3>
            <p className="text-slate-400 text-sm mt-4 leading-relaxed max-w-[240px] mx-auto">Discover our curated selection and find your next favorite piece.</p>
            <button
              onClick={onClose}
              className="mt-12 px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-sky-600 transition-all duration-700 shadow-2xl shadow-slate-200 border border-slate-800 active:scale-95"
            >
              Explore Shop
            </button>
          </div>
        )}
      </div>

      {/* Footer / Summary */}
      {hasItems && (
        <div className="p-10 cart-glass-footer z-30 relative rounded-t-[3rem] border-t-0 shadow-[0_-40px_80px_rgba(0,0,0,0.06)]">
          <div className="space-y-5 mb-10">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-[0.25em]">Subtotal</span>
              <span className="text-sm font-black text-slate-700 tracking-tight">₹{totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-[0.25em]">Shipping</span>
              <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-sm border ${remainingForFreeShipping === 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                {remainingForFreeShipping === 0 ? "Complimentary" : "Calculated at next step"}
              </span>
            </div>
            <div className="h-[1px] bg-slate-100/50 my-8 shadow-sm" />
            <div className="flex items-end justify-between">
              <div>
                <span className="text-slate-900 text-[10px] font-black uppercase tracking-[0.3em] block mb-2">Grand Total</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none">Inclusive of Taxes</span>
              </div>
              <div className="text-right">
                <span className="text-5xl font-black text-slate-900 tracking-tighter leading-none block">
                  ₹{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* CouponCode temporarily hidden to debug layout */}
            {/* <div className="bg-white/50 p-1.5 rounded-2xl border border-slate-100/80 shadow-inner compact-coupon-wrapper">
              <CouponCode />
            </div> */}

            <Link
              to="/checkout"
              onClick={onClose}
              className="w-full bg-slate-900 text-white py-6 rounded-[2.2rem] font-black text-center block transition-all duration-700 hover:bg-sky-600 shadow-[0_25px_50px_-12px_rgba(15,23,42,0.25)] hover:shadow-[0_25px_50px_-12px_rgba(14,165,233,0.35)] hover:-translate-y-1.5 active:scale-95 group relative overflow-hidden flex items-center justify-center gap-4 border border-slate-800 btn-checkout-glow"
            >
              <span className="text-xs uppercase tracking-[0.35em] relative z-10">Secure Checkout</span>
              <svg className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_3s_infinite]" />
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 mt-10">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-2.5 opacity-20 grayscale hover:opacity-100 transition-all duration-500 cursor-pointer" alt="Visa" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-5 opacity-20 grayscale hover:opacity-100 transition-all duration-500 cursor-pointer" alt="Mastercard" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-3.5 opacity-20 grayscale hover:opacity-100 transition-all duration-500 cursor-pointer" alt="Paypal" />
          </div>
        </div>
      )}
    </div>
  );
};
