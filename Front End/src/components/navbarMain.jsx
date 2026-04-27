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
  const [isHealthMenuOpen, setIsHealthMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([
    { id: '1', title: 'Home', url: '/' },
    { id: '2', title: 'Shop', url: '/products', children: [
        { id: '3', title: 'All Products', url: '/products' },
        { id: '4', title: 'Coming Soon', url: '/products?filter=comingSoon' }
    ]},
    { id: '5', title: 'Men', url: '/productMen' },
    { id: '6', title: 'Women', url: '/productWomen' },
    { id: '7', title: 'Kids', url: '/productKids' },
    { id: '8', title: 'BestSellers', url: '/bestsellers' },
    { id: '9', title: 'Featured', url: '/featured' },
    { id: '10', title: 'Search', url: '/advancedSearch' },
    { id: '11', title: 'Track Order', url: '/trackOrder' }
  ]);
  const [openDropdowns, setOpenDropdowns] = useState({});

  useEffect(() => {
    import('../util/APIUtils').then(({ getMenu }) => {
      getMenu().then(data => {
        if (data && data.length > 0) {
          setMenuItems(data);
        }
      }).catch(err => console.error('Failed to load menu', err));
    });
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleDropdownClick = (e, id) => {
    if (window.innerWidth <= 1100) {
      e.preventDefault();
      setOpenDropdowns(prev => ({ ...prev, [id]: !prev[id] }));
    }
  };

  const handleHealthClick = (e) => {
    if (window.innerWidth <= 1100) {
      e.preventDefault();
      setIsHealthMenuOpen(!isHealthMenuOpen);
    }
  };

  const handleDropdownDoubleClick = (e, id) => {
    e.preventDefault();
    setOpenDropdowns(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleHealthDoubleClick = (e) => {
    e.preventDefault();
    setIsHealthMenuOpen((prev) => !prev);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.shop-dropdown')) {
        setOpenDropdowns({});
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
  const isMobile = window.innerWidth < 1100;

  return (
    <>
      <Sidebar />
      <div className="navbar" id="navbar" style={{ position: "fixed", width: "100%" }}>
        {!isMobile ? <FloatingSocials /> : null}
        <div className="logo-container">
          <div className="logo">
            <Link to="/" id="NavTitle">
              <img src={COMPANY_INFO.logoUrl} style={{ height: "50px", width: "auto", maxWidth: "150px" }} alt={COMPANY_INFO.name} title={COMPANY_INFO.name} />
            </Link>

            <div className={`menudropdown${isHealthMenuOpen ? ' open' : ''}`}>
              <button
                className="menudropbtn"
                onDoubleClick={handleHealthDoubleClick}
                onClick={handleHealthClick}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Double-click to browse categories"
              >
                Health & Beauty{' '}
                <i className={`fa fa-caret-down${isHealthMenuOpen ? ' rotated' : ''}`}></i>
              </button>
              <MegaMenu isOpen={isHealthMenuOpen} onClose={() => setIsHealthMenuOpen(false)} />
            </div>
          </div>

          <div className="mobile-actions">
            <Link to="/your-wishlist" className="wishlist-mobile-trigger">
              <FaHeart style={{ color: '#ff4757' }} />
              <span className='badge' style={{ background: '#ff4757', color: 'white' }}>
                {wishlistItems ? Object.keys(wishlistItems).length : 0}
              </span>
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
            {menuItems.map(item => {
              if (item.children && item.children.length > 0) {
                return (
                  <div className={`shop-dropdown ${openDropdowns[item.id] ? 'open' : ''}`} key={item.id}>
                    <Link
                      to={item.url}
                      className={location.pathname === item.url ? "active-link" : ""}
                      onDoubleClick={(e) => handleDropdownDoubleClick(e, item.id)}
                      onClick={(e) => handleDropdownClick(e, item.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {item.title} {item.title === 'Shop' && <span className="new-badge">NEW</span>} <i className="fa fa-caret-down" style={{ fontSize: '10px', marginLeft: '4px' }}></i>
                    </Link>
                    {item.title === 'Shop' ? (
                      <div className={`shop-mega-menu ${openDropdowns[item.id] ? 'show' : ''}`}>
                        <div className="mega-menu-container">
                          <div className="mega-menu-links">
                            {item.children.map(child => (
                              <Link key={child.id} to={child.url} className="mega-link" onClick={() => { setOpenDropdowns({}); setIsMobileMenuOpen(false); }}>
                                {child.title}
                              </Link>
                            ))}
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
                                      <div className="coming-soon-card" onClick={() => { setOpenDropdowns({}); window.location.href = `/productDetails/${p.id}`; }}>
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
                    ) : (
                      <div className={`shop-mega-menu ${openDropdowns[item.id] ? 'show' : ''}`} style={{ width: 'auto', minWidth: '200px', padding: '20px', left: 'auto', right: 'auto' }}>
                          <div className="mega-menu-links" style={{ width: '100%', padding: 0 }}>
                            {item.children.map(child => (
                              <Link key={child.id} to={child.url} className="mega-link" onClick={() => { setOpenDropdowns({}); setIsMobileMenuOpen(false); }}>
                                {child.title}
                              </Link>
                            ))}
                          </div>
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <Link key={item.id} to={item.url} className={location.pathname === item.url ? "active-link" : ""} onClick={() => setIsMobileMenuOpen(false)}>
                  {item.title}
                </Link>
              );
            })}

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

            <div className="desktop-only">
              <Link to="/your-wishlist" className="wishlist-header-trigger desktop-only" title="View Wishlist" style={{ fontSize: "20px", marginRight: "10px", display: 'inline-flex', alignItems: 'center' }}>
                <FaHeart style={{ color: '#ff4757' }} />
                <span className='badge' id='lblWishlistCount' style={{ marginLeft: 6, background: '#ff4757', color: 'white' }}>
                  {wishlistItems ? Object.keys(wishlistItems).length : 0}
                </span>
              </Link>

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
