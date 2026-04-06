import React, { useContext } from "react";
import { ShopContext } from "../../context/shop-context";
import ImageCarousel from "../productDetails/ImageCarousel";
import Alert from 'react-s-alert';

export const CartItem = (props) => {
  const { id, title, offers, stock, imageURLs } = props.data;
  const { size = "S", isFree = false, flavorId = null } = props;
  const { cartItems, martItems, lartItems, freeCartItems, freeMartItems, freeLartItems, addToCart, removeFromCart } = useContext(ShopContext);

  const activeFlavorId = flavorId || (props.data.productFlavors && props.data.productFlavors[0]?.flavor_id) || 1;
  const activeFlavorData = props.data.productFlavors?.find(pf => String(pf.flavor_id) === String(activeFlavorId));
  const flavorName = activeFlavorData?.Flavor?.name || "Original";

  const getQuantity = () => {
    const cartKey = activeFlavorId ? `${id}_${activeFlavorId}` : id;
    if (isFree) {
      if (size === "S") return freeCartItems[id] || 0;
      if (size === "M") return freeMartItems[id] || 0;
      if (size === "L") return freeLartItems[id] || 0;
    } else {
      if (size === "S") return cartItems[cartKey] || 0;
      if (size === "M") return martItems[cartKey] || 0;
      if (size === "L") return lartItems[cartKey] || 0;
    }
    return 0;
  };

  const getPrice = () => {
    if (isFree || !activeFlavorData) return 0;
    if (size === "S") return activeFlavorData.price || 0;
    if (size === "M") return activeFlavorData.priceMedium || 0;
    if (size === "L") return activeFlavorData.priceLarge || 0;
    return activeFlavorData.price || 0;
  };

  const currentPrice = getPrice();
  const quantity = getQuantity();
  const sizeLabel = size === "S" ? "Small" : size === "M" ? "Medium" : "Large";

  const discount = isFree ? 0 : (offers && offers.find(o => o.size === size && o.type === 0)?.discount || 0);
  const discountedPrice = currentPrice - (currentPrice * discount / 100);

  if (quantity === 0) return null;

  return (
    <div className={`flex gap-4 p-4 rounded-3xl border transition-all duration-500 group relative cart-item-anim cart-item-card ${isFree ? 'bg-emerald-50/40 border-emerald-100/50' : 'bg-white border-slate-100 hover:border-sky-100'}`}>
      {/* Compact Product Image Area with Horizontal Carousel */}
      <div className="w-20 h-20 flex-shrink-0 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 relative group/img">
        <div className="h-full w-full flex overflow-x-auto custom-scrollbar snap-x snap-mandatory scroll-smooth">
          {imageURLs ? imageURLs.split(',').map((url, i) => (
            <div key={i} className="w-full h-full flex-shrink-0 snap-center">
              <img
                src={url.trim().startsWith('http') && !url.trim().includes('https://prudent-farsighted-yareli.ngrok-free.dev')
                  ? url.trim()
                  : (url.trim().includes('https://prudent-farsighted-yareli.ngrok-free.dev')
                    ? url.trim().replace('https://prudent-farsighted-yareli.ngrok-free.dev', '')
                    : (url.trim().startsWith('/') ? url.trim() : `/${url.trim()}`))}
                className="w-full h-full object-cover"
                alt={`${url} ${i}`}
              />
            </div>
          )) : (
            <div className="w-full h-full flex-shrink-0 snap-center">
              <img
                src={`/images/${id}.png`}
                className="w-full h-full object-cover"
                alt={title}
              />
            </div>
          )}
        </div>

        {/* Improved Horizontal Scroll Hint (Visible Dots) */}
        {imageURLs && imageURLs.split(',').length > 1 && (
          <div className="absolute bottom-1.5 inset-x-0 flex justify-center gap-1.5 pointer-events-none">
            {imageURLs.split(',').map((_, i) => (
              <div key={i} className={`h-1 rounded-full bg-slate-900/20 ${i === 0 ? 'w-2.5 bg-slate-900/40' : 'w-1'}`} />
            ))}
          </div>
        )}

        {isFree && (
          <div className="absolute inset-x-0 top-0 bg-emerald-500/90 py-0.5 text-center z-10">
            <span className="text-[7px] font-black text-white uppercase tracking-tighter">Complimentary</span>
          </div>
        )}
      </div>

      {/* Compact Details */}
      <div className="flex-grow flex flex-col justify-between py-0.5 min-w-0">
        <div className="space-y-0.5">
          <div className="flex justify-between items-start gap-2">
            <h4 className="text-[13px] font-black text-slate-800 leading-tight truncate" title={title}>
              {title}
            </h4>
            {!isFree && (
              <button
                onClick={() => removeFromCart(id, size)}
                className="text-slate-300 hover:text-rose-500 transition-colors p-0.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{sizeLabel} Pack</p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col">
            <span className="text-[14px] font-black text-slate-900 tracking-tight">
              ₹{discountedPrice.toLocaleString()}
            </span>
          </div>

          {/* Ultra-Compact Quantity Selector */}
          <div className={`flex items-center gap-1.5 p-0.5 rounded-xl border ${isFree ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100 shadow-inner shadow-slate-200/5'}`}>
            {!isFree ? (
              <>
                <button
                  onClick={() => removeFromCart(id, size, activeFlavorId)}
                  className="w-6 h-6 flex items-center justify-center rounded-lg bg-white text-slate-400 hover:text-slate-900 shadow-sm transition-all"
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg>
                </button>
                <span className="text-[11px] font-black text-slate-900 tabular-nums px-1">
                  {quantity}
                </span>
                <button
                  onClick={() => {
                    if (quantity < stock) {
                      addToCart(id, size, activeFlavorId);
                    } else {
                      Alert.info('Max reached');
                    }
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded-lg bg-white text-slate-400 hover:text-sky-600 shadow-sm transition-all"
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                </button>
              </>
            ) : (
              <span className="px-3 text-[10px] font-black text-emerald-700 italic">x{quantity}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
