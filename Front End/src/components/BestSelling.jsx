import { useState, useEffect, useContext, useMemo } from "react";
import PremiumCard from "../components/PremiumCard";
import BestSellingCarousel from "../components/BestSellingCarousel";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/shop-context";
import React from "react";
import SEO from "../components/SEO";
import { COMPANY_INFO } from "../constants/companyInfo";
import Pagination from "../components/Pagination";

const BestSelling = () => {

  const { products, categories } = useContext(ShopContext);

  const [isLoading, setIsLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (products && products.length > 0) {
      setIsLoading(false);
    }
  }, [products]);

  const bestSellers = useMemo(() => {
    return products ? products.filter(p => p.bestseller && p.active) : [];
  }, [products]);

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const itemsPerPage = 5;

  const sortedProducts = useMemo(() => {
    let result = [...bestSellers];
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
  }, [bestSellers, sortBy]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProducts, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const allTitles = useMemo(() => bestSellers.map(p => p.title).join(", "), [bestSellers]);
  const allCategories = useMemo(() => [...new Set(categories
    ?.filter(cat => bestSellers.some(p =>
      String(p.catIds).split(',').map(Number).includes(cat.id) || p.category_id === cat.id
    ))
    .map(cat => cat.title)
  )].join(", "), [categories, bestSellers]);

  if (isLoading)
    return (
      <p className="h-screen flex flex-col justify-center items-center text-2xl">
        Loading...
      </p>
    );
  if (err)
    return (
      <p className="h-screen flex flex-col justify-center items-center text-2xl">
        <span>{err}</span>
        <Link to="/bestsellers" className="text-lg text-gray-500 font-semibold">
          &larr; Refresh page
        </Link>
      </p>
    );

  return (
    <div className="container mx-auto pb-20">
      <SEO
        title="Bestselling Products"
        description={`Discover our top-rated collection featuring: ${allTitles.substring(0, 150)}...`}
        keywords={`${allTitles}, ${allCategories}, ${COMPANY_INFO.name}, bestsellers`}
      />
      <div style={{ position: "relative", paddingTop: "20px" }}></div>

      <div className="flex justify-between gap-10">
        <div className="w-full">
          <nav className="premium-breadcrumbs" style={{ 
            background: "white", 
            padding: "10px 20px", 
            borderRadius: "12px", 
            width: "fit-content",
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
            marginBottom: "24px"
          }}>
            <Link to="/">Home</Link>
            <span className="premium-breadcrumb-separator mx-2">›</span>
            <span className="premium-breadcrumb-current font-medium">Best Sellers</span>
          </nav>

          <BestSellingCarousel />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '16px', marginTop: '32px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: 'fit-content' }}>
              <Pagination
                totalItems={bestSellers.length}
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
            {paginatedProducts.map((product) => (
              <PremiumCard key={product.id} product={product} />
            ))}
          </div>

          <div style={{ marginTop: '48px', paddingTop: '24px', paddingBottom: '24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center' }}>
              <Pagination
                totalItems={bestSellers.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
          </div>

        </div>
      </div>
    </div>
  );
};

export default BestSelling;
