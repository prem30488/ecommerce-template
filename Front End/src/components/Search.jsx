import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/shop-context";
import PremiumProductCard from "../components/PremiumProductCard";
import "./Search.css";

const Search = () => {
    const { query: urlQuery } = useParams();
    const navigate = useNavigate();
    const { products } = useContext(ShopContext);
    const [searchTerm, setSearchTerm] = useState(urlQuery || "");
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (products && products.length > 0) {
            performSearch(urlQuery);
        } else {
            setIsLoading(true);
        }
    }, [urlQuery, products]);

    const performSearch = (q) => {
        const searchQuery = (q || "").toLowerCase().trim();
        if (!searchQuery) {
            setFilteredProducts([]);
            setIsLoading(false);
            return;
        }

        const results = products.filter(product => {
            const searchQuery = (q || "").toLowerCase().trim();
            const title = (product.title || "").toLowerCase();
            const description = (product.description || "").toLowerCase();
            const brand = (product.brand || "").toLowerCase();
            const audience = (product.audience || "").toLowerCase();

            // Extract Form Label for searching
            const formLabel = (
                product.Form?.title || 
                (typeof product.form === 'string' ? product.form : '') ||
                (product.form && typeof product.form !== 'object' ? `Form #${product.form}` : '')
            ).toLowerCase();

            // Aggregate ALL possible category strings for this product
            const categoryKeys = new Set();
            
            // 1. From Category object
            if (product.Category?.title) categoryKeys.add(product.Category.title.toLowerCase());
            
            // 2. From raw category string
            if (product.category) {
                String(product.category).split(',').forEach(c => categoryKeys.add(c.trim().toLowerCase()));
            }
            
            // 3. From categories array
            if (Array.isArray(product.categories)) {
                product.categories.forEach(c => {
                    const cTitle = typeof c === 'string' ? c : (c.title || String(c));
                    categoryKeys.add(cTitle.toLowerCase());
                });
            }

            const allCategoriesStr = Array.from(categoryKeys).join(' ');
            const hasCategoryMatch = Array.from(categoryKeys).some(cat => cat.includes(searchQuery) || searchQuery.includes(cat));

            // Token based matching check (Optional but robust: check if all query words are present somewhere)
            const queryWords = searchQuery.split(/\s+/);
            const searchableBlob = `${title} ${description} ${brand} ${formLabel} ${allCategoriesStr} ${audience}`.toLowerCase();
            const matchesAllWords = queryWords.every(word => searchableBlob.includes(word));

            return title.includes(searchQuery) ||
                allCategoriesStr.includes(searchQuery) ||
                hasCategoryMatch ||
                matchesAllWords;
        });

        setFilteredProducts(results);
        setIsLoading(false);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/Search/${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    if (isLoading) {
        return (
            <div className="psr-search-page">
                <div className="psr-search-loading">
                    <div className="psr-loader-sparkle"></div>
                    <p className="psr-search-subtitle">Searching boutique collection...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="psr-search-page">
            <div className="psr-search-container">
                {/* Search Bar Section - TOP */}
                <div className="psr-search-input-section">
                    <nav className="premium-breadcrumbs" style={{
                        background: "white",
                        padding: "10px 20px",
                        borderRadius: "12px",
                        width: "fit-content",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                        margin: "0 auto 20px"
                    }}>
                        <Link to="/">Home</Link>
                        <span className="premium-breadcrumb-separator">›</span>
                        <span className="premium-breadcrumb-current">Search results</span>
                    </nav>
                    <h1 className="psr-search-page-title">Refine Your Selection</h1>
                    <form onSubmit={handleSearchSubmit} className="psr-search-form-premium">
                        <div className="psr-premium-input-wrapper">
                            <span className="psr-search-icon-fixed">🔍</span>
                            <input
                                type="text"
                                className="psr-premium-search-input"
                                placeholder="Search products by name, category, brand, or form..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button type="submit" className="psr-premium-search-btn">
                                Search
                            </button>
                        </div>
                    </form>
                </div>

                {/* Results Section - BOTTOM */}
                <div className="psr-search-results-section">
                    <header className="psr-results-header">
                        <div className="psr-results-info">
                            <h2 className="psr-results-found-text">
                                {filteredProducts.length > 0 ? (
                                    <>Showing results for <span className="psr-query-highlight">"{urlQuery}"</span></>
                                ) : (
                                    <>No results found for <span className="psr-query-highlight-err">"{urlQuery}"</span></>
                                )}
                            </h2>
                            <p className="psr-results-count">
                                {filteredProducts.length} {filteredProducts.length === 1 ? 'masterpiece' : 'masterpieces'} identified
                            </p>
                        </div>
                    </header>

                    {filteredProducts.length > 0 ? (
                        <div className="psr-search-results-grid">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="psr-search-item-animate">
                                    <PremiumProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="psr-no-results-container">
                            <span className="psr-no-results-icon">🍃</span>
                            <h2 className="psr-no-results-title">Our collection is quietly awaiting your next discovery</h2>
                            <p className="psr-no-results-text">
                                We couldn't find matches for "{urlQuery}". Try broader terms or check our curated bestsellers.
                            </p>
                            <Link to="/products" className="back-btn">
                                Browse Collection
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Search;
