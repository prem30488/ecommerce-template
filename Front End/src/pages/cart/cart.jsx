import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../../context/shop-context";
import { CartItem } from "./cart-item";
import { useNavigate, Link } from "react-router-dom";
import "./cart.css";
import CouponCode from "../checkout/CouponCode";

export const Cart = ({ onClose }) => {
  const { cartItems, martItems, lartItems, freeCartItems, freeMartItems, freeLartItems, getTotalCartAmount } = useContext(ShopContext);
  const totalAmount = getTotalCartAmount();
  const [products, setProducts] = useState([]);
  const freeShippingThreshold = 2000;

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch("//localhost:5000/api/product/getProducts?page=0&size=1000&sorted=true");
        if (!res.ok) throw new Error("Oops! An error has occured");
        const json = await res.json();
        setProducts(json.content);
      } catch (err) {
        console.error(err);
      }
    };
    getData();
  }, []);

  const hasItems = totalAmount > 0;
  const progressToFreeShipping = Math.min((totalAmount / freeShippingThreshold) * 100, 100);
  const remainingForFreeShipping = Math.max(freeShippingThreshold - totalAmount, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-50">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Your Cart</h2>
          <div className="flex items-center gap-2 mt-1">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none">Secure Checkout</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all duration-500 hover:rotate-90 shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Progress Bar for Free Shipping */}
      {hasItems && (
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {remainingForFreeShipping > 0 
                ? `Add ₹${remainingForFreeShipping.toLocaleString()} more for FREE shipping`
                : "🎉 You've unlocked FREE shipping!"}
            </span>
            <span className="text-[10px] font-black text-sky-600">{Math.round(progressToFreeShipping)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-sky-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(14,165,233,0.5)]" 
              style={{ width: `${progressToFreeShipping}%` }} 
            />
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar bg-white min-h-0 max-h-full">
        {hasItems ? (
          <div className="space-y-4 pb-12">
            {products.map((product) => (
              <React.Fragment key={product.id}>
                {cartItems[product.id] > 0 && <CartItem data={product} size="S" />}
                {martItems[product.id] > 0 && <CartItem data={product} size="M" />}
                {lartItems[product.id] > 0 && <CartItem data={product} size="L" />}
                {freeCartItems[product.id] > 0 && <CartItem data={product} size="S" isFree={true} />}
                {freeMartItems[product.id] > 0 && <CartItem data={product} size="M" isFree={true} />}
                {freeLartItems[product.id] > 0 && <CartItem data={product} size="L" isFree={true} />}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-10">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-100 rotate-12">
              <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Cart is Empty</h3>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">Start adding items to your collection to see them here.</p>
            <button 
              onClick={onClose}
              className="mt-10 px-10 py-4 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-sky-500 transition-all duration-500 shadow-2xl shadow-slate-200"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>

      {/* Footer / Summary */}
      {hasItems && (
        <div className="p-10 bg-white border-t border-slate-100 shadow-[0_-30px_60px_rgba(0,0,0,0.05)] z-10 relative">
          <div className="space-y-4 mb-10">
            <div className="flex justify-between items-center text-slate-400">
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Subtotal</span>
               <span className="text-sm font-black text-slate-600 tracking-tight">₹{totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Shipping</span>
               <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${remainingForFreeShipping === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                 {remainingForFreeShipping === 0 ? "Complimentary" : "Calculated at checkout"}
               </span>
            </div>
            <div className="h-[1px] bg-slate-50 my-6" />
            <div className="flex items-end justify-between">
              <div>
                <span className="text-slate-900 text-[10px] font-black uppercase tracking-[0.25em] block mb-1">Total Amount</span>
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none">VAT/GST Included</span>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
                  ₹{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
             <div className="bg-slate-50/50 p-1 rounded-2xl border border-slate-100/50">
                <CouponCode />
             </div>

             <Link 
               to="/checkout" 
               onClick={onClose}
               className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-center block transition-all duration-700 hover:bg-sky-600 shadow-[0_20px_40px_rgba(15,23,42,0.15)] hover:shadow-[0_20px_40px_rgba(14,165,233,0.3)] hover:-translate-y-1 active:scale-95 group relative overflow-hidden flex items-center justify-center gap-3"
             >
               <span className="text-[11px] uppercase tracking-[0.3em] relative z-10">Proceed to Checkout</span>
               <svg className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_3s_infinite]" />
             </Link>
          </div>
          
          <div className="flex items-center justify-center gap-6 mt-8">
             <div className="flex items-center gap-2 opacity-30 grayscale">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-2" alt="Visa" />
             </div>
             <div className="flex items-center gap-2 opacity-30 grayscale">
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="Mastercard" />
             </div>
             <div className="flex items-center gap-2 opacity-30 grayscale">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-3" alt="Paypal" />
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
