import React, { useState, useEffect, useMemo } from "react";
import PremiumCard from "../components/PremiumCard";
import { Link } from "react-router-dom";
import "./product.css";
import { API_BASE_URL } from "../constants";
import { ShopContext } from '../context/shop-context';
import { useContext } from 'react';
import OnlineSupport from "../components/OnlineSupport";
import { COMPANY_INFO } from '../constants/companyInfo';

const ProductKids = () => {
  const { products } = useContext(ShopContext);
  const [isLoading, setIsLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (products && products.length > 0) {
      setIsLoading(false);
    }
  }, [products]);

  const kidsProducts = useMemo(() => {
    return products.filter(prod =>
      typeof prod.audience === 'string' &&
      prod.audience.match(new RegExp("(?:^|,)" + "Kids" + "(?:,|$)")) &&
      prod.active !== false
    );
  }, [products]);

  if (isLoading)
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-[#fffcf9]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 mb-6 shadow-xl"></div>
        <p className="text-2xl font-black text-orange-900 tracking-widest uppercase">Curating Junior Catalog</p>
      </div>
    );

  if (err)
    return (
      <div className="h-screen flex flex-col justify-center items-center text-center px-4 bg-[#fffcf9]">
        <div className="text-orange-500 text-6xl mb-6 drop-shadow-lg">⚠️</div>
        <h2 className="text-3xl font-black mb-3 text-orange-950 uppercase tracking-tighter">System Error</h2>
        <p className="text-orange-700/60 mb-8 max-w-md mx-auto">{err}</p>
        <Link to="/" className="px-8 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-200/50 uppercase font-bold tracking-widest">
          Explore Home
        </Link>
      </div>
    );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fffbf5", paddingTop: "80px" }}>
      {/* Kids' Banner */}
      <div style={{ position: "relative", width: "100%", overflow: "hidden", marginBottom: "2rem", boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}>
        <img
          src="/images/banner_kids.png"
          alt="Kids' Collection"
          style={{ width: "100%", height: "400px", objectFit: "contain", objectPosition: "center", display: "block" }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, rgba(124,45,18,0.65) 0%, rgba(124,45,18,0.15) 60%, transparent 100%)",
          display: "flex", alignItems: "center", paddingLeft: "5%"
        }}>
          <div>
            <p style={{ color: "#fdba74", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Health &amp; Wellness</p>
            <h1 style={{ color: "#fff", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, margin: 0, letterSpacing: "-0.03em", lineHeight: 1.1 }}>Kids' Collection</h1>
            <p style={{ color: "#fed7aa", fontSize: "1rem", marginTop: "0.75rem", maxWidth: 420 }}>Safe, purity-first wellness for the next generation.</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20 translate-y-[-2rem] relative z-20">
        {/* Breadcrumb - Glassmorphism Style */}
        <div className="mb-3">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-xl px-6 py-2.5 rounded-2xl shadow-xl shadow-orange-100/50">
            <Link to="/" className="text-orange-600 hover:text-orange-500 font-bold text-sm transition-colors uppercase tracking-widest">Home </Link>
            <span className="text-orange-200">/</span>
            <span className="text-orange-600 font-black text-sm uppercase tracking-widest"> Junior Suite</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 pt-10">
          {kidsProducts.map((product, index) => (
            <div
              key={product.id}
              className="reveal-stagger"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="glow-card group transition-all duration-700">
                <PremiumCard product={product} />
              </div>
            </div>
          ))}
        </div>

        {/* Global Partnership Strip */}
        <img src="/images/certifications.png" alt={`Certifications - ${COMPANY_INFO.name}`} title={COMPANY_INFO.name} className="certifications-banner" />
      </div>
      <OnlineSupport />
    </div>
  );
};

export default ProductKids;
