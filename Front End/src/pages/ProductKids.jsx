import React, { useState, useEffect, useMemo } from "react";
import PremiumProductCard from "../components/PremiumProductCard";
import { Link } from "react-router-dom";
import "./product.css";
import { API_BASE_URL } from "../constants";
import OnlineSupport from "../components/OnlineSupport";

const ProductKids = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/product/getProducts?page=0&size=1000&sorted=true`);
        if (!res.ok) throw new Error("Oops! An error has occurred while fetching products");
        const json = await res.json();
        const productList = json.content || json || [];
        setProducts(productList);
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        setErr(err.message);
      }
    };
    getData();
  }, []);

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
      {/* Premium Multi-Layer Hero Section (Kids) */}
      <div className="relative overflow-hidden mb-16 shadow-2xl"
        style={{ background: "linear-gradient(135deg, #7c2d12 0%, #c2410c 100%)", padding: "8rem 2rem", textAlign: "center" }}>

        {/* Advanced Atmospheric FX */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.1),transparent_50%)]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]"></div>

        <div className="relative z-10 max-w-4xl mx-auto backdrop-blur-xl bg-white/5 p-16 rounded-[4.5rem] border border-white/10 shadow-inner">
          <div className="mb-6 inline-flex items-center gap-2.5 px-6 py-2 bg-orange-500 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-full shadow-2xl shadow-orange-500/40">
            <span className="animate-pulse">✦</span> Junior Excellence
          </div>
          <h1 style={{ fontSize: "4.5rem", fontWeight: "900", margin: "0 0 2rem 0", letterSpacing: "-0.05em", color: "white", lineHeight: "1.1" }}>
            Pure <span style={{ color: "#fb923c", textShadow: "0 0 30px rgba(249,115,22,0.3)" }}>Growth.</span>
          </h1>
          <p style={{ fontSize: "1.35rem", color: "#fed7aa", maxWidth: "800px", margin: "0 auto", lineHeight: "1.8", fontWeight: "400" }}>
            Safe, purity-first wellness tailored for the next generation. Discover handpicked favorites chosen for their performance and pediatric-grade excellence.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20 translate-y-[-2rem] relative z-20">
        {/* Breadcrumb - Glassmorphism Style */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-xl px-6 py-2.5 rounded-2xl shadow-xl shadow-orange-100/50">
            <Link to="/" className="text-orange-600 hover:text-orange-500 font-bold text-sm transition-colors uppercase tracking-widest">Home</Link>
            <span className="text-orange-200">/</span>
            <span className="text-orange-600 font-black text-sm uppercase tracking-widest">Junior Suite</span>
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

export default ProductKids;
