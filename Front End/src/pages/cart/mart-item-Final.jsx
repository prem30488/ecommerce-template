import React, { useContext } from "react";
import { ShopContext } from "../../context/shop-context";
export const MartItemFinal = (props) => {
  const { id, title, img, offers } = props.data;
  const { martItems, flavorCart } = useContext(ShopContext);
  const flavorId = flavorCart[`${id}_M`] || (props.data.productFlavors && props.data.productFlavors[0]?.flavor_id) || 1;
  const activeFlavorData = props.data.productFlavors?.find(pf => String(pf.flavor_id) === String(flavorId));
  const priceMedium = activeFlavorData ? activeFlavorData.priceMedium : 0;

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
        <p style={{"--tw-text-opacity": "1",textDecoration : "line-through", color : "rgb(156, 163, 175)"}}>
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
