import React, { useState, useEffect, useContext } from 'react';
import { bubble as Menu } from "react-burger-menu";
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/shop-context';
import { getCategoriesShort } from '../util/APIUtils';
import "./sidebar.css";

export default function Sidebar() {
    const { products } = useContext(ShopContext);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await getCategoriesShort();
                // API likely returns { content: [...] } based on APIUtils.js
                const categoryList = res.content || res || [];
                setCategories(categoryList);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            }
        };
        fetchCategories();
    }, []);

    const getCategoryProductCount = (catTitle) => {
        if (!products) return 0;
        const activeProducts = products.filter(p => p.active !== false);
        return activeProducts.filter(p => (p.Category?.title === catTitle) || (p.category === catTitle)).length;
    };


    return (
        <Menu pageWrapId={"page-wrap"} outerContainerId={"navbar"} >
            <div id="sidebar-content">
                <div className="sidebar-section">
                    <h3 className="sidebar-title">Shop by Category</h3>
                    <ul className="sidebar-category-list">
                        <li className="sidebar-category-item">
                            <Link to="/products" className="sidebar-category-link">
                                <span className="category-name">All Products</span>
                                <span className="category-count">{products ? products.filter(p => p.active !== false).length : 0}</span>
                            </Link>
                        </li>
                        {categories.map(cat => (
                            <li key={cat.id} className="sidebar-category-item">
                                <Link to={`/products?category=${encodeURIComponent(cat.title)}`} className="sidebar-category-link">
                                    <span className="category-name">{cat.title}</span>
                                    <span className="category-count">{getCategoryProductCount(cat.title)}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="sidebar-section social-section">
                    <h3 className="sidebar-title">Connect with Us</h3>
                    <a href="https://hanleyhealthcare.com" id="so" className="social-link google">www.hanleyhealthcare.com</a>
                    <a href="https://www.facebook.com/hanleyhealthcare/" className="social-link facebook">
                        <i className="fa fa-facebook"></i> Facebook
                    </a>
                    <a href="#" className="social-link twitter">
                        <i className="fa fa-twitter"></i> Twitter
                    </a>
                    <a href="#" className="social-link google">
                        <i className="fa fa-google"></i> Google
                    </a>
                    <a href="#" className="social-link linkedin">
                        <i className="fa fa-linkedin"></i> LinkedIn
                    </a>
                    <a href="https://www.youtube.com/channel/UC-YbR20VcANUwhtWpr1hgCA/featured" className="social-link youtube">
                        <i className="fa fa-youtube"></i> Youtube Channel
                    </a>
                </div>
            </div>
        </Menu>
    )
}

