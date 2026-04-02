import React, { useContext, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShopContext } from "../context/shop-context";
import { WishlistContext } from "../context/wishlist-context";
import { ShoppingCart } from "phosphor-react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import "./navbar.css";
import MegaMenu from './MegaMenu';
import SearchMenu from './SearchMenu';
import CartDrawer from "../pages/cart/CartDrawer";
// Header wishlist now navigates to the wishlist page instead of opening the drawer
import Sidebar from "./Sidebar";
import "./sidebar.css";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

export const NavbarMain = () => {
  const { cartItems, getTotalCartCount, products } = useContext(ShopContext);
  const { wishlistItems } = useContext(WishlistContext);
  const location = useLocation();

  const comingSoonProducts = products ? products.filter(p => p.comingSoon === true || p.comingSoon === 'true') : [];

  return (
    <div className="navbar" id="navbar" style={{ position: "fixed", width: "100%" }}>
      <Sidebar />
      <div className="logo">

        <Link to="/" id="NavTitle">
          <img src="/images/logo.png" style={{ height: "60px", width: "100px" }} alt="Logo" />
        </Link>

        <div className="menudropdown">
          <button className="menudropbtn">Health & Beauty Essentials <i className="fa fa-caret-down"></i>
          </button>
          <MegaMenu />

        </div>
      </div>
      <SearchMenu />
      <div className="links">
        <Link to="/" className={location.pathname === "/" ? "active-link" : ""}>
          Home
        </Link>
        <div className="shop-dropdown">
          <Link to="/products" className={location.pathname === "/products" ? "active-link" : ""}>
            Shop <span className="new-badge">NEW</span> <i className="fa fa-caret-down" style={{ fontSize: '10px', marginLeft: '4px' }}></i>
          </Link>
          <div className="shop-mega-menu">
            <div className="mega-menu-container">
              <div className="mega-menu-links">
                <Link to="/products" className="mega-link active">
                  All Products
                </Link>
                <Link to="/products?filter=comingSoon" className="mega-link">
                  Coming Soon products
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
                          <div className="coming-soon-card" onClick={() => window.location.href = `/productDetails/${p.id}`}>
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
        <Link to="/productMen" className={location.pathname === "/productMen" ? "active-link" : ""} products={products}>
          Men
        </Link>
        <Link to="/productWomen" className={location.pathname === "/productWomen" ? "active-link" : ""} products={products}>
          Women
        </Link>
        <Link to="/productKids" className={location.pathname === "/productKids" ? "active-link" : ""} products={products}>
          Kids
        </Link>
        <Link to="/bestsellers" className={location.pathname === "/bestsellers" ? "active-link" : ""}>
          BestSellers
        </Link>
        <Link to="/featured" className={location.pathname === "/featured" ? "active-link" : ""}>
          Featured
        </Link>
        <Link to="/advancedSearch" className={location.pathname === "/advancedSearch" ? "active-link" : ""}>
          Search
        </Link>
        <Link to="/trackOrder" className={location.pathname === "/advancedSearch" ? "active-link" : ""}>
          Track Order
        </Link>


        <Link to="/your-wishlist" className="wishlist-header-trigger" title="View Wishlist" style={{ fontSize: "20px", marginRight: "10px", display: 'inline-flex', alignItems: 'center' }}>
          <FaHeart style={{ color: '#ff4757' }} />
          <span className='badge badge-warning' id='lblWishlistCount' style={{ marginLeft: 6 }}>
            {wishlistItems ? Object.keys(wishlistItems).length : 0}
          </span>
        </Link>
        <CartDrawer></CartDrawer>
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
  );
};
