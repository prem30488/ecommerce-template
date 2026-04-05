import { useState, useEffect, useContext } from "react";
import { API_BASE_URL } from '../constants/index.jsx';
import SingleProduct from './SingleProduct'
import { Link } from "react-router-dom";
import { Compare } from './Compare/index';
import { ShopContext } from "../context/shop-context";

const NewOfferedProducts = () => {
  const { products } = useContext(ShopContext);

  useEffect(() => {
    if (products && products.length > 0) {
      setIsLoading(false);
    }
  }, [products]);

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

  return (
    <div className="container mx-auto pb-20">
      <h2 className="text-center text-3xl py-10">Offers on Products</h2>
      <div className="flex justify-between gap-10">

        <div>
          <p className="text-gray-500 pb-4">
            {<Link to="/">Home </Link>}/
            <span className="text-sky-400 px-1">New Offers</span>
          </p>
          <div className="grid grid-cols-4 gap-lg-5 ">
            {/* {filterProducts &&
              filterProducts.map((product) => (
                <SingleProduct key={product.id} product={product} />
              ))} */}

            {products &&
              products
                .filter((product) => product.offers !== undefined && product.offers.length > 0 && product.active === true)
                .map((product, index) => {
                  if (index > 7) { return "" }
                  return <SingleProduct key={product.id} product={product} />;
                })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOfferedProducts;
