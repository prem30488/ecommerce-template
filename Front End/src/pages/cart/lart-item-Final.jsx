import React, { useContext } from "react";
import { ShopContext } from "../../context/shop-context";
export const LartItemFinal = (props) => {
  const { id, title, img, offers } = props.data;
  const { lartItems, flavorCart } = useContext(ShopContext);
  const flavorId = flavorCart[`${id}_L`] || (props.data.productFlavors && props.data.productFlavors[0]?.flavor_id) || 1;
  const activeFlavorData = props.data.productFlavors?.find(pf => String(pf.flavor_id) === String(flavorId));
  const priceLarge = activeFlavorData ? activeFlavorData.priceLarge : 0;

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
        <p style={{"--tw-text-opacity": "1",textDecoration : "line-through", color : "rgb(156, 163, 175)"}}>
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
