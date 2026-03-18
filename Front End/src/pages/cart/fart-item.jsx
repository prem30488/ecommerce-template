import React, { useContext } from "react";
import { ShopContext } from "../../context/shop-context";
import ImageCarousel from '../productDetails/ImageCarousel';
export const FartItem = (props) => {
  const { id, title,size, offers,stock, imageURLs, freeProductsize } = props.data;
  const { freeCartItems } =
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
      {/* {

        offers && offers.length>0?
        <p className={offers && offers.length > 0 ? "offerOf" : "text-sm text-gray-600" }>
        Offer Available:   <span className="font-semibold capitalize"> 
        {offers[0].discount}% Off</span>
      </p>  
        
        :""
      } */}
        <p>
          <b>{title}</b>
          
        </p>
        <p> Price: 0.0 INR/-</p>
        
        <p>
        with Size : Small
          </p>
        </div>
        <div>
          
          <input
            value={freeCartItems[id]}
          />
          
        </div>
    </div>
  );
};
