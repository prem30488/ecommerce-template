import React, { useContext } from 'react';
import { ShopContext } from '../context/shop-context';
import { Link } from 'react-router-dom';
import './OurServices.css';
import { MdArrowForward } from 'react-icons/md';

const OurServices = () => {
    const { categories } = useContext(ShopContext);

    // Filter for active/meaningful categories and limit to top ones if needed
    const activeCategories = (categories || []).filter(cat => cat.enabled !== false);//.slice(0, 11);

    if (!activeCategories || activeCategories.length === 0) return null;

    return (
        <section className="services-section" id="service-sec">
            <div className="services-container">
                <div className="services-header">
                    <span className="services-sub">What We Offer</span>
                    <h2 className="services-title">OUR SERVICES</h2>
                    <div className="title-underline"></div>
                </div>

                <div className="services-grid">
                    {activeCategories.map((category) => (
                        <div className="service-card" key={category.id}>
                            <div className="service-icon-wrapper">
                                <img
                                    src={category.imageUrl || '/images/placeholder.png'}
                                    alt={category.title}
                                    onError={(e) => { e.target.src = '/images/placeholder.png'; }}
                                />
                                <div className="icon-overlay"></div>
                            </div>
                            <div className="service-info">
                                <h3 className="service-name">{category?.title || 'Quality Service'}</h3>
                                <p className="service-desc">
                                    {category?.description || `Premium quality ${(category?.name || 'Healthcare')?.toLowerCase()} products manufactured with international standards.`}
                                </p>
                                <Link to={`/byCategory/${category.id}`} className="service-link">
                                    Read More <MdArrowForward />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default OurServices;
