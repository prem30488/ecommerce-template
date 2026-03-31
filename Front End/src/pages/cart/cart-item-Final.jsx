import React, { useContext } from "react";
import { ShopContext } from "../../context/shop-context";
export const CartItemFinal = (props) => {
  const { id, title, img, offers } = props.data;
  const { cartItems, flavorCart } = useContext(ShopContext);
  const flavorId = flavorCart[`${id}_S`] || (props.data.productFlavors && props.data.productFlavors[0]?.flavor_id) || 1;
  const activeFlavorData = props.data.productFlavors?.find(pf => String(pf.flavor_id) === String(flavorId));
  const price = activeFlavorData ? activeFlavorData.price : 0;

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
        <p style={{"--tw-text-opacity": "1",textDecoration : "line-through", color : "rgb(156, 163, 175)"}}>
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
