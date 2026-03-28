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
export const NavbarMain = () => {
  const { cartItems, getTotalCartCount } = useContext(ShopContext);
  const { wishlistItems } = useContext(WishlistContext);
  const { products } = useContext(ShopContext);
  const location = useLocation();
  let countCart = 0;

  useEffect(() => {
    const getData = async () => {
      try {
        getCountCart();
      } catch (err) {
      }
    };
    getData();
  }, []);



  const getCountCart = () => {
    countCart = 0;

    if (cartItems.length > 0) {
      for (const i in cartItems) {
        if (cartItems[i] > 0) {
          countCart = countCart + cartItems[i];
        }
      }
    }
    return countCart;
  }


  return (
    <div className="navbar" id="navbar" style={{ position: "fixed", width: "100%" }}>
      <Sidebar />
      <div className="logo">

        <Link to="/" id="NavTitle">
          <img src="images/logo.png" style={{ height: "60px", width: "120px" }} />
        </Link>

        <div className="menudropdown">
          <button className="menudropbtn">Health & Beauty Essentials <i className="fa fa-caret-down"></i>
          </button>
          <MegaMenu />

        </div>
      </div>
      <SearchMenu />
      <div className="links">
        <Link to="/" className={location.pathname === "/" ? "active-link" : ""} products={products}>
          Home
        </Link>
        <Link to="/productMen" className={location.pathname === "/productMen" ? "active-link" : ""} products={products}>
          Men
        </Link>
        <Link to="/productWomen" className={location.pathname === "/productWomen" ? "active-link" : ""} products={products}>
          Women
        </Link>
        <Link to="/productKids" className={location.pathname === "/productKids" ? "active-link" : ""} products={products}>
          Kids
        </Link>
        {/* <Link to="/booking" className={location.pathname === "/booking" ? "active-link" : ""}>
          Booking
        </Link> */}

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


        <Link to="/your-wishlist" className="wishlist-header-trigger" title="View Wishlist" style={{ fontSize: "24px", marginRight: "10px", display: 'inline-flex', alignItems: 'center' }}>
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
