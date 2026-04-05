import React, { useState, useEffect, useContext } from "react";
import { API_BASE_URL } from '../constants/index.jsx';
import { Link } from "react-router-dom";
import { ShopContext } from "../context/shop-context";

const MegaMenu = ({ isOpen, onClose }) => {

  const { categories } = useContext(ShopContext);

  return (
    <div className={`menudropdown-content${isOpen ? ' show' : ''}`}>
      <div className="menuheader">
        <h2>Shop By Category</h2>
      </div>
      <div className="menurow">
        <div className="menucolumn">
          <h3>Wellness & Beauty</h3>
          <div className="category-list">
            {
              categories && categories
                .filter(cat => cat.type === 1)
                .map(cat => (
                  <Link key={cat.id} to={`/byCategory/${cat.id}`} onClick={onClose}>{cat.title}</Link>
                ))
            }
          </div>
        </div>
        <div className="menucolumn">
          <h3>Explore By Need</h3>
          <div className="category-list">
            {
              categories && categories
                .filter(cat => cat.type === 2)
                .map(cat => (
                  <Link key={cat.id} to={`/byCategory/${cat.id}`} onClick={onClose}>{cat.title}</Link>
                ))
            }
          </div>
        </div>
        <div className="menucolumn">
          <h3>Explore By Ingradient</h3>
          <div className="category-list">
            {
              categories && categories
                .filter(cat => cat.type === 3)
                .map(cat => (
                  <Link key={cat.id} to={`/byCategory/${cat.id}`} onClick={onClose}>{cat.title}</Link>
                ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default MegaMenu;
