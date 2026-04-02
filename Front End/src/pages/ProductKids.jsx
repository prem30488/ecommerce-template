import { useState, useEffect, useRef } from "react";
import PremiumProductCard from "../components/PremiumProductCard";
import { Link } from "react-router-dom";
import "./product.css";
import { API_BASE_URL } from "../constants";
import { getCategoriesShort } from "../util/APIUtils";

const ProductKids = () => {

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filterProducts, setFilterProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [catPath, setCatPath] = useState("all categories");

  const para = useRef(null);

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/product/getProducts?page=0&size=1000&sorted=true`);
        if (!res.ok) throw new Error("Oops! An error has occured");
        const json = await res.json();
        setProducts(json.content);
        setFilterProducts(json.content);

        const resC = await getCategoriesShort();
        if (resC) {
          const dbCategories = resC.content || resC || [];
          const titles = dbCategories.map(cat => (typeof cat === 'string' ? cat : cat.title));
          setCategories(titles);
        }
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

  return (
    <>
      <div style={{ paddingTop: "100px" }}></div>
      <div className="container mx-auto pb-20">
        <h2 className="text-center text-3xl py-10">Products For Kids</h2>
        <div className="flex justify-between gap-10">
          <div>
            <p className="text-gray-500 pb-4">
              {<Link to="/">Home </Link>}/
              <span className="text-sky-400 px-1">{catPath} For Kids</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filterProducts &&
                filterProducts
                  .filter(prod => typeof prod.audience === 'string' && prod.audience.match(new RegExp("(?:^|,)" + "Kids" + "(?:,|$)")))
                  .filter(p => p.active == true)
                  .map((product) => (
                    <PremiumProductCard key={product.id} product={product} />
                  ))}
            </div>
            <img src="/images/certifications.png" alt="Certifications" style={{ height: '500px', width: '100%', float: "center", marginLeft: "0px", verticalAlign: "top" }} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductKids;
