import { useState, useEffect, useRef } from "react";
import FeaturedSingleProduct from "../components/FeaturedSingleProduct";
import FeatureProductsCarousel from "../components/FeatureProductsCarousel";
import { Link } from "react-router-dom";
const FeatureProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("http://localhost:3000/api/product/getProducts?page=0&size=1000&sorted=true");
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
        <Link to="/featured" className="text-lg text-gray-500 font-semibold">
          &larr;Refresh page
        </Link>
      </p>
    );

  return (
    <div className="container mx-auto pb-20">

      <div className="flex justify-between gap-10">
        <div>
          <p className="text-gray-500 pb-4">
            {<Link to="/">Home </Link>}/
            <span className="text-sky-400 px-1">Featured Products</span>
          </p>
          <FeatureProductsCarousel />
          <div className="grid grid-cols-4 gap-lg-5 ">
            {products &&
              products
                .filter((product) => product.featured === true && product.active === true)
                .map((product, index) => {
                  if (index > 7) { return "" }
                  return <FeaturedSingleProduct key={product.id} product={product} />;
                })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureProducts;
