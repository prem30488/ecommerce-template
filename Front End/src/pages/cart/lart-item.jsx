import React, { useContext } from "react";
import { ShopContext } from "../../context/shop-context";
import ImageCarousel from '../productDetails/ImageCarousel';
import Alert from 'react-s-alert';
export const LartItem = (props) => {
  const { id, title,priceLarge, offers,stock, imageURLs } = props.data;
  const { lartItems, addToCart, removeFromCart, updateCartItemCount } =
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
        <p> Price: {priceLarge.toLocaleString()} INR/-</p>
        {offers && offers.length>0?
      <p style={{color:"goldenrod"}}> 
        <div style={{"--tw-text-opacity": "1",textDecoration : "line-through", color : "rgb(156, 163, 175)"}}>
          {priceLarge} INR/-
          </div>
          {priceLarge - (priceLarge * offers[0].discount/100)} INR /-
          </p>
          : ""
        }
        <p>
        with Size : Large
          </p>
          {offers && offers.length>0?
               
               offers
                .filter((o) => o.size === "L" && o.active === true)
                .map((offer) => {
                  
                    return    <>
                
                {offer.type === 3 && lartItems[id] > 2 && lartItems[id] <= offer.buy ?
                 "Buy " + offer.buy + " and get " + offer.discount +"% discount on them."
                : offer.type === 2 && lartItems[id] >0 && lartItems[id] <= offer.buy ? 
                "Buy this item and get " + offer.freeProducttitle + " free"
                : offer.type === 1 && lartItems[id] >0 && lartItems[id] <= offer.buy ?
                "Buy " + offer.buy + " Get " + offer.buyget +" Free"
                : offer.type === 0 && lartItems[id] === 0 ?
                "Flat" + offer.discount + "% available"
                : ""}
                </>
               })
               :" currently no offers available for this size pack!"
            }
        <div className="countHandler">
          <button onClick={() => removeFromCart(id,"L")}> - </button>
          <input
            value={lartItems[id]}
            onChange={(e) => {if(lartItems[id] < stock){ 
              updateCartItemCount(Number(e.target.value), id,"L")
        
            }
          }
        }
          />
          <button onClick={() => {if(lartItems[id] < stock){addToCart(id,"L"); }else{
              Alert.info('Item Out of stock!'); 
            }}}> + </button>
        </div>
      </div>
    </div>
  );
};
