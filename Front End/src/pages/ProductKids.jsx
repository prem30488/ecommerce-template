import React, { useState, useEffect, useMemo } from "react";
import PremiumCard from "../components/PremiumCard";
import { Link } from "react-router-dom";
import "./product.css";
import { API_BASE_URL } from "../constants";
import { ShopContext } from '../context/shop-context';
import { useContext } from 'react';
import OnlineSupport from "../components/OnlineSupport";
import { COMPANY_INFO } from '../constants/companyInfo';
import Pagination from '../components/Pagination';
import LinearProgress from "../common/LinearProgress";

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

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const itemsPerPage = 5;

  const sortedProducts = useMemo(() => {
    let result = [...kidsProducts];
    const getEffectivePrice = (product) => {
      if (product.price && product.price > 0) return product.price;
      if (product.productFlavors && product.productFlavors.length > 0) {
        const firstFlavor = product.productFlavors[0];
        return firstFlavor.price || firstFlavor.priceMedium || firstFlavor.priceLarge || 0;
      }
      return 0;
    };
    switch (sortBy) {
      case 'price-low': result.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b)); break;
      case 'price-high': result.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a)); break;
      case 'featured-first': result.sort((a, b) => (b.featured === true ? 1 : 0) - (a.featured === true ? 1 : 0)); break;
      case 'bestseller-first': result.sort((a, b) => (b.bestseller === true ? 1 : 0) - (a.bestseller === true ? 1 : 0)); break;
      case 'oldest': result.sort((a, b) => a.id - b.id); break;
      case 'alpha-a': result.sort((a, b) => (a.title || "").localeCompare(b.title || "")); break;
      case 'alpha-z': result.sort((a, b) => (b.title || "").localeCompare(a.title || "")); break;
      case 'newest': default: result.sort((a, b) => b.id - a.id); break;
    }
    return result;
  }, [kidsProducts, sortBy]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProducts, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      <LinearProgress loading={isLoading} />
      {/* Kids' Banner */}
      <div style={{ position: "relative", width: "100%", overflow: "hidden", marginBottom: "2rem", boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}>
        <img
          src="/images/banner_kids.png"
          alt="Kids' Collection"
          style={{ width: "100%", height: "400px", objectFit: "cover", objectPosition: "center", display: "block" }}
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
        <nav className="premium-breadcrumbs" style={{ 
          background: "white", 
          padding: "10px 20px", 
          borderRadius: "12px", 
          width: "fit-content",
          boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
        }}>
          <Link to="/">Home</Link>
          <span className="premium-breadcrumb-separator">›</span>
          <span className="premium-breadcrumb-current">Kids' Collection</span>
        </nav>

        {/* Premium Toolbar with Theme Colors */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '16px', marginTop: '32px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ width: 'fit-content' }}>
            <Pagination
              totalItems={kidsProducts.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: 'fit-content' }}>
            <span style={{ fontSize: '14px', color: '#666', fontWeight: 600 }}>Sort By:</span>
            <select
              style={{
                padding: '10px 40px 10px 16px',
                border: '1px solid #eee',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#1a1a1a',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundColor: 'white',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = '#eee'}
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="oldest">Oldest Arrivals</option>
              <option value="alpha-a">Alphabetically: A-Z</option>
              <option value="alpha-z">Alphabetically: Z-A</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="featured-first">Featured First</option>
              <option value="bestseller-first">Bestsellers First</option>
            </select>
          </div>
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 pt-10">
          {paginatedProducts.map((product, index) => (
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

        <div style={{ marginTop: '48px', paddingTop: '24px', paddingBottom: '24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center' }}>
            <Pagination
              totalItems={kidsProducts.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
        </div>

        {/* Global Partnership Strip */}
        <img src="/images/certifications.png" alt={`Certifications - ${COMPANY_INFO.name}`} title={COMPANY_INFO.name} className="certifications-banner mt-12" />
      </div>
      <OnlineSupport />
    </div>
  );
};

export default ProductKids;
