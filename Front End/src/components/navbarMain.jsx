import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShopContext } from "../context/shop-context";
import { WishlistContext } from "../context/wishlist-context";
import { ShoppingCart } from "phosphor-react";
import { FaHeart, FaRegHeart, FaBars, FaTimes } from "react-icons/fa";
import { HiMenuAlt3, HiX } from "react-icons/hi"; // Alternative cleaner icons
import "./navbar.css";
import MegaMenu from './MegaMenu';
import SearchMenu from './SearchMenu';
import CartDrawer from "../pages/cart/CartDrawer";
// Header wishlist now navigates to the wishlist page instead of opening the drawer
import Sidebar from "./Sidebar";
import FloatingSocials from "./socialIconsFloating";
import "./sidebar.css";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { COMPANY_INFO } from "../constants/companyInfo";

export const NavbarMain = () => {
  const { cartItems, getTotalCartCount, products, categories } = useContext(ShopContext);
  const { wishlistItems } = useContext(WishlistContext);
  const location = useLocation();
  const [isShopMenuOpen, setIsShopMenuOpen] = useState(false);
  const [isHealthMenuOpen, setIsHealthMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleShopClick = (e) => {
    if (window.innerWidth <= 1100) {
      e.preventDefault();
      setIsShopMenuOpen(!isShopMenuOpen);
    }
  };

  const handleHealthClick = (e) => {
    if (window.innerWidth <= 1100) {
      e.preventDefault();
      setIsHealthMenuOpen(!isHealthMenuOpen);
    }
  };

  const handleShopDoubleClick = (e) => {
    e.preventDefault();
    setIsShopMenuOpen(!isShopMenuOpen);
  };

  const handleHealthDoubleClick = (e) => {
    e.preventDefault();
    setIsHealthMenuOpen((prev) => !prev);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.shop-dropdown')) {
        setIsShopMenuOpen(false);
      }
      if (!event.target.closest('.menudropdown')) {
        setIsHealthMenuOpen(false);
      }
      if (!event.target.closest('.links') && !event.target.closest('.mobile-menu-toggle') && !event.target.closest('.search-container')) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCategoryProductCount = (catTitle) => {
    if (!products) return 0;
    const activeProducts = products.filter(p => p.active !== false);
    return activeProducts.filter(p => (p.Category?.title === catTitle) || (p.category === catTitle)).length;
  };

  const comingSoonProducts = products ? products.filter(p => p.comingSoon === true || p.comingSoon === 'true') : [];

  const getComingSoonCategories = (p) => {
    const titles = new Set();

    // Helper to resolve a potential ID string/number to a category title
    const resolveToTitle = (val) => {
      if (!val) return null;
      const cat = categories?.find(c => String(c.id) === String(val));
      return cat?.title || null;
    };

    // 1. Check p.Category object
    if (p.Category?.title) titles.add(p.Category.title);

    // 2. Check p.category property (could be a title or an ID)
    if (p.category) {
      const resolved = resolveToTitle(p.category);
      if (resolved) {
        titles.add(resolved);
      } else if (isNaN(p.category)) {
        // Only add if it's a non-numeric string (presumably a title)
        titles.add(String(p.category));
      }
    }

    // 3. Process catIds list
    if (p.catIds) {
      const ids = String(p.catIds).split(',').map(id => id.trim()).filter(Boolean);
      let foundAny = false;
      ids.forEach(id => {
        const resolved = resolveToTitle(id);
        if (resolved) {
          titles.add(resolved);
          foundAny = true;
        }
      });

      // Fallback: If we have IDs but nothing resolved and nothing in title yet, show raw IDs
      if (!foundAny && titles.size === 0) {
        return ids.join(', ');
      }
    }

    return Array.from(titles).join(', ') || '';
  };

  const getComingSoonForm = (p) => {
    if (p.Form?.title) return p.Form.title;
    if (p.form) return typeof p.form === 'string' ? p.form : `Form #${p.form}`;
    if (p.formId) return `Form #${p.formId}`;
    return '';
  };

  return (
    <>
      <Sidebar />
      <div className="navbar" id="navbar" style={{ position: "fixed", width: "100%" }}>
        <FloatingSocials />
        <div className="logo-container">
          <div className="logo">
            <Link to="/" id="NavTitle">
              <img src={COMPANY_INFO.logoUrl} style={{ height: "60px", width: "auto", maxWidth: "150px" }} alt={COMPANY_INFO.name} title={COMPANY_INFO.name} />
            </Link>

            <div className={`menudropdown${isHealthMenuOpen ? ' open' : ''}`}>
              <button
                className="menudropbtn"
                onDoubleClick={handleHealthDoubleClick}
                onClick={handleHealthClick}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Double-click to browse categories"
              >
                Health & Beauty Essentials{' '}
                <i className={`fa fa-caret-down${isHealthMenuOpen ? ' rotated' : ''}`}></i>
              </button>
              <MegaMenu isOpen={isHealthMenuOpen} onClose={() => setIsHealthMenuOpen(false)} />
            </div>
          </div>

          <div className="mobile-actions">
            <Link to="/your-wishlist" className="wishlist-mobile-trigger">
              <FaHeart style={{ color: '#ff4757' }} />
              <span className='badge badge-warning'>{wishlistItems ? Object.keys(wishlistItems).length : 0}</span>
            </Link>
            <CartDrawer />
            <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? <HiX /> : <HiMenuAlt3 />}
            </button>
          </div>
        </div>

        <div className={`nav-content ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <SearchMenu onSearch={() => setIsMobileMenuOpen(false)} />
          <div className="links">
            <Link to="/" className={location.pathname === "/" ? "active-link" : ""} onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </Link>
            <div className={`shop-dropdown ${isShopMenuOpen ? 'open' : ''}`}>
              <Link
                to="/products"
                className={location.pathname === "/products" ? "active-link" : ""}
                onDoubleClick={handleShopDoubleClick}
                onClick={handleShopClick}
                style={{ cursor: 'pointer' }}
              >
                Shop <span className="new-badge">NEW</span> <i className="fa fa-caret-down" style={{ fontSize: '10px', marginLeft: '4px' }}></i>
              </Link>
              <div className={`shop-mega-menu ${isShopMenuOpen ? 'show' : ''}`}>
                <div className="mega-menu-container">
                  <div className="mega-menu-links">
                    <Link to="/products" className="mega-link active" onClick={() => setIsShopMenuOpen(false)}>
                      All Products
                    </Link>
                    <Link to="/products?filter=comingSoon" className="mega-link" onClick={() => setIsShopMenuOpen(false)}>
                      ✨ Coming Soon
                    </Link>
                    {/* Additional categories could go here to match screenshot */}
                    {/* <Link to="/products?category=Gym Supplements" className="mega-link">Gym Supplements</Link> */}
                  </div>

                  <div className="mega-menu-carousel">
                    {comingSoonProducts.length > 0 ? (
                      <Swiper
                        modules={[Autoplay, Navigation]}
                        spaceBetween={20}
                        slidesPerView={3}
                        autoplay={{ delay: 3000, disableOnInteraction: false }}
                        navigation={true}
                        className="coming-soon-swiper"
                      >
                        {comingSoonProducts.map((p) => {
                          // Calculate price and discount for the card
                          const flavor = p.productFlavors?.[0];
                          const price = flavor?.price || p.price || 0;
                          const offer = p.offers?.find(o => o.active && o.discount > 0);
                          const discount = offer ? offer.discount : 0;
                          const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

                          return (
                            <SwiperSlide key={`${p.id}-coming-soon`}>
                              <div className="coming-soon-card" onClick={() => { setIsShopMenuOpen(false); window.location.href = `/productDetails/${p.id}`; }}>
                                <div className="coming-soon-image-wrapper">
                                  <img src={p.img} alt={p.title} />
                                  <div className="coming-soon-overlay">

                                    <div className="coming-soon-track">
                                      <span>COMING SOON ✨ COMING SOON ✨ COMING SOON ✨ COMING SOON</span>
                                    </div>

                                  </div>
                                </div>
                                <div className="coming-soon-info">
                                  <h3 className="coming-soon-title">{p.title}</h3>
                                  <div className="coming-soon-meta">
                                    {getComingSoonCategories(p) && <span className="coming-soon-category">{getComingSoonCategories(p)}</span>}
                                    {getComingSoonForm(p) && <span className="coming-soon-form">{getComingSoonForm(p)}</span>}
                                  </div>
                                  <div className="coming-soon-rating">
                                    {"★★★★★".split("").map((s, i) => (
                                      <span key={i} className="star">★</span>
                                    ))}
                                  </div>
                                  <div className="coming-soon-pricing">
                                    <span className="coming-soon-final-price">₹{Math.round(finalPrice).toLocaleString()}</span>
                                    {discount > 0 && price > finalPrice && (
                                      <span className="coming-soon-original-price">₹{price.toLocaleString()}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </SwiperSlide>
                          );
                        })}
                      </Swiper>
                    ) : (
                      <div className="no-products-msg">Coming Soon products arriving shortly...</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <Link to="/productMen" className={location.pathname === "/productMen" ? "active-link" : ""} products={products} onClick={() => setIsMobileMenuOpen(false)}>
              Men
            </Link>
            <Link to="/productWomen" className={location.pathname === "/productWomen" ? "active-link" : ""} products={products} onClick={() => setIsMobileMenuOpen(false)}>
              Women
            </Link>
            <Link to="/productKids" className={location.pathname === "/productKids" ? "active-link" : ""} products={products} onClick={() => setIsMobileMenuOpen(false)}>
              Kids
            </Link>
            <Link to="/bestsellers" className={location.pathname === "/bestsellers" ? "active-link" : ""} products={products} onClick={() => setIsMobileMenuOpen(false)}>
              BestSellers
            </Link>
            <Link to="/featured" className={location.pathname === "/featured" ? "active-link" : ""} products={products} onClick={() => setIsMobileMenuOpen(false)}>
              Featured
            </Link>
            <Link to="/advancedSearch" className={location.pathname === "/advancedSearch" ? "active-link" : ""} onClick={() => setIsMobileMenuOpen(false)}>
              Search
            </Link>
            <Link to="/trackOrder" className={location.pathname === "/trackOrder" ? "active-link" : ""} onClick={() => setIsMobileMenuOpen(false)}>
              Track Order
            </Link>

            {/* Categories Section for Mobile */}
            <div className="mobile-categories-section">
              <h3 className="mobile-section-title">Shop by Category</h3>
              <ul className="mobile-category-list">
                <li className="mobile-category-item">
                  <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="mobile-category-link">
                    All Products
                    <span className="cat-badge">{products ? products.filter(p => p.active !== false).length : 0}</span>
                  </Link>
                </li>
                {categories && categories.map(cat => (
                  <li key={cat.id} className="mobile-category-item">
                    <Link to={`/products?category=${encodeURIComponent(cat.title)}`} onClick={() => setIsMobileMenuOpen(false)} className="mobile-category-link">
                      {cat.title}
                      <span className="cat-badge">{getCategoryProductCount(cat.title)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>


            <Link to="/your-wishlist" className="wishlist-header-trigger desktop-only" title="View Wishlist" style={{ fontSize: "20px", marginRight: "10px", display: 'inline-flex', alignItems: 'center' }}>
              <FaHeart style={{ color: '#ff4757' }} />
              <span className='badge badge-warning' id='lblWishlistCount' style={{ marginLeft: 6 }}>
                {wishlistItems ? Object.keys(wishlistItems).length : 0}
              </span>
            </Link>
            <div className="desktop-only">
              <CartDrawer></CartDrawer>
            </div>
            {/* <Link
          to="/about"
          className={location.pathname === "/about" ? "active-link" : ""}
        >
          About Us
        </Link>
        <Link
          to="/contact"
          className={location.pathname === "/contact" ? "active-link" : ""}
        >
          Contact
        </Link> */}









          </div>
        </div>
      </div>
    </>
  );
};
