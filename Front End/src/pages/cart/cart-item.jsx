import React, { useContext } from "react";
import { ShopContext } from "../../context/shop-context";
import ImageCarousel from '../productDetails/ImageCarousel';
import Alert from 'react-s-alert';
export const CartItem = (props) => {
  const { id, title,price, offers,stock, imageURLs } = props.data;
  const { cartItems, addToCart, addFreeToCart, removeFromCart, updateCartItemCount , removeFreeFromCart} =
    useContext(ShopContext);

  return (
    <div className="">
      {/* <img src={`//localhost:3000/images/${id}.png`} /> */}

      {imageURLs !== undefined || imageURLs !== null || imageURLs.trim() !== ''
        ?
        <ImageCarousel
        id={id}
        title={title}
        className="product-image-nano"
        thumbs={false}
        imageList={imageURLs}
        />
        :""
        }            
      {/* <ImageGroup id={id} title = {title}  classnm="product-image-nano" thums={false} />   */}
      <div className="description">
      {/* <p className="stock">
        Stock : <span className="font-semibold capitalize">{stock}</span>
        
      </p> */}
       {

        offers && offers.length>0?
         offers
          .filter((o) => o.size === "S")
          .filter((offe) => offe.type === 0)
          .map((offer) => {
        <p className={offers && offers.length > 0 ? "offerOf" : "text-sm text-gray-600" }>
        Offer Available:   <span className="font-semibold capitalize"> 
        {offer.discount}% Off</span>
      </p>  
          })
        :""
      } 
        <p>
          <b>{title}</b>
          
        </p>
        <p> Price: {price.toLocaleString()} INR/-</p>
        {offers && offers.length>0?
        offers
        .filter((o) => o.size === "S")
        .filter((offe) => offe.type === 0)
        .map((offer) => {
      <p style={{color:"goldenrod"}}> 
        <div style={{"--tw-text-opacity": "1",textDecoration : "line-through", color : "rgb(156, 163, 175)"}}>
          {price} INR/-
          </div>
          {price - (price * offer.discount/100)} INR /-
          
          </p>
        })
          : ""
        }
        <p>
        with Size : Small
          </p>
          {offers && offers.length>0?
               
               offers
                .filter((o) => o.size === "S"  && o.active === true)
                .map((offer) => {
                  
                    return    <>
                
                {offer.type === 3 && cartItems[id] > 2 && cartItems[id] <= offer.buy ?
                 "Buy " + offer.buy + " and get " + offer.discount +"% discount on them."
                : offer.type === 2 && cartItems[id] >0 && cartItems[id] <= offer.buy ? 
                "Buy this item and get " + offer.freeProducttitle + " free"
                : offer.type === 1 && cartItems[id] >0 && cartItems[id] <= offer.buy ?
                "Buy " + offer.buy + " Get " + offer.buyget +" Free"
                : offer.type === 0 && cartItems[id] === 0 ?
                "Flat" + offer.discount + "% available"
                : ""}
                </>
               })
               :" currently no offers available for this size pack!"
            }
        <div className="countHandler">
          <button onClick={() => removeFromCart(id,"S")}> - </button>
          <input
            value={cartItems[id]}
            onChange={(e) => {if(cartItems[id] < stock){ 
              updateCartItemCount(Number(e.target.value), id,"S")
        
            }
          }
        }
          />
          <button onClick={() => {if(cartItems[id] < stock){addToCart(id,"S"); }else{
              Alert.info('Item Out of stock!'); 
            }}}> + </button>
        </div>
      </div>
    </div>
  );
};
