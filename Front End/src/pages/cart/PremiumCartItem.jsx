import React, { useContext, useState, useEffect } from "react";
const res = await fetch(`${API_BASE_URL}/api/flavor/getFlavors?size=1000`);
import { FRONTEND_BASE_URL, } from '../../constants/index.jsx';
import { ShopContext } from "../../context/shop-context";

export const PremiumCartItem = ({ data, size = "S", isFree = false, flavorId: propFlavorId = null }) => {
  const { id, title, stock, imageURLs, img } = data;
  const {
    cartItems,
    martItems,
    lartItems,
    freeCartItems,
    freeMartItems,
    freeLartItems,
    addToCart,
    removeFromCart,
  } = useContext(ShopContext);

  const flavorId = propFlavorId || (data.productFlavors && data.productFlavors[0]?.flavor_id) || 1;
  const activeFlavorData = data.productFlavors?.find(pf => String(pf.flavor_id) === String(flavorId));
  const [flavor, setFlavor] = useState(null);
  const [folderImages, setFolderImages] = useState([]);

  useEffect(() => {
    if (flavorId) {
      const fetchFlavor = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/flavor/getFlavors?size=1000`);
          const json = await res.json();
          const found = (json.content || []).find(f => f.id === Number(flavorId));
          setFlavor(found);
        } catch (e) {
          console.error(e);
        }
      };
      fetchFlavor();
    }

    const fetchFolderImages = async () => {
      try {
        const targetFlavorId = flavorId || '1';
        const res = await fetch(`${FRONTEND_BASE_URL}/images/${id}/${targetFlavorId}`);
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          setFolderImages(json);
        } else {
          const fallbackRes = await fetch(`${FRONTEND_BASE_URL}/images/${id}/1`);
          const fallbackJson = await fallbackRes.json();
          setFolderImages(fallbackJson || []);
        }
      } catch (e) {
        console.error('Error fetching folder images:', e);
        setFolderImages([]);
      }
    };
    fetchFolderImages();
  }, [id, flavorId]);

  const getQuantity = () => {
    const cartKey = flavorId ? `${id}_${flavorId}` : id;
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

  const quantity = getQuantity();
  const basePrice = getPrice();

  const activeOffer = data.offers?.find(o =>
    o.active &&
    o.discount > 0 &&
    (o.size === size || !o.size)
  );

  const getFinalPrice = () => {
    if (!activeOffer) return basePrice;
    if (activeOffer.type === 2) return Math.max(0, basePrice - activeOffer.discount);
    return basePrice * (1 - activeOffer.discount / 100);
  };
  const finalPrice = getFinalPrice();
  const sizeLabel = size === "S" ? "Small" : size === "M" ? "Medium" : "Large";

  const [activeImage, setActiveImage] = useState(0);
  const images = imageURLs ? imageURLs.split(',').map((u) => u.trim()) : (img ? [img] : []);

  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.clientWidth;
    const index = Math.round(scrollLeft / width);
    setActiveImage(index);
  };

  if (quantity === 0) return null;

  const displayImages = folderImages.length > 0 ? folderImages : images;

  return (
    <div className="p-cart-item">
      <div className="pc-image-container">
        <div className="pc-carousel custom-scrollbar" onScroll={handleScroll}>
          {displayImages.length > 0 ? (
            displayImages.map((src, i) => (
              <div key={i} className="pc-carousel-item">
                <img
                  src={src.startsWith('http') ? src : `${FRONTEND_BASE_URL}${src}`}
                  alt={`${title} ${i}`}
                />
              </div>
            ))
          ) : (
            <div className="pc-carousel-item">
              <img src={`${FRONTEND_BASE_URL}/images/${id}/1/1.png`} alt={title} />
            </div>
          )}
        </div>

        {flavor && (
          <div className="absolute top-1 left-1 flex items-center gap-1 bg-white/90 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-sky-100 shadow-sm z-10 scale-75 origin-top-left">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[7px] font-black text-sky-600 uppercase tracking-tighter">{flavor.name}</span>
          </div>
        )}

        {displayImages.length > 1 && (
          <div className="pc-dots">
            {displayImages.map((_, i) => (
              <div key={i} className={`pc-dot ${i === activeImage ? 'active' : ''}`} />
            ))}
          </div>
        )}
      </div>

      <div className="pc-details">
        <div>
          <h4 className="pc-title">{title}</h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="p-label-text" style={{ fontSize: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {sizeLabel} Pack
              {flavor && (
                <>
                  <span style={{ color: '#cbd5e1' }}>•</span>
                  <span style={{ color: '#0ea5e9', fontWeight: '800' }}>{flavor.name} Flavor</span>
                </>
              )}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div className="pc-price-container">
            {isFree ? (
              <span className="pc-price-free">FREE GIFT</span>
            ) : activeOffer ? (
              <div className="flex flex-col">
                <span className="pc-original-price">₹{basePrice.toLocaleString()}</span>
                <span className="pc-price-discounted">₹{Math.round(finalPrice).toLocaleString()}</span>
              </div>
            ) : (
              <div className="pc-price">₹{basePrice.toLocaleString()}</div>
            )}
          </div>

          {!isFree && (
            <div className="pc-controls">
              <button className="pc-btn" onClick={() => removeFromCart(id, size, flavorId)}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M20 12H4" /></svg>
              </button>
              <span className="pc-qty">{quantity}</span>
              <button
                className="pc-btn"
                onClick={() => quantity < stock && addToCart(id, size, flavorId)}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 4v16m8-8H4" /></svg>
              </button>
            </div>
          )}
          {isFree && (
            <div className="pc-controls" style={{ background: 'transparent' }}>
              <span className="pc-qty" style={{ color: '#10b981' }}>Qty: {quantity}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
