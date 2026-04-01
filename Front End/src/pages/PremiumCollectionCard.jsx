import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from 'react-s-alert';
import { ShopContext } from '../context/shop-context';
import './PremiumCollectionCard.css';

const PremiumCollectionCard = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart } = useContext(ShopContext);

    if (!product) return null;

    // Handle pricing logic: check flavors if main price is 0 or null
    let basePrice = product.price ? parseFloat(product.price) : 0;
    
    if (basePrice === 0 && product.productFlavors && product.productFlavors.length > 0) {
        const firstFlavor = product.productFlavors[0];
        // Use the first available numeric price from the flavor
        basePrice = parseFloat(firstFlavor.price) || 
                    parseFloat(firstFlavor.priceMedium) || 
                    parseFloat(firstFlavor.priceLarge) || 0;
    }

    const activeOffer = product.offers?.find(o => o.active && o.discount > 0);
    
    let finalPrice = basePrice;
    let discountInfo = null;

    if (activeOffer) {
        if (activeOffer.type === 2) {
            finalPrice = Math.max(0, basePrice - activeOffer.discount);
            discountInfo = `₹${activeOffer.discount} OFF`;
        } else {
            finalPrice = basePrice * (1 - activeOffer.discount / 100);
            discountInfo = `${activeOffer.discount}% OFF`;
        }
    }

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const flavorId = (product.productFlavors && product.productFlavors.length > 0) 
            ? product.productFlavors[0].flavor_id 
            : null;

        addToCart(product.id, 'S', flavorId); // default size (S) and first flavor
        Alert.success(`${(product.title || '').slice(0, 20)} added to cart!`);
    };

    const handleQuickView = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/productDetails/${product.id}`);
    };

    return (
        <div className="collection-card" onClick={() => navigate(`/productDetails/${product.id}`)}>
            <div className="card-image-wrapper">
                <div className="card-badge-container">
                    {product.isNew && <span className="card-status-badge">New</span>}
                    {product.bestseller && <span className="card-status-badge bestseller">Bestseller</span>}
                    {product.featured && <span className="card-status-badge featured">Featured</span>}
                </div>
                {discountInfo && <span className="card-discount-badge">{discountInfo}</span>}
                
                <img 
                    src={product.img || (product.ProductImages?.[0]?.imageUrl) || 'https://placehold.co/600x600?text=Product'} 
                    alt={product.title} 
                    className="card-image"
                    loading="lazy"
                />

                <div className="card-overlay">
                    <button className="overlay-btn overlay-btn-primary" onClick={handleAddToCart}>
                        Add to Cart
                    </button>
                    <button className="overlay-btn overlay-btn-secondary" onClick={handleQuickView}>
                        View Details
                    </button>
                </div>
            </div>

            <div className="card-content">
                <div className="card-brand">{product.brand || 'Elite Healthcare'}</div>
                <h3 className="card-title">{product.title}</h3>
                <div className="card-price-row">
                    <span className="card-final-price">₹{Math.round(finalPrice).toLocaleString()}</span>
                    {discountInfo && (
                        <span className="card-original-price">₹{basePrice.toLocaleString()}</span>
                    )}
                </div>
                <div className="card-stock-status">
                    {product.stock > 0 ? (
                        <span className="in-stock">In Stock ({product.stock})</span>
                    ) : (
                        <span className="out-of-stock">Out of Stock</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PremiumCollectionCard;
