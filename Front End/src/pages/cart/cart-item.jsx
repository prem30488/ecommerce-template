import React, { useContext } from "react";
import { ShopContext } from "../../context/shop-context";
import ImageCarousel from "../productDetails/ImageCarousel";
import Alert from 'react-s-alert';

export const CartItem = (props) => {
  const { id, title, price, priceMedium, priceLarge, offers, stock, imageURLs } = props.data;
  const { size = "S", isFree = false } = props;
  const { cartItems, martItems, lartItems, freeCartItems, freeMartItems, freeLartItems, addToCart, removeFromCart } = useContext(ShopContext);

  const getQuantity = () => {
    if (isFree) {
      if (size === "S") return freeCartItems[id] || 0;
      if (size === "M") return freeMartItems[id] || 0;
      if (size === "L") return freeLartItems[id] || 0;
    } else {
      if (size === "S") return cartItems[id] || 0;
      if (size === "M") return martItems[id] || 0;
      if (size === "L") return lartItems[id] || 0;
    }
    return 0;
  };

  const getPrice = () => {
    if (isFree) return 0;
    if (size === "S") return price;
    if (size === "M") return priceMedium;
    if (size === "L") return priceLarge;
    return price;
  };

  const currentPrice = getPrice();
  const quantity = getQuantity();
  const sizeLabel = size === "S" ? "Small" : size === "M" ? "Medium" : "Large";

  const discount = isFree ? 0 : (offers && offers.find(o => o.size === size && o.type === 0)?.discount || 0);
  const discountedPrice = currentPrice - (currentPrice * discount / 100);

  if (quantity === 0) return null;

  return (
    <div className={`flex gap-6 p-6 rounded-[2.5rem] border transition-all duration-500 group relative ${isFree ? 'bg-emerald-50/40 border-emerald-100/50' : 'bg-white border-slate-100 hover:border-sky-100 hover:shadow-[0_25px_50px_rgba(0,0,0,0.04)] hover:-translate-y-1'}`}>
      {/* Product Image Carousel */}
      <div className="w-36 h-36 flex-shrink-0 bg-slate-100 rounded-[2rem] overflow-hidden border border-slate-100 relative shadow-sm transition-all duration-500 group-hover:shadow-md">
        <ImageCarousel 
          id={id}
          title={title}
          imageList={imageURLs}
          thumbs={true}
        />
        {isFree && (
          <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none flex items-center justify-center z-10">
            <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-emerald-200">Gifted</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-grow flex flex-col justify-between py-1">
        <div className="space-y-1">
          <div className="flex justify-between items-start gap-3">
            <h4 className="text-[15px] font-black text-slate-800 leading-snug truncate max-w-[150px]" title={title}>
              {title}
            </h4>
            {!isFree && (
              <button 
                onClick={() => removeFromCart(id, size)}
                className="w-9 h-9 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all duration-300 group/del"
              >
                <svg className="w-4 h-4 group-hover/del:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
             <span className="px-2 py-1 bg-slate-100 text-[10px] font-black text-slate-400 rounded-lg uppercase tracking-[0.15em] leading-none">{sizeLabel}</span>
             <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest leading-none">In Stock</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-col">
            {discount > 0 && (
              <span className="text-[11px] font-bold text-slate-300 line-through tracking-tighter mb-0.5">₹{currentPrice.toLocaleString()}</span>
            )}
            <span className="text-xl font-black text-slate-900 tracking-tighter leading-none">
              ₹{discountedPrice.toLocaleString()}
            </span>
          </div>

          {/* Professional Quantity Selector */}
          <div className={`flex items-center gap-2 p-1 rounded-[1.25rem] border ${isFree ? 'bg-emerald-100/20 border-emerald-100 shadow-sm' : 'bg-slate-50 border-slate-100 shadow-inner'}`}>
            {!isFree ? (
              <>
                <button 
                  onClick={() => removeFromCart(id, size)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-slate-900 shadow-sm hover:shadow-md transition-all active:scale-90"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M20 12H4"/></svg>
                </button>
                <div className="w-7 text-center text-[14px] font-black text-slate-900 tabular-nums">
                  {quantity}
                </div>
                <button 
                  onClick={() => {
                    if(quantity < stock) {
                      addToCart(id, size);
                    } else {
                      Alert.info('Max stock reached');
                    }
                  }}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-sky-600 shadow-sm hover:shadow-md transition-all active:scale-90"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M12 4v16m8-8H4"/></svg>
                </button>
              </>
            ) : (
              <div className="px-6 h-9 flex items-center justify-center text-[12px] font-black text-emerald-700 tracking-widest uppercase italic">
                {quantity} Unit(s)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
);
};
