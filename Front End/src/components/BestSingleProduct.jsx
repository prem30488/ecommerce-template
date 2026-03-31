import { Link } from "react-router-dom";
import React, { useContext } from "react";
import { ShopContext } from "../context/shop-context";
import { useNavigate } from "react-router-dom";
import ImageCarousel from "../pages/productDetails/ImageCarousel";
import Alert from 'react-s-alert';
import WishlistIcon from "./WishlistIcon";
const BestSingleProduct = ({ product }) => {
  const { id, stock, title, imageURLs } = product;
  const price = product.productFlavors?.[0]?.price || 0;
  const firstFlavorId = product.productFlavors?.[0]?.flavor_id;

  const { addToCart, cartItems } = useContext(ShopContext);
  const navigate = useNavigate();
  const cartItemCount = Object.keys(cartItems).reduce((sum, key) => key.startsWith(`${id}_`) ? sum + cartItems[key] : sum, 0);
  return (
    <div className="single-product flex flex-col bg-gray-50 gap-3 shadow-md hover:shadow-xl hover:scale-105 duration-300 px-4 py-7 rounded-sm overflow-hidden">
      <div className="flex justify-center">
        {imageURLs !== undefined || imageURLs !== null || imageURLs.trim() !== ''
          ?
          <ImageCarousel
            id={id}
            title={title}
            className="product-image-slim"
            thumbs={true}
            imageList={imageURLs}
          />
          : ""
        }
      </div>
      <Link
        to={"/productDetails/" + id}
        state={product}
        className="hover:text-rose-500 duration-300 flex justify-between items-center"
      >
        <h2 className="text-stone-950 font-semibold text-xl capitalize">
          {product.title.slice(0, 20)}
        </h2>
      </Link>
      <p className={product.bestseller ? "bestseller" : "text-sm text-gray-600"}>
        Bestseller : <span className="font-semibold capitalize">{product.bestseller ? "Yes" : "No"}</span>
      </p>
      <p className="text-sm text-gray-600">
        Price: <span className="text-rose-500 font-semibold">{price} INR /-</span>
      </p>
      <div className="flex justify-between items-center">
        <button className="btn-info" onClick={() => navigate("/productDetails/" + product.id)}>More Info</button>
        <button className="btn-cart" onClick={() => {
          if (cartItemCount < stock) { addToCart(id, "S", firstFlavorId); } else {
            Alert.info('Item Out of stock!');
          }
        }}>
          Add To Cart {cartItemCount > 0 && <> ({cartItemCount})</>}
        </button>
      </div>
      {/* Wishlist icon below Add to Cart */}
      <div style={{ padding: '8px', display: 'flex', justifyContent: 'center' }}>
        <WishlistIcon productId={id} size="large" showText={true} />
      </div>
    </div>
  );
};

export default BestSingleProduct;
