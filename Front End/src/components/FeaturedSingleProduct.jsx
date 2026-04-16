import { Link } from "react-router-dom";
import React, { useContext } from "react";
import { ShopContext } from "../context/shop-context";
import { useNavigate } from "react-router-dom";
import ImageCarousel from "../pages/productDetails/ImageCarousel";
import Alert from 'react-s-alert';
import WishlistIcon from "./WishlistIcon";
const FeaturedSingleProduct = ({ product }) => {
  const { id, title, stock, imageURLs } = product;
  const price = product.productFlavors?.[0]?.price || 0;
  const firstFlavorId = product.productFlavors?.[0]?.flavor_id;

  const categoryLabel = product.Category?.title || product.category || (product.categories?.length ? product.categories.map(c => c.title).join(', ') : 'Uncategorized');
  const formLabel = product.Form?.title || (product.form ? (typeof product.form === 'string' ? product.form : `Form #${product.form}`) : (product.formId ? `Form #${product.formId}` : 'No form'));

  const navigate = useNavigate();
  const { addToCart, cartItems } = useContext(ShopContext);

  const cartItemCount = Object.keys(cartItems).reduce((sum, key) => key.startsWith(`${id}_`) ? sum + cartItems[key] : sum, 0);
  return (
    <div className="frequent-card h-full flex flex-col group transition-all duration-500" style={{ minHeight: "520px" }}>
      <div className="frequent-card-content flex-grow flex flex-col justify-between p-6">
        <div>
          {/* Header & Meta */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="fbc-review-pill flex items-center gap-1.5 mb-2 bg-rose-50 border-rose-100 px-2 py-0.5 rounded-full">
                <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Featured</span>
              </div>
              <div className="frequent-card-brand">{product.brand || 'Premium Selection'}</div>
              <div className="frequent-card-meta">
                <span className="frequent-card-meta-item frequent-card-category">{categoryLabel}</span>
                <span className="frequent-card-meta-item frequent-card-form">{formLabel}</span>
              </div>
            </div>
            
            {/* Wishlist Integration */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <WishlistIcon productId={id} size="small" showText={false} />
            </div>
          </div>

          <h2 className="frequent-card-title text-xl mb-4 group-hover:text-rose-600 transition-colors">
            {title}
          </h2>

          {/* Featured Image / Carousel */}
          <div className="frequent-card-image mb-6 rounded-2xl overflow-hidden bg-slate-50 relative group-hover:shadow-lg transition-all duration-500">
            {imageURLs ? (
              <ImageCarousel
                id={id}
                title={title}
                className="product-image-slim"
                thumbs={false}
                imageList={imageURLs}
              />
            ) : (
               <div className="w-full h-48 flex items-center justify-center text-slate-300">No Image</div>
            )}
          </div>

          {/* Rating Section */}
          <div className="flex items-center gap-2 mb-6">
            <div className="fbc-stars-gold flex items-center">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-[12px] ${i < Math.floor(product.rating || 5) ? '' : 'opacity-20 text-slate-300'}`}>
                  ★
                </span>
              ))}
            </div>
            <span className="text-[11px] font-black text-slate-900">{product.rating || '5.0'}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">({product.reviews?.length || 24} Verified Reviews)</span>
          </div>

          {/* Expert Trust Snapshot */}
          <div className="flex gap-2 mb-6">
             <div className="fbc-trust-snapshot fbc-trust-faq flex-1 scale-90">
                <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[12px]">❓</span>
                    <span className="text-[8px] font-black text-sky-900 uppercase">Expert FAQ</span>
                </div>
                <p className="text-[7px] font-bold text-sky-600 uppercase tracking-tighter">Science Based</p>
             </div>
             <div className="fbc-trust-snapshot fbc-trust-reviews flex-1 scale-90">
                <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[12px]">✨</span>
                    <span className="text-[8px] font-black text-amber-900 uppercase">Verified</span>
                </div>
                <p className="text-[7px] font-bold text-amber-600 uppercase tracking-tighter">Quality Check</p>
             </div>
          </div>
        </div>

        {/* Footer: Price & CTA */}
        <div className="frequent-card-footer mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Price</span>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">₹{price}</span>
          </div>

          <div className="flex gap-2">
            <button 
              className="px-4 py-2 bg-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-colors"
              onClick={() => navigate("/productDetails/" + product.id)}
            >
              Details
            </button>
            <button 
              className="px-4 py-2 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-500 transition-colors shadow-lg shadow-rose-200"
              onClick={() => {
                addToCart(id, "S", firstFlavorId);
              }}
            >
              {cartItemCount > 0 ? `In Cart (${cartItemCount})` : "Add To Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedSingleProduct;
