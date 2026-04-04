import { useState, useEffect, useRef, useContext } from "react";
import PremiumProductCard from "../components/PremiumProductCard";
import BestSellingCarousel from "../components/BestSellingCarousel";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/shop-context";
import { API_BASE_URL } from "../constants";
const BestSelling = () => {

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(null);

  const para = useRef(null);

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/product/getProducts?page=0&size=1000&sorted=true`);
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
        <Link to="/bestsellers" className="text-lg text-gray-500 font-semibold">
          &larr; Refresh page
        </Link>
      </p>
    );

  return (
    <div className="container mx-auto pb-20">
      <div style={{ position: "relative", paddingTop: "100px" }}></div>
      {/* <h2 className="text-center text-3xl py-10">Bestselling Products</h2> */}

      <div className="flex justify-between gap-10">

        <div>
          <p className="text-gray-500 pb-4">
            {<Link to="/">Home </Link>}/
            <span className="text-sky-400 px-1">Best Seller Products</span>
          </p>

          <BestSellingCarousel />
          <div className="grid grid-cols-4 gap-lg-5 ">

            {products &&
              products
                .filter((product) => product.bestseller === true && product.active === true)

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

export default BestSelling;
