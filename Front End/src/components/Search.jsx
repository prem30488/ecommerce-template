import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import SingleProduct from "../components/SingleProduct";
const Search = () => {
  let notFound = false;
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(null);
  const { query } = useParams();
  const [products, setProducts] = useState([]);
  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("//localhost:5000/api/product/getProducts?page=0&size=1000&sorted=true");
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
  return (
    <React.Fragment>
      <div className="container mx-auto pb-20">
        <h2 className="text-center text-3xl py-10">Search Results For Query - {query}</h2>
        <div>
          <p className="text-gray-500 pb-4">
            {<Link to="/">Home </Link>}/
            <span className="text-sky-400 px-1">{query}</span>
          </p>
          <div className="grid grid-cols-4 gap-lg-5 ">
            {products.map((product) => {
              if (product.title.toLowerCase().toString().includes(query.toLowerCase().toString().trim())) {
                notFound = true;
              }
              else if (product.categories && product.categories.length > 0) {
                product.categories.map((cat) => {
                  if (cat.title.toLowerCase() === query.toString().trim().toLowerCase()) {
                    notFound = true;
                  }
                })
              }
              else if (product.description.includes(query)) {
                notFound = true;
              } else if (product.audience.toLowerCase().includes(query.toLowerCase().toString().trim())) {
                notFound = true;
              }
              else {
                notFound = false;
              }
              if (notFound == true) {
                return <SingleProduct key={product.id} product={product} />;
              } else {
                return "";
              }
            })}
            {/* {notFound==false?"No items Found. Please search another word.":""}         */}
          </div>
        </div>
      </div>

    </React.Fragment>
  );

}

export default Search;
