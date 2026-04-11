import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { resolveImageUrl } from '../util/imageUrl';
import './SalesLandingPage.css';

const SalesLandingPage = () => {
    const { saleId } = useParams();
    const navigate = useNavigate();
    const [sale, setSale] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [pageSize] = useState(12);
    const [timeRemaining, setTimeRemaining] = useState('');

    const formatTimeRemaining = (endDate) => {
        const diff = new Date(endDate) - new Date();
        if (diff <= 0) {
            return '0m';
        }

        const minutes = Math.floor(diff / (1000 * 60));
        const days = Math.floor(minutes / (60 * 24));
        const hours = Math.floor((minutes % (60 * 24)) / 60);
        const mins = minutes % 60;

        const parts = [];
        if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
        if (hours > 0) parts.push(`${hours}h`);
        if (days === 0 && mins > 0) parts.push(`${mins}m`);

        return parts.join(' ') || '0m';
    };

    /**
     * Fetch sale details and products
     */
    useEffect(() => {
        const fetchSaleDetails = async () => {
            try {
                setLoading(true);

                // Fetch sale details
                const saleResponse = await fetch(`/api/sale/${saleId}`);
                const saleResult = await saleResponse.json();

                if (saleResult.success) {
                    setSale(saleResult.data);
                    setTimeRemaining(formatTimeRemaining(saleResult.data.endDate));

                    // Track view
                    await fetch(`/api/sale/${saleId}/analytics`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ event: 'view' }),
                    });
                }

                // Fetch products in sale
                const productsResponse = await fetch(
                    `/api/sale/${saleId}/products?page=${page}&size=${pageSize}`
                );
                const productsResult = await productsResponse.json();

                if (productsResult.success) {
                    setProducts(productsResult.data);
                }

                setError(null);
            } catch (err) {
                console.error('Error fetching sale details:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSaleDetails();
    }, [saleId, page, pageSize]);

    /**
     * Get discount display text
     */
    const getDiscountText = (discountType, discountValue) => {
        switch (discountType) {
            case 'PERCENTAGE':
                return `${discountValue}% OFF`;
            case 'FIXED_AMOUNT':
                return `$${discountValue} OFF`;
            case 'BOGO':
                return 'BUY 1 GET 1 FREE';
            case 'VOLUME':
                return 'BULK DISCOUNT';
            default:
                return 'SPECIAL OFFER';
        }
    };

    if (loading) {
        return (
            <div className="sales-page-loading">
                <div className="spinner"></div>
                <p>Loading sale details...</p>
            </div>
        );
    }

    if (error || !sale) {
        return (
            <div className="sales-page-error">
                <h2>Sale Not Found</h2>
                <p>{error || 'This sale is no longer available'}</p>
            </div>
        );
    }

    return (
        <div className="sales-landing-page">
            {/* Hero Section */}
            <div
                className="sales-hero-section"
                style={{
                    backgroundImage: sale.bannerImage
                        ? `url(${sale.bannerImage.startsWith('http') ? sale.bannerImage : resolveImageUrl(`/images/sales/${sale.bannerImage}`)})`
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
            >
                <div className="sales-hero-overlay"></div>
                <div className="sales-hero-content">
                    <div className="sales-hero-badge">{getDiscountText(sale.discountType, sale.discountValue)}</div>
                    <h1 className="sales-hero-title">{sale.name}</h1>
                    {sale.description && (
                        <p className="sales-hero-description">{sale.description}</p>
                    )}

                    <div className="sales-hero-countdown">
                        <div className="countdown-item">
                            <span className="countdown-icon">⏱️</span>
                            <span className="countdown-text">
                                <strong>{timeRemaining || '0m'}</strong> left
                            </span>
                        </div>
                        <div className="countdown-item">
                            <span className="countdown-icon">🎁</span>
                            <span className="countdown-text">
                                <strong>{products.length}</strong> Products
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div className="sales-products-section">
                <div className="container">
                    <h2 className="products-title">
                        Sale Products ({products.length} available)
                    </h2>

                    {products.length > 0 ? (
                        <div className="products-grid">
                            {products.map((product) => (
                                <div key={product.id} className="product-card">
                                    <div className="product-image-wrapper">
                                        <img
                                            src={product.img || '/images/default-product.png'}
                                            alt={product.title}
                                            className="product-image"
                                        />
                                        <div className="product-badge">
                                            {getDiscountText(
                                                product.saleInfo.discountType,
                                                product.saleInfo.discountValue
                                            )}
                                        </div>
                                        {product.saleInfo.daysRemaining > 0 && (
                                            <div className="product-countdown">
                                                {product.saleInfo.daysRemaining}d left
                                            </div>
                                        )}
                                    </div>

                                    <div className="product-info">
                                        <h3 className="product-title">{product.title}</h3>
                                        {product.rating && (
                                            <div className="product-rating">
                                                {'⭐'.repeat(Math.floor(product.rating))} (
                                                {product.rating})
                                            </div>
                                        )}
                                        <p className="product-brand">{product.brand}</p>

                                        <div className="product-stock">
                                            {product.stock > 0 ? (
                                                <span className="in-stock">✓ In Stock ({product.stock})</span>
                                            ) : (
                                                <span className="out-of-stock">Out of Stock</span>
                                            )}
                                        </div>

                                        <button
                                            className="product-button"
                                            onClick={() => navigate(`/productDetails/${product.id}`)}
                                        >
                                            View Details →
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-products">
                            <p>No products available in this sale at the moment</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesLandingPage;
