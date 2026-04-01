import React, { useContext, useState, useEffect } from "react";
import { useRef } from "react";
import SingleProduct from "../components/SingleProduct";
import { Link, useParams } from "react-router-dom";
import "./product.css";

const Categorywise = () => {

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [category, setCategory] = useState(null);
  const { id } = useParams();
  const para = useRef(null);

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        // Fetch category details
        const catRes = await fetch(`http://localhost:3000/api/category/fetchById/${id}`);
        if (catRes.ok) {
          const catJson = await catRes.json();
          setCategory(catJson);
        }

        // Fetch products for this category
        const res = await fetch(`http://localhost:3000/api/product/getProducts?categoryId=${id}&page=0&size=1000`);
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
  }, [id]);

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
        <Link to="/" className="text-lg text-gray-500 font-semibold">
          &larr; Home
        </Link>
      </p>
    );

  return (
    <React.Fragment>
      <div style={{ paddingTop: "100px" }}></div>
      <div className="container mx-auto pb-20">
        <h2 className="text-center text-3xl py-10">
          {category ? `Products for ${category.title}` : "Products For Categories"}
        </h2>
        <div className="flex flex-col gap-10">
          <div>
            <p className="text-gray-500 pb-4">
              {<Link to="/">Home </Link>}/
              <span className="text-sky-400 px-1">{category?.title || "all categories"}</span>
            </p>

            {products && products.filter((prod) => prod.active === true).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products
                  .filter((prod) => prod.active === true)
                  .map((product) => (
                    <SingleProduct key={product.id} product={product} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <h3 className="text-2xl text-gray-400">No products found for this category.</h3>
                <Link to="/" className="text-sky-400 hover:underline mt-4 inline-block">
                  Continue Shopping
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

    </React.Fragment>
  );
};

export default Categorywise;
