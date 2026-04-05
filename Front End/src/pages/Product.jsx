import React, { useState, useEffect, useMemo } from "react";
import PremiumProductCard from "../components/PremiumProductCard";
import { Link } from "react-router-dom";
import "./product.css";
import { API_BASE_URL } from "../constants";
import { ShopContext } from '../context/shop-context';
import { useContext } from 'react';
import OnlineSupport from "../components/OnlineSupport";

const Product = () => {
  const { products } = useContext(ShopContext);
  const [isLoading, setIsLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (products && products.length > 0) {
      setIsLoading(false);
    }
  }, [products]);

  const menProducts = useMemo(() => {
    return products.filter(prod =>
      typeof prod.audience === 'string' &&
      prod.audience.match(new RegExp("(?:^|,)" + "Men" + "(?:,|$)")) &&
      prod.active !== false
    );
  }, [products]);

  if (isLoading)
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-slate-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-sky-600 mb-6 shadow-xl"></div>
        <p className="text-2xl font-black text-slate-800 tracking-widest uppercase">Curating Men's Catalog</p>
      </div>
    );

  if (err)
    return (
      <div className="h-screen flex flex-col justify-center items-center text-center px-4 bg-slate-50">
        <div className="text-red-500 text-6xl mb-6 drop-shadow-lg">⚠️</div>
        <h2 className="text-3xl font-black mb-3 text-slate-900 uppercase">System Error</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">{err}</p>
        <Link to="/" className="px-8 py-3 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-all shadow-lg hover:shadow-sky-200/50 uppercase font-bold tracking-widest">
          Explore Home
        </Link>
      </div>
    );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", paddingTop: "80px" }}>
      {/* Premium Catalog Header (Men) */}
      <div className="relative overflow-hidden mb-16 shadow-2xl"
        style={{ background: "linear-gradient(135deg, #020617 0%, #0f172a 100%)", padding: "8rem 2rem", textAlign: "center" }}>

        {/* Advanced Atmospheric FX */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.08),transparent_50%)]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>

        <div className="relative z-10 max-w-4xl mx-auto backdrop-blur-xl bg-white/5 p-16 rounded-[4.5rem] border border-white/10 shadow-inner">
          <div className="mb-6 inline-flex items-center gap-2.5 px-6 py-2 bg-sky-500 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-full shadow-2xl shadow-sky-500/40">
            <span className="animate-pulse">✦</span> Curated Excellence
          </div>
          <h1 style={{ fontSize: "4.5rem", fontWeight: "900", margin: "0 0 2rem 0", letterSpacing: "-0.05em", color: "white", lineHeight: "1.1" }}>
            Maximum <span style={{ color: "#38bdf8", textShadow: "0 0 30px rgba(56,189,248,0.3)" }}>Precision.</span>
          </h1>
          <p style={{ fontSize: "1.35rem", color: "#94a3b8", maxWidth: "800px", margin: "0 auto", lineHeight: "1.8", fontWeight: "400" }}>
            The definitive masterclass in grooming and science-backed vitality. Precision-engineered solutions for the high-achiever who demands uncompromising results.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20 translate-y-[-2rem] relative z-20">
        {/* Breadcrumb - Glassmorphism Style */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-3 bg-white/70 backdrop-blur-xl px-6 py-2.5 rounded-2xl shadow-xl shadow-slate-200/50">
            <Link to="/" className="text-slate-400 hover:text-sky-500 font-bold text-sm transition-colors uppercase tracking-widest">Home</Link>
            <span className="text-slate-300">/</span>
            <span className="text-sky-500 font-black text-sm uppercase tracking-widest">Men's Suite</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 pt-10">
          {menProducts.map((product, index) => (
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

export default Product;
