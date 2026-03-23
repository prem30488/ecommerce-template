import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/shop-context";
import { useNavigate } from "react-router-dom";
import ImageCarousel from "../pages/productDetails/ImageCarousel";
const SimilarProduct = ({ product }) => {
  const { id, title, price, audience, offers, stock,imageURLs } = product;
  const { addToCart, cartItems , addToCompare,removeFromCompare} = useContext(ShopContext);
  const navigate = useNavigate();
  const cartItemCount = cartItems[id];
  
  return (
    <React.Fragment>
    <div className="single-product flex flex-col bg-gray-50 gap-3 shadow-md hover:shadow-xl hover:scale-105 duration-300 px-4 py-7 rounded-sm overflow-hidden">
      
      {
        product.offers && product.offers.length>0?
        <p className={product.offers  && product.offers.length>0? "offerOf" : "text-sm text-gray-600" }>
        Offer Available:   <span className="font-semibold capitalize"> {offers[0].discount}% Off</span>
      </p>  
        // <img style={{width:"30px;",height:"10px;"}} src="offer.gif" alt={title} />
        :""
      }
      
      <div className="flex justify-center">
      {/* <img src={`/images/${id}.png`} className="product-image" alt={title}
								 />
        </div> */}
      
      <Link
        to={product.id}
        state={product}
        className="hover:text-rose-500 duration-300 flex justify-between items-center"
      >
        
        <h2 className="text-stone-950 font-semibold text-xl capitalize">
          {product.title.slice(0, 20)}
        </h2>
      </Link>
      
      </div>
      {imageURLs !== undefined || imageURLs !== null || imageURLs.trim() !== ''
        ?
        <ImageCarousel
        id={id}
        title={title}
        className="product-image-slim"
        thumbs={true}
        imageList={imageURLs}
        />
        :""
        }
      <div>
      <p className={product.bestseller ? "bestseller" : "text-sm text-gray-600" }>
        Bestseller: <span className="font-semibold capitalize"> {product.bestseller ? "Yes" : "No"}</span>
        
      </p>
      <p  className={product.featured ? "featured" : "text-sm text-gray-600" }>
        Price: 
               <span className={product.featured ? "featured" :"text-rose-500 font-semibold"}>
              {/* {product.offerOf?price  - (price * offerOf[0].discount/100):price} INR /- */}
              {price} INR /-
      </span>
      </p>
      {product.offers  && product.offers.length>0?
      <div style={{color:"goldenrod"}}> 
        <div style={{"--tw-text-opacity": "1",textDecoration : "line-through", color : "rgb(156, 163, 175)"}}>
          {price} INR/-
          </div>
          {price - (price * offers[0].discount/100)} INR /-
          </div>
          : ""
        }
      <p className="text-sm text-gray-600" >
        Audience: <span className="font-semibold capitalize">{product.audience.slice(0, 20)}</span>
      </p>
      <div className="flex justify-between items-center">
        
        <button className="btn-info" onClick={() => navigate("/productDetails/"+product.id)}>More Info</button>
        <button className="btn-cart"
        onClick={() => {if(cartItemCount < stock){addToCart(id); }
    }
      }>
        Add To Cart {cartItemCount > 0 && <> ({cartItemCount})</>}
      </button>
      <button className="btn-cart"
       onClick={() => addToCompare(product)}>
              Compare
       </button>
       <button className="btn-info"
       onClick={() => removeFromCompare(product)}>
              Remove
       </button>
      </div>
    </div>
        </div>
        </React.Fragment>
  );
};

export default SimilarProduct;
