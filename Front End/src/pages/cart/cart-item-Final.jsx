import React, { useContext } from "react";
import { ShopContext } from "../../context/shop-context";
export const CartItemFinal = (props) => {
  const { id, title,price, img, offers } = props.data;
  const { cartItems } =
  useContext(ShopContext);

  return (
    <div className="">
      <img src={img} />
      <div className="description">
        <p>
          <b>{title}</b>
          
        </p>
        <p> Price: {price.toLocaleString()} INR/-</p>
        {offers?
      <div style={{color:"goldenrod"}}> 
        <p style={{"--tw-text-opacity": "1;",textDecoration : "line-through", color : "rgb(156 163 175"}}>
          {price} INR/-
          </p>
          {offers[0]?price - (price * offers[0].discount/100):price} INR /-
          </div>
          : ""
        }
        <div className="countHandler">
          Qty : {cartItems[id]}
        </div>
      </div>
    </div>
  );
};