import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboardProductAudience } from '../../../util/APIUtils';

const TopProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchDashboardProductAudience()
      .then(res => setProducts(res.topProducts || []))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="section-card">
      <div className="section-header">
        <h3 className="section-title">Top Selling Products</h3>
        <Link to="/productManagement" className="btn-view-all" style={{ textDecoration: 'none' }}>View All</Link>
      </div>
      <div className="top-products-list">
        {products.length > 0 ? (
          products.map((product) => (
            <div className="product-item" key={product.id}>
              <img 
                src={product.image || '/images/placeholder.png'} 
                alt={product.name} 
                style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', marginRight: '15px' }} 
              />
              <div className="product-info">
                <h4 className="product-name">{product.name}</h4>
                <span className="product-category">{product.category}</span>
              </div>
              <div className="product-stats">
                <div className="product-price">₹{Number(product.price || 0).toFixed(2)}</div>
                <div className="product-sales">{product.sales} Sales</div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted" style={{padding: '1rem'}}>No product performance data available</p>
        )}
      </div>
    </div>
  );
};

export default TopProducts;
