import React, { useContext } from "react";
import { ShopContext } from "../../context/shop-context";
export const MartItemFinal = (props) => {
  const { id, title,priceMedium, img, offers } = props.data;
  const { martItems } =
  useContext(ShopContext);

  return (
    <div className="">
      <img src={img} />
      <div className="description">
        <p>
          <b>{title}</b>
          
        </p>
        <p> Price: {priceMedium.toLocaleString()} INR/-</p>
        {offers?
      <div style={{color:"goldenrod"}}> 
        <p style={{"--tw-text-opacity": "1;",textDecoration : "line-through", color : "rgb(156 163 175"}}>
          {priceMedium} INR/-
          </p>
          {offers[0]?priceMedium - (priceMedium * offers[0].discount/100):priceMedium} INR /-
          </div>
          : ""
        }
        <div className="countHandler">
          Qty : {martItems[id]}
        </div>
      </div>
    </div>
  );
};