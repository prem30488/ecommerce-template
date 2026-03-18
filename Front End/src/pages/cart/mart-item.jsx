import React, { useContext } from "react";
import { ShopContext } from "../../context/shop-context";
import ImageCarousel from '../productDetails/ImageCarousel';
import Alert from 'react-s-alert';
export const MartItem = (props) => {
  const { id, title,priceMedium, offers,stock, imageURLs } = props.data;
  const { martItems, addToCart, removeFromCart, updateCartItemCount } =
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
        <p className={offers && offers.length > 0 ? "offerOf" : "text-sm text-gray-600" }>
        Offer Available:   <span className="font-semibold capitalize"> 
        {offers[0].discount}% Off</span>
      </p>  
        
        :""
      }
        <p>
          <b>{title}</b>
          
        </p>
        <p> Price: {priceMedium.toLocaleString()} INR/-</p>
        {offers && offers.length>0?
      <p style={{color:"goldenrod"}}> 
        <div style={{"--tw-text-opacity": "1;",textDecoration : "line-through", color : "rgb(156 163 175"}}>
          {priceMedium} INR/-
          </div>
          {priceMedium - (priceMedium * offers[0].discount/100)} INR /-
          </p>
          : ""
        }
        <p>
        with Size : Medium
          </p>
          {offers && offers.length>0?
               
               offers
                .filter((o) => o.size === "M" && o.active === true)
                .map((offer) => {
                  
                    return    <>
                
                {offer.type === 3 && martItems[id] > 2 && martItems[id] <= offer.buy ?
                 "Buy " + offer.buy + " and get " + offer.discount +"% discount on them."
                : offer.type === 2 && martItems[id] >0 && martItems[id] <= offer.buy ? 
                "Buy this item and get " + offer.freeProducttitle + " free"
                : offer.type === 1 && martItems[id] >0 && martItems[id] <= offer.buy ?
                "Buy " + offer.buy + " Get " + offer.buyget +" Free"
                : offer.type === 0 && martItems[id] === 0 ?
                "Flat" + offer.discount + "% available"
                : ""}
                </>
               })
               :" currently no offers available for this size pack!"
            }
        <div className="countHandler">
          <button onClick={() => removeFromCart(id,"M")}> - </button>
          <input
            value={martItems[id]}
            onChange={(e) => {if(martItems[id] < stock){ 
              updateCartItemCount(Number(e.target.value), id,"M")
        
            }
          }
        }
          />
          <button onClick={() => {if(martItems[id] < stock)
            {addToCart(id,"M"); }
            else{
              Alert.info('Item Out of stock!'); 
            }}}> + </button>
        </div>
      </div>
    </div>
  );
};