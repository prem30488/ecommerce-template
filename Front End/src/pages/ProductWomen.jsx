import React, { useState, useEffect, useMemo } from "react";
import PremiumProductCard from "../components/PremiumProductCard";
import { Link } from "react-router-dom";
import "./product.css";
import { API_BASE_URL } from "../constants";
import { ShopContext } from '../context/shop-context';
import { useContext } from 'react';
import OnlineSupport from "../components/OnlineSupport";

const ProductWomen = () => {
  const { products } = useContext(ShopContext);
  const [isLoading, setIsLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (products && products.length > 0) {
      setIsLoading(false);
    }
  }, [products]);

  const womenProducts = useMemo(() => {
    return products.filter(prod =>
      typeof prod.audience === 'string' &&
      prod.audience.match(new RegExp("(?:^|,)" + "Women" + "(?:,|$)")) &&
      prod.active !== false
    );
  }, [products]);

  if (isLoading)
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-[#fffafa]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500 mb-6 shadow-xl"></div>
        <p className="text-2xl font-black text-pink-900 tracking-widest uppercase">Curating Women's Catalog</p>
      </div>
    );

  if (err)
    return (
      <div className="h-screen flex flex-col justify-center items-center text-center px-4 bg-[#fffafa]">
        <div className="text-pink-500 text-6xl mb-6 drop-shadow-lg">⚠️</div>
        <h2 className="text-3xl font-black mb-3 text-pink-950 uppercase tracking-tighter">System Error</h2>
        <p className="text-pink-700/60 mb-8 max-w-md mx-auto">{err}</p>
        <Link to="/" className="px-8 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all shadow-lg hover:shadow-pink-200/50 uppercase font-bold tracking-widest">
          Explore Home
        </Link>
      </div>
    );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff5f5", paddingTop: "80px" }}>
      {/* Premium Multi-Layer Hero Section (Women) */}
      <div className="relative overflow-hidden mb-16 shadow-2xl"
        style={{ background: "linear-gradient(135deg, #4c0519 0%, #831843 100%)", padding: "8rem 2rem", textAlign: "center" }}>

        {/* Advanced Atmospheric FX */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.1),transparent_50%)]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-rose-500/10 rounded-full blur-[100px]"></div>

        <div className="relative z-10 max-w-4xl mx-auto backdrop-blur-xl bg-white/5 p-16 rounded-[4.5rem] border border-white/10 shadow-inner">
          <div className="mb-6 inline-flex items-center gap-2.5 px-6 py-2 bg-pink-500 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-full shadow-2xl shadow-pink-500/40">
            <span className="animate-pulse">✦</span> Elite Femininity
          </div>
          <h1 style={{ fontSize: "4.5rem", fontWeight: "900", margin: "0 0 2rem 0", letterSpacing: "-0.05em", color: "white", lineHeight: "1.1" }}>
            Feminine <span style={{ color: "#f472b6", textShadow: "0 0 30px rgba(236,72,153,0.3)" }}>Radiance.</span>
          </h1>
          <p style={{ fontSize: "1.35rem", color: "#f9a8d4", maxWidth: "800px", margin: "0 auto", lineHeight: "1.8", fontWeight: "400" }}>
            The perfect confluence of nature and biotechnology. Experience curated wellness solutions designed for the modern woman who values brilliance and inner harmony.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20 translate-y-[-2rem] relative z-20">
        {/* Breadcrumb - Glassmorphism Style */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-xl px-6 py-2.5 rounded-2xl shadow-xl shadow-pink-100/50">
            <Link to="/" className="text-pink-400 hover:text-pink-600 font-bold text-sm transition-colors uppercase tracking-widest">Home</Link>
            <span className="text-pink-200">/</span>
            <span className="text-pink-600 font-black text-sm uppercase tracking-widest">Women's Collection</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 pt-10">
          {womenProducts.map((product, index) => (
            <div
              key={product.id}
              className="reveal-stagger"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="glow-card group transition-all duration-700">
                <PremiumProductCard product={product} />
              </div>
            </div>
          ))}
        </div>

        {/* Global Partnership Strip */}
        <img src="/images/certifications.png" alt="Certifications" className="certifications-banner" />
      </div>
      <OnlineSupport />
    </div>
  );
};

export default ProductWomen;
