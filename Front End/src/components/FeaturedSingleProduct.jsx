import { Link } from "react-router-dom";
import React, { useContext } from "react";
import { ShopContext } from "../context/shop-context";
import { useNavigate } from "react-router-dom";
import ImageCarousel from "../pages/productDetails/ImageCarousel";
import Alert from 'react-s-alert';
import WishlistIcon from "./WishlistIcon";
const FeaturedSingleProduct = ({ product }) => {
  const { id, title, stock, price, imageURLs } = product;
  const navigate = useNavigate();
  const { addToCart, cartItems } = useContext(ShopContext);

  const cartItemCount = cartItems[id];
  return (
    <div className="single-product flex flex-col bg-gray-50 gap-3 shadow-md hover:shadow-xl hover:scale-105 duration-300 px-4 py-7 rounded-sm overflow-hidden pt-3">
      <div className="flex justify-center">
        {/* <img src={`images/${product.id}.png`} className="w-72 h-48 object-contain hover:scale-110 duration-500" alt={title}
								style={{height:"200px;",maxHeight:"max-content;"}} /> */}
        {/* <ImageGroup id={id} title={title} classnm="product-image-slim"  /> */}

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
      <p className={product.featured ? "featured" : "text-sm text-gray-600"}>
        Price: <span className={product.featured ? "featured" : "text-rose-500 font-semibold"}>{price} - Featured Product</span>
      </p>

      <div className="flex justify-between items-center">
        <button className="btn-info" onClick={() => navigate("/productDetails/" + product.id)}>More Info</button>

        <button className="btn-cart"
          onClick={() => {
            if (cartItemCount < stock) { addToCart(id, "S"); } else {
              Alert.info('Item Out of stock!');
            }
          }}>
          Add To Cart {cartItemCount > 0 && <> ({cartItemCount})</>}
        </button>

        <div style={{ padding: '4px' }}>
          <WishlistIcon productId={id} size="medium" showText={true} />
        </div>
      </div>
    </div>
  );
};

export default FeaturedSingleProduct;
