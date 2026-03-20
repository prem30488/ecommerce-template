import React, { useState, useEffect } from "react";
import SimilarProduct from "./SimilarProduct";
import Compare from "./Compare/index"
import { useContext } from "react";
import { ShopContext } from "../context/shop-context";
const SimilarProducts = ({ productCat }) => {
  const [products, setProducts] = useState([]);
  const { selectedItems, setSelectedItems } = useContext(ShopContext);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch("//localhost:5000/api/product/getProducts?page=0&size=1000&sorted=true");
        if (!res.ok) throw new Error("Oops! An error has occured");
        const json = await res.json();

        setProducts(json.content);
      } catch (err) {
        console.log(err.message);
      }
    };
    getData();
  }, []);

  return (
    <div>

      <h2 className="text-4xl py-10 text-center font-medium text-gray-700">
        Similar Products - {productCat && Array.isArray(productCat.categories) && productCat.categories.length > 0 ?
          productCat.categories.map(
            (cat) => <span>{cat.title}</span>)
          : ""}
      </h2>
      <br />

      {(selectedItems && selectedItems.length) >= 2 ?
        <Compare products={selectedItems} /> : ""
      }
      <div className="grid grid-cols-3 gap-10 w-[80%] mx-auto pb-20">
        {productCat && Array.isArray(productCat.categories) && productCat.categories.length > 0 &&
          products &&
          products
            .filter((p) => Array.isArray(p.categories) && p.categories.length > 0 && Array.isArray(productCat.categories) && productCat.categories.length > 0 && p.categories[0].title === productCat.categories[0].title)
            .map((product) => {
              return <SimilarProduct key={product.id} product={product} selectedItems={selectedItems} />;
            })}

      </div>
    </div>
  );
};

export default SimilarProducts;
