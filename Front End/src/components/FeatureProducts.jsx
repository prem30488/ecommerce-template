import { useState, useEffect, useContext } from "react";
import { API_BASE_URL } from '../constants/index.jsx';
import PremiumProductCard from "../components/PremiumProductCard";
import FeatureProductsCarousel from "../components/FeatureProductsCarousel";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/shop-context";

const FeatureProducts = () => {
  const { products } = useContext(ShopContext);
  const [isLoading, setIsLoading] = useState(true);
  const [err, setErr] = useState(null);

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
                  return <PremiumProductCard key={product.id} product={product} />;
                })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureProducts;
