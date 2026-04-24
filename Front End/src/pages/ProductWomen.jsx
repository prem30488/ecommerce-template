import React, { useState, useEffect, useMemo } from "react";
import PremiumCard from "../components/PremiumCard";
import { Link } from "react-router-dom";
import "./product.css";
import { API_BASE_URL } from "../constants";
import { ShopContext } from '../context/shop-context';
import { useContext } from 'react';
import OnlineSupport from "../components/OnlineSupport";
import { COMPANY_INFO } from '../constants/companyInfo';

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
      {/* Women's Banner */}
      <div style={{ position: "relative", width: "100%", overflow: "hidden", marginBottom: "2rem", boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}>
        <img
          src="/images/women.png"
          alt="Women's Collection"
          style={{ width: "100%", height: "400px", objectFit: "cover", objectPosition: "center", display: "block" }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, rgba(76,5,25,0.65) 0%, rgba(76,5,25,0.15) 60%, transparent 100%)",
          display: "flex", alignItems: "center", paddingLeft: "5%"
        }}>
          <div>
            <p style={{ color: "#f9a8d4", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Health &amp; Wellness</p>
            <h1 style={{ color: "#fff", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, margin: 0, letterSpacing: "-0.03em", lineHeight: 1.1 }}>Women's Collection</h1>
            <p style={{ color: "#fce7f3", fontSize: "1rem", marginTop: "0.75rem", maxWidth: 420 }}>Curated wellness designed for the modern woman.</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20 translate-y-[-2rem] relative z-20">
        {/* Breadcrumb - Glassmorphism Style */}
        <nav className="premium-breadcrumbs" style={{ 
          background: "white", 
          padding: "10px 20px", 
          borderRadius: "12px", 
          width: "fit-content",
          boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
        }}>
          <Link to="/">Home</Link>
          <span className="premium-breadcrumb-separator">›</span>
          <span className="premium-breadcrumb-current">Women's Collection</span>
        </nav>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 pt-10">
          {womenProducts.map((product, index) => (
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

export default ProductWomen;
