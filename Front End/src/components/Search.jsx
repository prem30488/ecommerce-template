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
            const title = (product.title || "").toLowerCase();
            const description = (product.description || "").toLowerCase();
            const brand = (product.brand || "").toLowerCase();
            const audience = (product.audience || "").toLowerCase();

            const hasCategoryMatch = product.categories?.some(cat => {
                const catTitle = typeof cat === 'string' ? cat.toLowerCase() : (cat.title || "").toLowerCase();
                return catTitle.includes(searchQuery);
            });

            const rawCategory = (product.category || "").toLowerCase();

            return title.includes(searchQuery) ||
                description.includes(searchQuery) ||
                brand.includes(searchQuery) ||
                audience.includes(searchQuery) ||
                rawCategory.includes(searchQuery) ||
                hasCategoryMatch;
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
            <div className="search-page">
                <div className="search-loading">
                    <div className="loader-sparkle"></div>
                    <p className="search-subtitle">Searching boutique collection...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="search-page">
            <div className="search-container">
                {/* Search Bar Section - TOP */}
                <div className="search-input-section">
                    <nav className="search-breadcrumbs">
                        <Link to="/">Home</Link>
                        <span>/</span>
                        <span className="active">Search results</span>
                    </nav>
                    <h1 className="search-page-title">Refine Your Selection</h1>
                    <form onSubmit={handleSearchSubmit} className="search-form-premium">
                        <div className="premium-input-wrapper">
                            <span className="search-icon-fixed">🔍</span>
                            <input
                                type="text"
                                className="premium-search-input"
                                placeholder="Search for premium products, brands, or categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button type="submit" className="premium-search-btn">
                                Search
                            </button>
                        </div>
                    </form>
                </div>

                {/* Results Section - BOTTOM */}
                <div className="search-results-section">
                    <header className="results-header">
                        <div className="results-info">
                            <h2 className="results-found-text">
                                {filteredProducts.length > 0 ? (
                                    <>Showing results for <span className="query-highlight">"{urlQuery}"</span></>
                                ) : (
                                    <>No results found for <span className="query-highlight-err">"{urlQuery}"</span></>
                                )}
                            </h2>
                            <p className="results-count">
                                {filteredProducts.length} {filteredProducts.length === 1 ? 'masterpiece' : 'masterpieces'} identified
                            </p>
                        </div>
                    </header>

                    {filteredProducts.length > 0 ? (
                        <div className="search-results-grid">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="search-item-animate">
                                    <PremiumProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-results-container">
                            <span className="no-results-icon">🍃</span>
                            <h2 className="no-results-title">Our collection is quietly awaiting your next discovery</h2>
                            <p className="no-results-text">
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
