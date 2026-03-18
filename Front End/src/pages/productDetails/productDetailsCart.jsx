import React, { useContext, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import SimilarProducts from "../../components/SimilarProducts"
import "./productDetails.css";
import ImageCarousel from './ImageCarousel';
import ProductSelector from './ProductSelector';
import Alert from 'react-s-alert';
export const ProductDetailsCart = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(null);

  const { id } = useParams();

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("//localhost:5000/api/product/getProducts?page=0&size=1000&sort=id,asc");
        if (!res.ok) throw new Error("Oops! An error has occured");
        const json = await res.json();
        setProducts(json.content);
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        setErr(err.message);
      }
    };
    getData();
  }, []);

  if (isLoading)
    return (
      <p className="h-screen flex flex-col justify-center items-center text-2xl">
        Loading...
      </p>
    );
  if (err)
    return (
      <p className="h-screen flex flex-col justify-center items-center text-2xl">
        <span>{err}</span>
        <Link to="/product" className="text-lg text-gray-500 font-semibold">
          &larr;Refresh page
        </Link>
      </p>
    );


  const product = products.find((p) => Number(p.id) === Number(id));

  // If the product doesn't exist, return an error message
  if (!product) {
    return <div>Product not found</div>;
  }

  const { title, active, description, price, stock, offers, rating, categories, imageURLs } = product;
  return (

    <React.Fragment>

      <h2 className="text-4xl py-10 text-center font-medium text-gray-700">
        Product Details - {product.title}
      </h2>
      <div className="product-container" style={{ height: "1000px" }}>
        <div className="product-image-container">
          <ImageCarousel
            id={id}
            title={title}
            className=""
            thumbs={true}
            imageList={imageURLs}
          />
        </div>
        <div className="product-details-container">
          <h1 className="product-name">{title}</h1>
          <div className="product-details">
            {/* <p><b>ID:</b> {id}</p> */}
            <p>Free Shipping Across India.
              Delivery in 3-5 business days.
            </p>
            <p><b>Name:</b> {title}</p>
            <p><b>Price:</b> {price} INR/-  </p>
            {product.offers && product.offers.length > 0 ?
              <div style={{ color: "goldenrod" }}>
                <div style={{ "--tw-text-opacity": "1", textDecoration: "line-through", color: "rgb(156, 163, 175)" }}>
                  {price} INR/-
                </div>
                {price - (price * offers[0].discount / 100)} INR /-
              </div>
              : ""
            }
            <span>
              Rating:{" "}
              <span className="text-rose-500 font-bold">
                {rating.slice(0, 3)}
              </span>
              <span>{rating.slice(3)}</span>
            </span>
            <p className="text-sm text-gray-600" >
              Audience: <span className="font-semibold capitalize">{product.audience.slice(0, 20)}</span>
            </p>
            <p><b>Description:</b></p>
            <p>{description}</p>
            <ProductSelector product={product} />
          </div>
        </div>
      </div>

      <SimilarProducts productCat={product} />

    </React.Fragment>

  );
};



export default ProductDetailsCart;
