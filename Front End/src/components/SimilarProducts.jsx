import React, { useState, useEffect } from "react";
import { API_BASE_URL } from '../constants/index.jsx';
import SimilarProduct from "./SimilarProduct";
import Compare from "./Compare/index"
import { useContext } from "react";
import { ShopContext } from "../context/shop-context";
const SimilarProducts = ({ productCat }) => {
  const { selectedItems, setSelectedItems, products } = useContext(ShopContext);

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
