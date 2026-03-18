import React, { useContext } from "react";
import { ShopContext } from "../../context/shop-context";
export const LartItemFinal = (props) => {
  const { id, title,priceLarge, img, offers } = props.data;
  const { lartItems } =
  useContext(ShopContext);

  return (
    <div className="">
      <img src={img} />
      <div className="description">
        <p>
          <b>{title}</b>
          
        </p>
        <p> Price: {priceLarge.toLocaleString()} INR/-</p>
        {offers?
      <div style={{color:"goldenrod"}}> 
        <p style={{"--tw-text-opacity": "1;",textDecoration : "line-through", color : "rgb(156 163 175"}}>
          {priceLarge} INR/-
          </p>
          {offers[0]?priceLarge - (priceLarge * offers[0].discount/100):priceLarge} INR /-
          </div>
          : ""
        }
        <div className="countHandler">
          Qty : {lartItems[id]}
        </div>
      </div>
    </div>
  );
};