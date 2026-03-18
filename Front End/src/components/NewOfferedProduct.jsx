import { Link } from "react-router-dom";
import React, { useContext } from "react";
import { ShopContext } from "../context/shop-context";
import ImageGroup from "../pages/productDetails/imageGroup";

const BestSingleProduct = ({ product }) => {
  const { id, img, title, brand, price } = product;
  
  const { addToCart, cartItems } = useContext(ShopContext);

  const cartItemCount = cartItems[id];
  return (
    <div className="single-product flex flex-col bg-gray-50 gap-3 shadow-md hover:shadow-xl hover:scale-105 duration-300 px-4 py-7 rounded-sm overflow-hidden">
      <div className="flex justify-center">
        {/* <img
            className="w-72 h-48 object-contain hover:scale-110 duration-500"
          src={img}
          alt={title}
        /> */}
        <ImageGroup id={id} title = {title}  classnm="product-image-slim" />
      </div>
      <Link
        to={title}
        state={product}
        className="hover:text-rose-500 duration-300 flex justify-between items-center"
      >
        <h2 className="text-stone-950 font-semibold text-xl capitalize">
          {product.title.slice(0, 20)}
        </h2>
      </Link>
      <p className={product.bestseller ? "bestseller" : "text-sm text-gray-600" }>
      Bestseller: <span className="font-semibold capitalize"> {product.bestseller ? "Yes" : "No"}</span>
        
      </p>
      <p className="text-sm text-gray-600">
        Price: <span className="text-rose-500 font-semibold">{price}</span>
      </p>
      
      <div className="flex justify-between items-center">
        <Link
          to={"/productMen/"+title}
          state={product}
          className="hover:text-rose-50 text-gray-900 duration-300 flex justify-between items-center"
        >
          <button className="text-sky-400 px-2 py-1 border border-sky-400 rounded-md hover:bg-sky-400 hover:text-sky-50 duration-300">
            More Info
          </button>
        </Link>
        
        <button className="bg-sky-400 text-sky-50 hover:bg-sky-50 hover:text-sky-400 duration-300 border border-sky-400 px-2 py-1 rounded-md" onClick={() => addToCart(id)}>
        Add To Cart {cartItemCount > 0 && <> ({cartItemCount})</>}
      </button>
      </div>
    </div>
  );
};

export default BestSingleProduct;
