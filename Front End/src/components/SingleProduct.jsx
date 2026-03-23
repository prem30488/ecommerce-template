import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/shop-context";
import { useNavigate } from "react-router";
import ImageCarousel from "../pages/productDetails/ImageCarousel";
import Alert from 'react-s-alert';
const SingleProduct = ({ product }) => {


  const { id, title, price, offers, stock, imageURLs } = product;
  const { addToCart, cartItems } = useContext(ShopContext);
  const navigate = useNavigate();
  const cartItemCount = cartItems[id];


  return (
    <React.Fragment>


      <div className="single-product bg-gray-50 gap-3 shadow-md hover:shadow-xl hover:scale-105 duration-300 px-4 py-7 rounded-sm overflow-hidden">
        {/* <p className="stock">
        Stock : <span className="font-semibold capitalize">{stock}</span>
        
      </p> */}
        Categories :
        {

          product.categories && product.categories.length > 0 ?
            product.categories.map((cat) => <span key={cat.id}>{cat.title}</span>)
            : ""
        }
        {
          product.offers && product.offers.length > 0 ?

            product.offers
              .filter((o) => o.size === "S" && o.active === true && o.type === 0)
              .map((offer) => {
                return <p className="offerOf" key={offer.id}>
                  Offer Available:   <span className="font-semibold capitalize"> {offer.discount}% Off</span>
                </p>
              })
            : <br />
        }
        <div className="flex justify-center">
          {imageURLs !== undefined || imageURLs !== null || imageURLs.trim() !== ''
            ?
            <ImageCarousel
              id={id}
              title={title}
              className="product-image-slim"
              thumbs={true}
              imageList={imageURLs}
            />
            : ""
          }
        </div>
        <Link
          to={"/productDetails/" + id}
          state={product}
          className="hover:text-rose-500 duration-300 flex justify-between items-center"
        >

          <h2 className="text-stone-950 font-semibold text-xl capitalize">
            {product.title.slice(0, 20)}
          </h2>
        </Link>
        <p className={product.bestseller ? "bestseller" : "text-sm text-gray-600"}>
          Bestseller: <span className="font-semibold capitalize"> {product.bestseller ? "Yes" : "No"}</span>

        </p>
        <p className={product.featured ? "featured" : "text-sm text-gray-600"}>
          Price:
          <span className={product.featured ? "featured" : "text-rose-500 font-semibold"}>
            {/* {product.offers?price  - (price * offers[0].discount/100):price} INR /- */}
            {price} INR /-
          </span>
        </p>
        {product.offers && product.offers.length > 0 ?
          <div style={{ color: "goldenrod" }}>
            <div style={{ "--tw-text-opacity": "1", textDecoration: "line-through", color: "rgb(156, 163, 175)" }}>
              {price} INR/-
            </div>

            {price - (price * offers[0].discount / 100)} INR /-
          </div>
          : ""
        }
        <p className="text-sm text-gray-600" >
          Audience: <span className="font-semibold capitalize">{product.audience.slice(0, 20)}</span>
        </p>
        <div className="flex justify-between items-center">

          <button className="btn-info" onClick={() => navigate("/productDetails/" + product.id)}>More Info</button>
          <button className="btn-cart"
            onClick={() => {
              if (cartItemCount < stock) { addToCart(id, "S"); } else {
                Alert.info('Item Out of stock!');
              }
            }
            }>
            Add To Cart {cartItemCount > 0 && <> ({cartItemCount})</>}
          </button>

        </div>
      </div>

    </React.Fragment>
  );
};

export default SingleProduct;
