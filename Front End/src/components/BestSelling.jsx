import { useState, useEffect, useContext } from "react";
import PremiumCard from "../components/PremiumCard";
import BestSellingCarousel from "../components/BestSellingCarousel";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/shop-context";
import React from "react";
import SEO from "../components/SEO";
import { COMPANY_INFO } from "../constants/companyInfo";
const BestSelling = () => {

  const { products, categories } = useContext(ShopContext);

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
        <Link to="/bestsellers" className="text-lg text-gray-500 font-semibold">
          &larr; Refresh page
        </Link>
      </p>
    );

  return (
    <div className="container mx-auto pb-20">
      <div style={{ position: "relative", paddingTop: "20px" }}></div>
      {/* <h2 className="text-center text-3xl py-10">Bestselling Products</h2> */}

      <div className="flex justify-between gap-10">
        <div>
          <nav className="premium-breadcrumbs">
            <Link to="/">Home</Link>
            <span className="premium-breadcrumb-separator">›</span>
            <span className="premium-breadcrumb-current">Best Sellers</span>
          </nav>


          {products && (() => {
            const bestSellers = products.filter(p => p.bestseller && p.active);
            const allTitles = bestSellers.map(p => p.title).join(", ");
            const allCategories = [...new Set(categories
              ?.filter(cat => bestSellers.some(p =>
                String(p.catIds).split(',').map(Number).includes(cat.id) || p.category_id === cat.id
              ))
              .map(cat => cat.title)
            )].join(", ");

            return (
              <>
                <SEO
                  title="Bestselling Products"
                  description={`Discover our top-rated collection featuring: ${allTitles.substring(0, 150)}...`}
                  keywords={`${allTitles}, ${allCategories}, ${COMPANY_INFO.name}, bestsellers`}
                />
                <BestSellingCarousel />
                <div className="grid grid-cols-4 gap-lg-5 ">
                  {bestSellers.slice(0, 8).map((product) => (
                    <PremiumCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </div>

    </div>
  );
};

export default BestSelling;
