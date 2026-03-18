// ProductSelector.js
import React, { useContext, useState } from 'react';
import { ShopContext } from '../../context/shop-context';
import Alert from 'react-s-alert';
const ProductSelector = ({product}) => {
  const [selectedSize, setSelectedSize] = useState('M'); // Default size
  const {id, stock } = product;
  const { addToCart, cartItems, martItems, lartItems } = useContext(ShopContext);
  const cartItemCount = cartItems[id];
  const martItemCount = martItems[id];
  const lartItemCount = lartItems[id];
   const sizeOptions = [
     { id: 'S', label: 'Small', price: product.price, discount: 0 },
     { id: 'M', label: 'Medium', price: product.priceMedium, discount: 5 },
     { id: 'L', label: 'Large', price: product.priceLarge, discount: 10 },
   ];

  const handleSizeChange = (size) => {
    setSelectedSize(size);
  };

  const calculateSavings = () => {
    const currentSize = sizeOptions.find((option) => option.id === selectedSize);
    const largerSize = sizeOptions.find((option) => option.id !== selectedSize);

    const savings = currentSize.price - largerSize.price;
    return savings;
  };

  const isSizePopular = (size) => {
    // You can implement your own logic to determine popularity
    return size.id === 'M';
  };

  return (
    <div>
        
      <h2>Select Product Size</h2>
      
      <div>
        
        {sizeOptions.map((size) => (
          <div key={size.id}>
            <label>
              <input
                type="radio"
                value={size.id}
                checked={selectedSize === size.id}
                onChange={() => handleSizeChange(size.id)}
              />
              {size.label} - {size.price} INR /- {size.label === 'Small'?product.unitSmall: size.label ==='Medium' ? product.unitMedium : product.unitLarge } {product.unit} 
              {size.discount > 0 && ` (Save ${size.discount * 100} INR/-)`}
              {isSizePopular(size) && ' - Popular!'}
              < br/>
              {/* {JSON.stringify(product.offers)} */}
              {product.offers && product.offers.length>0?
               
               product.offers
                .filter((o) => o.size === size.id && o.active === true)
                .map((offer) => {
                    return    <>
                  {/* {JSON.stringify(offer)} */}
                {offer.type === 3 && cartItems[product.id] > 2 && cartItems[product.id] <= offer.buy ?
                 "Buy " + offer.buy + " and get " + offer.discount +"% discount on them."
                : offer.type === 2 && cartItems[product.id] >=0 && cartItems[product.id] <= offer.buy ? 
                "Buy "+ offer.buy +" this item and get " + offer.freeProducttitle + " free"
                : offer.type === 1 && cartItems[product.id] >=0 && cartItems[product.id] <= offer.buy ?
                "Buy " + offer.buy + " Get " + offer.buyget +" Free"
                : offer.type === 0 && cartItems[product.id] === 0 ?
                "Flat" + offer.discount + "% available"
                : ""}
                </>
               })
               :" currently no offers available for this size pack!"
            }
            </label>
          </div>
        ))}
      </div>
      <div>
        <p>   
          You saved {calculateSavings()} INR/- by choosing a larger size!
        </p>
        <button className="bg-sky-400 text-sky-50 hover:bg-sky-50 hover:text-sky-400 duration-300 border border-sky-400 px-2 py-1 rounded-md" 
        onClick={() => {if((cartItemCount + martItemCount + lartItemCount) < stock){addToCart(id,selectedSize); }else{
            Alert.info('Item Out of stock!'); 
          }
    }
      }>
        Add To Cart Small - {cartItemCount > 0 && <> ({cartItemCount})</>}
        Medium - {martItemCount > 0 && <> ({martItemCount})</>}
        Large - {lartItemCount > 0 && <> ({lartItemCount})</>}
      </button>
      
      </div>
      
    </div>
  );
};

export default ProductSelector;
