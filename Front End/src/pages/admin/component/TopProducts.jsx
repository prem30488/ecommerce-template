import React from 'react';

const mockProducts = [
  { id: 1, name: 'Premium Wireless Headphones', category: 'Electronics', price: '$299.99', sales: 124, rating: 4.8, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80' },
  { id: 2, name: 'Minimalist Smart Watch', category: 'Accessories', price: '$199.00', sales: 98, rating: 4.6, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80' },
  { id: 3, name: 'Eco-friendly Water Bottle', category: 'Lifestyle', price: '$24.50', sales: 85, rating: 4.9, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=100&q=80' },
  { id: 4, name: 'Classic Aviator Sunglasses', category: 'Accessories', price: '$145.00', sales: 76, rating: 4.5, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=100&q=80' },
];

const TopProducts = () => {
  return (
    <div className="section-card">
      <div className="section-header">
        <h3 className="section-title">Top Selling Products</h3>
        <button className="btn-view-all">View All</button>
      </div>
      <div className="top-products-list">
        {mockProducts.map((product) => (
          <div className="product-item" key={product.id}>
            <div className="product-info">
              <h4 className="product-name">{product.name}</h4>
              <span className="product-category">{product.category}</span>
            </div>
            <div className="product-stats">
              <div className="product-price">{product.price}</div>
              <div className="product-sales">{product.sales} Sales</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProducts;
