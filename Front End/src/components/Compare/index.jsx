import React, { useContext } from 'react';
import './styles.css';
import { ShopContext } from "../../context/shop-context";
import { resolveImageUrl } from "../../util/imageUrl";
import { useNavigate } from "react-router-dom";
import Alert from 'react-s-alert';
import { FaTrash, FaShoppingCart, FaStar, FaChevronRight } from 'react-icons/fa';

export const Compare = () => {
    const { selectedItems, setSelectedItems, addToCart, removeFromCompare } = useContext(ShopContext);
    const navigate = useNavigate();

    const handleAddToCart = (product) => {
        // Default to small size and first flavor if available
        const flavorId = product.productFlavors?.[0]?.flavor_id || null;
        addToCart(product.id, 'S', flavorId);
        Alert.success(`${product.title.slice(0, 20)} added to cart!`);
    };

    const clearAll = () => {
        if (window.confirm("Are you sure you want to clear all compared products?")) {
            setSelectedItems([]);
        }
    };

    if (!selectedItems || selectedItems.length === 0) {
        return (
            <div className="premium-compare-container">
                <div className="compare-empty-wrapper">
                    <div className="compare-empty-card">
                        <div className="compare-empty-icon-wrap">
                            <svg className="compare-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002-2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h2 className="compare-empty-title">No Products to Compare</h2>
                        <p className="compare-empty-text">
                            Add products to your comparison list to see their features side-by-side and find your perfect match.
                        </p>
                        <button 
                            onClick={() => navigate('/search')}
                            className="compare-empty-btn"
                        >
                            Explore Products <FaChevronRight size={12} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const features = [
        { label: 'Price', key: 'price', render: (p) => {
            const firstFlavorPrice = p.productFlavors?.[0]?.price;
            const displayPrice = firstFlavorPrice || p.price || 0;
            return <span className="pc-price">₹{displayPrice.toLocaleString()}</span>;
        }},
        { label: 'Category', key: 'categories', render: (p) => <span className="pc-badge pc-badge-primary">{p.categories?.[0]?.title || p.Category?.title || 'Premium'}</span> },
        { label: 'Brand', key: 'brand', render: (p) => <span className="font-bold text-slate-700">{p.brand || 'Elite Selection'}</span> },
        { label: 'Rating', key: 'rating', render: (p) => (
            <div className="pc-rating-wrap">
                <div className="pc-stars">
                    {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < Math.floor(p.rating || 0) ? "text-amber-400" : "text-slate-200"} />
                    ))}
                </div>
                <span className="pc-rating-count">({p.reviews?.length || 0})</span>
            </div>
        )},
        { label: 'Availability', key: 'stock', render: (p) => <span className="pc-badge pc-badge-success">{p.stock > 0 ? 'In Stock' : 'Limited'}</span> },
        { label: 'Audience', key: 'audience', render: (p) => <span className="capitalize font-semibold text-slate-600">{p.audience || 'All'}</span> },
        { label: 'Form', key: 'form', render: (p) => <span className="pc-badge pc-badge-primary bg-purple-50 text-purple-600">{p.Form?.title || p.form || 'Premium'}</span> }
    ];

    return (
        <div className="premium-compare-container">
            <div className="compare-header">
                <h1 className="compare-title">Product Comparison</h1>
                <p className="compare-subtitle">Evaluate the finest details of our premium selections to make an informed decision for your health and wellness.</p>
                <button 
                    onClick={clearAll}
                    className="compare-clear-btn"
                >
                    <FaTrash size={12} /> Clear Comparison List
                </button>
            </div>

            <div className="compare-grid-wrapper no-scrollbar">
                <table className="compare-table">
                    <thead>
                        <tr>
                            <th className="compare-feature-col" style={{ background: 'transparent', border: 'none' }}></th>
                            {selectedItems.map((product) => (
                                <td key={product.id} className="compare-product-col p-0">
                                    <div className="pc-header-cell">
                                        <button 
                                            className="pc-remove-btn" 
                                            title="Remove product"
                                            onClick={() => removeFromCompare(product)}
                                        >
                                            ✕
                                        </button>
                                        <div className="pc-image-wrap">
                                            <img src={resolveImageUrl(product.image || product.img)} alt={product.title} />
                                        </div>
                                        <div className="pc-brand">{product.brand || 'Elite Selection'}</div>
                                        <h3 className="pc-title">{product.title}</h3>
                                    </div>
                                </td>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {features.map((feature, idx) => (
                            <tr key={idx} className="compare-row">
                                <th className="compare-feature-col">{feature.label}</th>
                                {selectedItems.map((product) => (
                                    <td key={product.id}>
                                        {feature.render(product)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th className="compare-feature-col" style={{ borderRadius: '0 0 0 24px' }}>Actions</th>
                            {selectedItems.map((product) => (
                                <td key={product.id} className="pc-footer-cell">
                                    <button 
                                        className="pc-add-cart flex items-center justify-center gap-2"
                                        onClick={() => handleAddToCart(product)}
                                    >
                                        <FaShoppingCart size={14} /> Add to Cart
                                    </button>
                                    <a 
                                        href={`/productDetails/${product.id}`} 
                                        className="pc-view-details"
                                        onClick={(e) => { e.preventDefault(); navigate(`/productDetails/${product.id}`); }}
                                    >
                                        View Full Details
                                    </a>
                                </td>
                            ))}
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default Compare;
