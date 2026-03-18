import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/shop-context";
import { useNavigate } from "react-router-dom";
import ImageGroup from "../pages/productDetails/imageGroup";

const SingleProductHorizontal = ({product}) => {
  
  
  const {id, title, price, offers, stock } = product;
  const { addToCart, cartItems } = useContext(ShopContext);
  const navigate = useNavigate();
  const cartItemCount = cartItems[id];
  
  
  
  return (
    <React.Fragment>
      
    
    <div className="single-product flex flex-col bg-gray-50 gap-3 shadow-md hover:shadow-xl hover:scale-105 duration-300 px-4 py-7 rounded-sm overflow-hidden">
      {/* <p className="stock">
        Stock : <span className="font-semibold capitalize">{stock}</span>
        
      </p> */}
      Categories : 
      {
        
        product.categories && product.categories.length>0 ?
        product.categories.map((cat) => <span>{cat.title}</span>)
        :""
      }
      {
        product.offers && product.offers.length > 0?
        <p className={product.offers ? "offerOf" : "text-sm text-gray-600" }>
        Offer Available:   <span className="font-semibold capitalize"> {offers[0].discount}% Off</span>
      </p>  
        // <img style={{width:"30px;",height:"10px;"}} src="offer.gif" alt={title} />
        :<br/>
      }
      <div className="flex justify-center">
      {/* <img src={`//localhost:3000/images/${id}.png`} className="w-72 h-48 object-contain hover:scale-110 duration-500" alt={title}
								style={{height:"200px;",maxHeight:"max-content;"}} /> */}
                 <ImageGroup id={id} title={title}  classnm="product-image-slim"  />
      </div>
      <Link
        to={product.id}
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
      <p  className={product.featured ? "featured" : "text-sm text-gray-600" }>
        Price: 
               <span className={product.featured ? "featured" :"text-rose-500 font-semibold"}>
              {/* {product.offers?price  - (price * offers[0].discount/100):price} INR /- */}
              {price} INR /-
      </span>
      </p>
      {product.offers && product.offers.length>0?
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
        
        <button className="text-sky-400 px-2 py-1 border border-sky-400 rounded-md hover:bg-sky-400 hover:text-sky-50 duration-300" onClick={() => navigate("/productDetails/"+product.id)}> More Info</button>
        <button className="bg-sky-400 text-sky-50 hover:bg-sky-50 hover:text-sky-400 duration-300 border border-sky-400 px-2 py-1 rounded-md" 
        onClick={() => {if(cartItemCount < stock){addToCart(id); }
    }
      }>
        Add To Cart {cartItemCount > 0 && <> ({cartItemCount})</>}
      </button>

      </div>
    </div>
    
    </React.Fragment>
  );
};

export default SingleProductHorizontal;
