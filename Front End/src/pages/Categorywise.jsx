import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { API_BASE_URL } from "../constants";
import { ShopContext } from "../context/shop-context";
import { useContext } from "react";
import PremiumCollectionCard from "./PremiumCollectionCard";
import "./Categorywise.css";
import SEO from "../components/SEO";
import { COMPANY_INFO } from "../constants/companyInfo";
import LinearProgress from "../common/LinearProgress";


const Categorywise = () => {
  const { id } = useParams();
  const { products: allProducts, categories } = useContext(ShopContext);
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    try {
      if (allProducts && categories) {
        setIsLoading(true);
        const catId = Number(id);
        const cat = categories.find((c) => c.id === catId);
        setCategory(cat || null);

        const filtered = allProducts.filter((p) => p.Category?.id === catId || String(p.categoryId) === id);
        setProducts(filtered);
        setIsLoading(false);
      }
    } catch (e) {
      setErr(e.message);
      setIsLoading(false);
    }
  }, [id, allProducts, categories]);

  const activeProducts = useMemo(
    () => products.filter((p) => p.active !== false),
    [products]
  );

  const filteredProducts = useMemo(() => {
    let result = [...activeProducts];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          (p.title || "").toLowerCase().includes(q) ||
          (p.brand || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "alpha-a":
        result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      case "alpha-z":
        result.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        break;
      case "featured":
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      case "bestseller":
        result.sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0));
        break;
      case "oldest":
        result.sort((a, b) => a.id - b.id);
        break;
      case "qty-low":
        result.sort((a, b) => (a.stock || 0) - (b.stock || 0));
        break;
      case "qty-high":
        result.sort((a, b) => (b.stock || 0) - (a.stock || 0));
        break;
      default: // newest
        result.sort((a, b) => b.id - a.id);
    }
    return result;
  }, [activeProducts, sortBy, searchQuery]);

  /* ── Stats ── */
  const featuredCount = activeProducts.filter((p) => p.featured).length;
  const bestsellerCount = activeProducts.filter((p) => p.bestseller).length;
  const inStockCount = activeProducts.filter((p) => p.stock > 0).length;

  /* ── Skeletons ── */
  const Skeleton = () => (
    <div className="cw-skeleton-grid">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="cw-skeleton-card">
          <div className="cw-skeleton-img" />
          <div className="cw-skeleton-body">
            <div className="cw-skeleton-line short" />
            <div className="cw-skeleton-line" />
            <div className="cw-skeleton-line medium" />
          </div>
        </div>
      ))}
    </div>
  );

  if (err)
    return (
      <div className="cw-error-state">
        <div className="cw-error-icon">⚠️</div>
        <h2>Something went wrong</h2>
        <p>{err}</p>
        <Link to="/" className="cw-back-btn">← Return Home</Link>
      </div>
    );

  const productTitles = useMemo(
    () => filteredProducts.map((p) => p.title).join(", "),
    [filteredProducts]
  );

  return (
    <div className="cw-page">
      <LinearProgress loading={isLoading} />
      {category?.title && (
        <SEO
          title={category?.title + ` | ${COMPANY_INFO.name} | Category wise search`}
          description={category?.description || `Explore our premium selection of ${category?.title} products.`}
          keywords={`${category?.title}, ${productTitles}, ${COMPANY_INFO.name}, shopping`}
          imageUrl={category?.imageUrl || ""}
        />
      )}

      {/* ── Hero Banner ── */}
      <div className="cw-hero">
        {category?.imageUrl && (
          <div
            className="cw-hero-bg-overlay"
            style={{ backgroundImage: `url(${category.imageUrl})` }}
          />
        )}
        <div className="cw-hero-container">
          <div className="cw-hero-content">
            {/* Breadcrumb */}
            <nav className="cw-breadcrumb">
              <Link to="/">Home</Link>
              <span className="cw-sep">/</span>
              <Link to="/products">Shop</Link>
              <span className="cw-sep">/</span>
              <span className="cw-current">{category?.title || "Collection"}</span>
            </nav>
            <h1 className="cw-hero-title">
              {category?.title || "Product Collection"}
            </h1>
            {category?.description && (
              <p className="cw-hero-desc">{category.description}</p>
            )}

            {/* Stats row */}
            {!isLoading && (
              <div className="cw-stats-row">
                <div className="cw-stat">
                  <span className="cw-stat-num">{activeProducts.length}</span>
                  <span className="cw-stat-lbl">Products</span>
                </div>
                <div className="cw-stat-divider" />
                <div className="cw-stat">
                  <span className="cw-stat-num">{inStockCount}</span>
                  <span className="cw-stat-lbl">In Stock</span>
                </div>
                {featuredCount > 0 && (
                  <>
                    <div className="cw-stat-divider" />
                    <div className="cw-stat">
                      <span className="cw-stat-num">{featuredCount}</span>
                      <span className="cw-stat-lbl">Featured</span>
                    </div>
                  </>
                )}
                {bestsellerCount > 0 && (
                  <>
                    <div className="cw-stat-divider" />
                    <div className="cw-stat">
                      <span className="cw-stat-num">{bestsellerCount}</span>
                      <span className="cw-stat-lbl">Bestsellers</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {category?.imageUrl && (
            <div className="cw-hero-image-wrap">
              <div className="cw-hero-image-inner">
                <img src={category.imageUrl} alt={category.title} className="cw-hero-image" />
                <div className="cw-hero-image-glow" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="cw-container">
        {/* Toolbar */}
        <div className="cw-toolbar">
          <div className="cw-search-wrap">
            <span className="cw-search-icon">🔍</span>
            <input
              className="cw-search"
              type="text"
              placeholder="Search in this collection…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="cw-clear-search" onClick={() => setSearchQuery("")}>×</button>
            )}
          </div>

          <div className="cw-toolbar-right">
            <p className="cw-result-count">
              {isLoading ? "Loading…" : `${filteredProducts.length} result${filteredProducts.length !== 1 ? "s" : ""}`}
            </p>
            <div className="cw-sort-wrap">
              <span className="cw-sort-label">Sort:</span>
              <select
                className="cw-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="alpha-a">Alphabetically: A → Z</option>
                <option value="alpha-z">Alphabetically: Z → A</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="qty-low">Quantity: Low → High</option>
                <option value="qty-high">Quantity: High → Low</option>
                <option value="featured">Featured First</option>
                <option value="bestseller">Bestsellers First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <Skeleton />
        ) : filteredProducts.length === 0 ? (
          <div className="cw-empty-state">
            <div className="cw-empty-icon">🛍️</div>
            <h3>No products found</h3>
            <p>{searchQuery ? "Try a different search term." : "Check back soon for new arrivals."}</p>
            <Link to="/products" className="cw-back-btn">Browse All Products</Link>
          </div>
        ) : (
          <div className="cw-grid">
            {filteredProducts.map((product) => (
              <PremiumCollectionCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categorywise;
