// ProductSelector.js
import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../../context/shop-context';
import { WishlistContext } from '../../context/wishlist-context';
import WishlistIcon from '../../components/WishlistIcon';
import Alert from 'react-s-alert';
import axios from 'axios';
import { API_BASE_URL } from '../../constants';

const ProductSelector = ({ product, onFlavorChange }) => {
  const [selectedSize, setSelectedSize] = useState('M'); // Default size
  const [flavors, setFlavors] = useState([]);
  const [selectedFlavorId, setSelectedFlavorId] = useState(
    product.productFlavors?.[0]?.flavor_id || null
  );

  useEffect(() => {
    const fetchFlavors = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/flavor/getFlavors?size=1000`);
        setFlavors(res.data.content || []);
      } catch (err) {
        console.error('Error fetching flavors:', err);
      }
    };
    fetchFlavors();
  }, []);

  const handleFlavorChange = (id) => {
    setSelectedFlavorId(id);
    if (onFlavorChange) onFlavorChange(id);
  };

  const { id, stock } = product;
  const { addToCart, cartItems, martItems, lartItems, flavorCart } = useContext(ShopContext);
  const cartKey = selectedFlavorId ? `${id}_${selectedFlavorId}` : id;
  const cartItemCount = cartItems[cartKey] || 0;
  const martItemCount = martItems[cartKey] || 0;
  const lartItemCount = lartItems[cartKey] || 0;

  // Use the selected flavor data for pricing
  const activeFlavorData = product.productFlavors?.find(
    pf => String(pf.flavor_id) === String(selectedFlavorId)
  ) || product.productFlavors?.[0];

  const sizeOptions = [
    { id: 'S', label: 'Small', price: activeFlavorData?.price || 0, discount: 0 },
    { id: 'M', label: 'Medium', price: activeFlavorData?.priceMedium || 0, discount: 5 },
    { id: 'L', label: 'Large', price: activeFlavorData?.priceLarge || 0, discount: 10 },
  ].filter(s => s.price > 0);

  const handleSizeChange = (size) => {
    setSelectedSize(size);
  };

  const calculateSavings = () => {
    const currentSize = sizeOptions.find((option) => option.id === selectedSize);
    const largerSize = sizeOptions.find((option) => option.id !== selectedSize);

    const savings = currentSize.price - largerSize.price;
    return savings;
  };

  const isSizePopular = (size) => {
    // You can implement your own logic to determine popularity
    return size.id === 'M';
  };

  return (
    <div className="space-y-8">
      {/* Flavor Selection */}
      {flavors.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select Flavor</h3>
          <div className="flex flex-wrap gap-3">
            {/* Use product.productFlavors if present, else fall back to global flavors */}
          {(product.productFlavors?.length > 0 ? product.productFlavors.filter(pf => pf.Flavor) : flavors).map(item => {
            const f = item.Flavor || item;  // support both productFlavors and raw flavors
            const fId = item.flavor_id || item.id;
            return (
              <button
                key={fId}
                onClick={() => handleFlavorChange(fId)}
                className={`flex items-center gap-3 px-6 py-4 rounded-3xl border-2 transition-all duration-300 ${
                  selectedFlavorId === fId
                    ? 'border-sky-500 bg-sky-50 shadow-md scale-105'
                    : 'border-slate-100 bg-white hover:border-slate-300'
                }`}
              >
                <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-100 flex-shrink-0">
                  {f.image ? (
                    <img src={f.image.startsWith('http') ? f.image : `http://localhost:3000${f.image}`} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[8px] text-slate-300">N/A</div>
                  )}
                </div>
                <span className={`text-sm font-black ${selectedFlavorId === fId ? 'text-sky-600' : 'text-slate-600'}`}>
                  {f.name}
                </span>
              </button>
            );
          })}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Select Specification</h3>
        <div className="space-y-3">
          {sizeOptions.map((size) => (
            <div 
              key={size.id} 
              className={`p-5 rounded-3xl border-2 cursor-pointer transition-all duration-300 ${
                selectedSize === size.id ? 'border-sky-500 bg-sky-50/50 shadow-xl' : 'border-slate-100 hover:border-slate-200'
              }`}
              onClick={() => handleSizeChange(size.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedSize === size.id ? 'border-sky-500 bg-sky-500' : 'border-slate-300'}`}>
                    {selectedSize === size.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">{size.label}</span>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      {size.label === 'Small' ? product.unitSmall : size.label === 'Medium' ? product.unitMedium : product.unitLarge} {product.unit}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-slate-900">₹{size.price}</span>
                  {isSizePopular(size) && (
                    <span className="block text-[8px] font-black text-emerald-500 uppercase mt-1">Selling Fast</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 space-y-6">
        <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white text-xl">₹</div>
             <div>
               <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Total Savings</p>
               <p className="text-xl font-black text-emerald-900">₹{calculateSavings()}</p>
             </div>
          </div>
          <span className="text-[10px] font-black text-emerald-400 italic">Smart Choice!</span>
        </div>

        <div className="flex items-stretch gap-4">
          <button 
            className="flex-grow bg-slate-900 text-white hover:bg-sky-600 px-10 py-6 rounded-[2.5rem] font-bold shadow-2xl transition-all active:scale-95 group flex items-center justify-center gap-4"
            onClick={() => {
              if ((cartItemCount + martItemCount + lartItemCount) < stock) { 
                addToCart(id, selectedSize, selectedFlavorId); 
                Alert.success(`${product.title} (${selectedSize}) added to cart!`);
              } else {
                Alert.info('Item Out of stock!');
              }
            }}
          >
            ADD TO COLLECTION
            <span className="bg-white/10 px-3 py-1 rounded-full text-xs">
              {(() => {
                if (selectedSize === 'S') return cartItemCount;
                if (selectedSize === 'M') return martItemCount;
                return lartItemCount;
              })() || 0}
            </span>
          </button>

          <div className="flex items-center justify-center p-1 bg-white border-2 border-slate-100 rounded-full shadow-lg">
            <WishlistIcon
              productId={String(product.id)}
              size="large"
              showText={false}
              customStyle={{
                padding: '18px',
                borderRadius: '50px',
                background: 'transparent',
                border: 'none'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSelector;
