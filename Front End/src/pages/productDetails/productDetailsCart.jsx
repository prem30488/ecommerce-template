import React, { useContext, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import SimilarProducts from "../../components/SimilarProducts"
import "./productDetails.css";
import VerticalProductCarousel from './VerticalProductCarousel';
import ProductSelector from './ProductSelector';
import StarRating from './StarRating';
import FrequentlyBoughtCarousel from './FrequentlyBoughtCarousel';
import { findFrequentlyBoughtTogether } from './eclatAlgorithm';
import Alert from 'react-s-alert';

export const ProductDetailsCart = () => {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [frequentProducts, setFrequentProducts] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [selectedFlavorId, setSelectedFlavorId] = useState(null);

  const { id } = useParams();

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        // Fetch specific product with images from the improved route
        const res = await fetch(`http://localhost:3000/api/product/fetchById/${id}`);
        if (!res.ok) throw new Error("Oops! Product not found");
        const json = await res.json();
        setProduct(json);
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        setErr(err.message);
      }
    };
    getData();
  }, [id]);

  useEffect(() => {
    const fetchFrequent = async () => {
      if (!product) return;
      try {
        const res = await fetch("http://localhost:3000/api/product/getProducts?page=0&size=20");
        const json = await res.json();
        const allProducts = (json.content || json);

        // Use Eclat algorithm to find frequently bought together items
        const eclatRecommendations = findFrequentlyBoughtTogether(product, allProducts);

        // Fallback to random selection if Eclat doesn't return enough items
        if (eclatRecommendations.length < 3) {
          const remainingProducts = allProducts.filter(p => p.id !== product.id && !eclatRecommendations.find(r => r.id === p.id));
          const randomItems = remainingProducts.sort(() => 0.5 - Math.random()).slice(0, 3 - eclatRecommendations.length);
          eclatRecommendations.push(...randomItems);
        }

        setFrequentProducts(eclatRecommendations.slice(0, 4));
      } catch (e) {
        console.error(e);
        // Fallback to simple random selection
        try {
          const res = await fetch("http://localhost:3000/api/product/getProducts?page=0&size=10");
          const json = await res.json();
          const items = (json.content || json).filter(p => p.id !== product.id).sort(() => 0.5 - Math.random()).slice(0, 4);
          setFrequentProducts(items);
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }
    }
    fetchFrequent();
  }, [product?.id]);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/faq?productId=${id}`);
        const json = await res.json();
        setFaqs(json.content || []);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      }
    };
    if (id) {
      fetchFaqs();
    }
  }, [id]);

  if (isLoading)
    return (
      <div className="h-screen flex flex-col justify-center items-center">
        <div className="w-16 h-16 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-bold">Loading product details...</p>
      </div>
    );

  if (err || !product)
    return (
      <div className="h-screen flex flex-col justify-center items-center text-center px-4">
        <h2 className="text-2xl font-bold text-slate-800">{err || "Product not found"}</h2>
        <Link to="/product" className="mt-6 px-8 py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition-colors">
          &larr; Back to Products
        </Link>
      </div>
    );

  const { title, description, price, rating, ProductImages, img } = product;

  return (
    <React.Fragment>
      <div className="bg-slate-50/30">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-10 py-12 md:py-24">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-stretch">
            {/* LEFT SIDE: CAROUSEL (60%) */}
            <div className="w-full lg:w-[60%] flex-shrink-0">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-6 md:p-8 transition-all duration-700 hover:shadow-sky-200/20">
                <VerticalProductCarousel
                  id={id}
                  title={title}
                  mainImage={img}
                  additionalImages={ProductImages}
                  selectedFlavorId={selectedFlavorId}
                />

                {/* Price and Rating Area */}
                <div className="flex flex-col sm:flex-row items-center justify-between mt-12 p-8 bg-slate-50/50 backdrop-blur-sm rounded-[2.5rem] border border-slate-100 gap-8">
                  <div>
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">Premium Product</span>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter">
                        {price}
                      </span>
                      <span className="text-2xl font-black text-sky-500">INR</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 px-8 py-6 bg-white rounded-3xl border border-slate-100 shadow-sm transition-transform hover:scale-105 duration-300">
                    <div className="flex flex-col items-center">
                      <span className="text-slate-900 font-black text-2xl leading-none">{rating || 4.5}</span>
                      <span className="text-slate-400 text-[9px] uppercase font-black mt-2 tracking-widest">Score</span>
                    </div>
                    <div className="h-10 w-[1.5px] bg-slate-100" />
                    <StarRating rating={rating || 4.5} />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: DETAILS (40%) */}
            <div className="w-full lg:w-[40%] flex flex-col">
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-50 shadow-2xl shadow-slate-200/40 min-h-full flex flex-col transition-all duration-700 hover:shadow-sky-200/30">
                <div className="space-y-10 flex-grow">
                  {/* Product Title */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                      <span className="text-sky-500 text-[11px] font-black uppercase tracking-widest">In Stock & Ready to Ship</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
                      {title}
                    </h1>
                  </div>

                  {/* Shipping Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center bg-emerald-500 text-white rounded-full text-xs shadow-md shadow-emerald-200">✓</div>
                      <span className="text-emerald-900 text-[13px] font-bold">Free Shipping</span>
                    </div>
                    <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100/50 flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center bg-sky-500 text-white rounded-full text-xs shadow-md shadow-sky-200">✓</div>
                      <span className="text-sky-900 text-[13px] font-bold">Express Delivery</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-slate-50/40 p-6 rounded-3xl border border-slate-100/50">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Manufacturer Notes</h3>
                    <p className="text-slate-700 leading-relaxed text-[15px] italic">"{description}"</p>
                  </div>

                  {/* Product Selector (Buttons & Options) */}
                  <div className="pt-4">
                    <ProductSelector
                      product={product}
                      onFlavorChange={setSelectedFlavorId}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BELOW THE FOLD: BUNDLES */}
          {frequentProducts.length > 0 && (
            <div className="mt-24 lg:mt-32">
              <h2 className="text-4xl font-black text-slate-850 mb-12 flex items-center gap-6">
                Complete Your Stack
                <div className="flex-grow h-[2px] bg-slate-100 rounded-full" />
              </h2>
              <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200/30 border border-slate-50 transition-all hover:scale-[1.01] duration-500">
                <FrequentlyBoughtCarousel
                  currentProduct={product}
                  frequentProducts={frequentProducts}
                />
                <div className="mt-12 pt-10 border-t border-slate-100 text-center flex flex-col items-center">
                  <span className="text-slate-400 text-xs font-black uppercase tracking-[0.25em] mb-4">Combo Value Price</span>
                  <p className="text-5xl md:text-6xl font-black text-sky-600 mb-10 tracking-tighter">
                    ${(Number(product.price) + frequentProducts.reduce((sum, p) => sum + Number(p.price), 0)).toFixed(2)}
                  </p>
                  <button className="bg-slate-900 hover:bg-sky-600 text-white px-16 py-6 rounded-[2rem] font-black shadow-[0_20px_40px_rgba(14,165,233,0.2)] transition-all duration-500 hover:scale-105 active:scale-95 group flex items-center gap-4">
                    ADD BUNDLE TO COLLECTION
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FAQS */}
          {faqs.length > 0 && (
            <div className="mt-24 lg:mt-32">
              <h2 className="text-4xl font-black text-slate-850 mb-12 flex items-center gap-6">
                Frequently Asked Questions
                <div className="flex-grow h-[2px] bg-slate-100 rounded-full" />
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {faqs.filter(faq => faq.isActive).map(faq => (
                  <div key={faq.id} className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/20 border border-slate-50 transition-all hover:scale-[1.02] hover:shadow-sky-100 duration-500">
                    <h3 className="font-extrabold text-xl text-slate-800 mb-4 leading-tight">{faq.question}</h3>
                    <div className="w-8 h-1 bg-sky-500 rounded-full mb-6"></div>
                    <p className="text-slate-600 leading-relaxed text-[15px]">{faq.answer}</p>
                    {faq.askedBy && (
                      <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                          {faq.askedBy.charAt(0)}
                        </div>
                        <span className="text-[11px] text-slate-400 font-black tracking-widest uppercase">
                          Question by <span className="text-sky-600">{faq.askedBy}</span>
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SIMILAR PRODUCTS */}
          <div className="mt-24 lg:mt-32 pt-20 border-t border-slate-100">
            <SimilarProducts productCat={product} />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ProductDetailsCart;
