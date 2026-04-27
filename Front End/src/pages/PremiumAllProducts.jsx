import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PremiumCollectionCard from './PremiumCollectionCard';
import './PremiumAllProducts.css';
import { API_BASE_URL } from '../constants';
import { ShopContext } from '../context/shop-context';
import { useContext } from 'react';
import OnlineSupport from '../components/OnlineSupport';
import LinearProgress from '../common/LinearProgress';

const PremiumAllProducts = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const urlCategory = searchParams.get('category');
    const filter = searchParams.get('filter');

    const { products, categories: shopCategories } = useContext(ShopContext);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(urlCategory || 'All');
    const [sortBy, setSortBy] = useState('newest');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Update selectedCategory if URL changes
    useEffect(() => {
        if (urlCategory) {
            setSelectedCategory(urlCategory);
        } else {
            setSelectedCategory('All');
        }
    }, [urlCategory]);


    useEffect(() => {
        if (products && products.length > 0) {
            setIsLoading(false);
        }
    }, [products]);

    useEffect(() => {
        let categoryList = ['All'];
        if (shopCategories && shopCategories.length > 0) {
            const titles = shopCategories.map(cat => (typeof cat === 'string' ? cat : cat.title));
            categoryList = ['All', ...titles];
        }
        setCategories(categoryList);
    }, [shopCategories]);

    const getEffectivePrice = (product) => {
        if (product.price && product.price > 0) return product.price;
        if (product.productFlavors && product.productFlavors.length > 0) {
            const firstFlavor = product.productFlavors[0];
            return firstFlavor.price || firstFlavor.priceMedium || firstFlavor.priceLarge || 0;
        }
        return 0;
    };

    const comingSoonCount = useMemo(() => {
        return products.filter(p => p.active !== false && (p.comingSoon === true || p.comingSoon === 'true')).length;
    }, [products]);

    const filteredAndSortedProducts = useMemo(() => {
        let result = [...products];

        // Filter by text search
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                (p.title || "").toLowerCase().includes(query) ||
                (p.description || "").toLowerCase().includes(query) ||
                (p.brand || "").toLowerCase().includes(query)
            );
        }

        // Filter by Coming Soon URL param
        if (filter === 'comingSoon') {
            result = result.filter(p => p.comingSoon === true || p.comingSoon === 'true');
        } else if (selectedCategory !== 'All') {
            // Category filter only applies when not in comingSoon filter mode
            result = result.filter(p =>
                (p.Category?.title === selectedCategory) || (p.category === selectedCategory)
            );
        }

        // Filter active only
        result = result.filter(p => p.active !== false);

        // Sort products
        switch (sortBy) {
            case 'price-low':
                result.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
                break;
            case 'price-high':
                result.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
                break;
            case 'featured-first':
                result.sort((a, b) => (b.featured === true ? 1 : 0) - (a.featured === true ? 1 : 0));
                break;
            case 'bestseller-first':
                result.sort((a, b) => (b.bestseller === true ? 1 : 0) - (a.bestseller === true ? 1 : 0));
                break;
            case 'oldest':
                result.sort((a, b) => a.id - b.id);
                break;
            case 'alpha-a':
                result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
                break;
            case 'alpha-z':
                result.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
                break;
            case 'qty-asc':
                result.sort((a, b) => (a.stock || 0) - (b.stock || 0));
                break;
            case 'qty-desc':
                result.sort((a, b) => (b.stock || 0) - (a.stock || 0));
                break;
            case 'newest':
            default:
                result.sort((a, b) => b.id - a.id);
                break;
        }

        return result;
    }, [products, selectedCategory, sortBy, searchQuery, filter]);

    const getCategoryProductCount = (cat) => {
        const activeProducts = products.filter(p => p.active !== false);
        if (cat === 'All') return activeProducts.length;
        return activeProducts.filter(p => (p.Category?.title === cat) || (p.category === cat)).length;
    };

    if (error) {
        return (
            <div className="premium-loader-container">
                <p>Error: {error}</p>
                <Link to="/" className="premium-accent">Return Home</Link>
            </div>
        );
    }

    return (
        <div className="premium-all-products">
            <LinearProgress loading={isLoading} />
            <div className="premium-container">
                {/* Breadcrumbs */}
                <div className="premium-breadcrumbs">
                    <Link to="/">Home</Link>
                    <span className="separator">/</span>
                    <Link to="/products">All Products</Link>
                    {filter === 'comingSoon' && (
                        <>
                            <span className="separator">/</span>
                            <span className="current">Coming Soon</span>
                        </>
                    )}
                    {!filter && <span className="current" style={{ display: 'none' }}></span>}
                </div>

                {/* Page Header */}
                <header className="premium-page-header">
                    <div className="premium-header-content">
                        <h1 className="premium-page-title">
                            {filter === 'comingSoon' ? '✨ Coming Soon' : 'Shop All Collections'}
                        </h1>
                        {filter === 'comingSoon' && (
                            <p style={{ color: '#6366f1', fontWeight: 600, marginTop: 4 }}>
                                Exclusive products arriving soon — be the first to know!
                            </p>
                        )}
                        <div className="premium-search-wrapper">
                            <input
                                name='searchproducts'
                                type="text"
                                className="premium-search-input"
                                placeholder="Search products, brands, or collections..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button className="premium-clear-search" onClick={() => setSearchQuery('')}>×</button>
                            )}
                            <div className="premium-search-icon">🔍</div>
                        </div>
                    </div>

                    <div className="premium-mobile-filter-trigger" onClick={() => setIsSidebarOpen(true)}>
                        <span>Filters & Collections</span>
                        <div className="filter-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M1 14h6m2-6h6m2 8h6" />
                            </svg>
                        </div>
                    </div>
                </header>


                <div className="premium-content-wrapper">
                    {/* Sidebar Filters */}
                    <aside className={`premium-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                        <div className="premium-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
                        <div className="premium-sidebar-inner">
                            <div className="premium-sidebar-header">
                                <h3>Filters</h3>
                                <button className="premium-close-sidebar" onClick={() => setIsSidebarOpen(false)}>×</button>
                            </div>
                            <section className="premium-filter-section">
                                <h3 className="premium-filter-title">Collections</h3>
                                <ul className="premium-filter-list">
                                    {/* Coming Soon filter entry */}
                                    <li className="premium-filter-item">
                                        <span
                                            className={`premium-filter-link ${filter === 'comingSoon' ? 'active' : ''}`}
                                            onClick={() => { setSearchParams({ filter: 'comingSoon' }); setIsSidebarOpen(false); }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            ✨ Coming Soon
                                            <span className="premium-filter-count">{comingSoonCount}</span>
                                        </span>
                                    </li>
                                    {categories.map(cat => (
                                        <li key={cat} className="premium-filter-item">
                                            <span
                                                className={`premium-filter-link ${!filter && selectedCategory === cat ? 'active' : ''}`}
                                                onClick={() => {
                                                    setSearchParams(cat !== 'All' ? { category: cat } : {});
                                                    setSelectedCategory(cat);
                                                    setIsSidebarOpen(false);
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {cat}
                                                <span className="premium-filter-count">
                                                    {getCategoryProductCount(cat)}
                                                </span>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>
                    </aside>

                    {/* Main Products Grid */}
                    <main className="premium-products-main">
                        {/* Toolbar */}
                        <div className="premium-toolbar">
                            <p className="premium-product-count" style={{ margin: 0, fontWeight: "500", color: "#666" }}>
                                There are {filteredAndSortedProducts.length} results in total.
                            </p>
                            <div className="premium-sort-wrapper">
                                <span className="premium-text-muted" style={{ fontSize: '14px' }}>Sort By:</span>
                                <select
                                    className="premium-sort-select"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="newest">Newest Arrivals</option>
                                    <option value="oldest">Oldest Arrivals</option>
                                    <option value="alpha-a">Alphabetically: A-Z</option>
                                    <option value="alpha-z">Alphabetically: Z-A</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="qty-asc">Quantity: Low to High</option>
                                    <option value="qty-desc">Quantity: High to Low</option>
                                    <option value="featured-first">Featured First</option>
                                    <option value="bestseller-first">Bestsellers First</option>
                                </select>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="premium-loader-container">
                                <div className="premium-spinner"></div>
                                <p>Discovering Your Health Essentials...</p>
                            </div>
                        ) : (
                            <div className="premium-products-grid">
                                {filteredAndSortedProducts.map(product => (
                                    <PremiumCollectionCard
                                        key={product.id}
                                        product={product}
                                    />
                                ))}
                                {filteredAndSortedProducts.length === 0 && (
                                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 0' }}>
                                        <h2>No products found in this collection.</h2>
                                        <p className="premium-text-muted">Try selecting a different category or clearing filters.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
                <img src="/images/certifications.png" alt="Certifications" className="certifications-banner" />
                <OnlineSupport />
            </div>
        </div>
    );
};

export default PremiumAllProducts;
