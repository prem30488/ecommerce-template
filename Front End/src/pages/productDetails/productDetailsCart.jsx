import React, { useContext, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import SimilarProducts from "../../components/SimilarProducts"
import "./productDetails.css";
import ImageCarousel from './ImageCarousel';
import ProductSelector from './ProductSelector';
import StarRating from './StarRating';
import FrequentlyBoughtCarousel from './FrequentlyBoughtCarousel';
import { findFrequentlyBoughtTogether } from './eclatAlgorithm';
import Alert from 'react-s-alert';
export const ProductDetailsCart = () => {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [frequentProducts, setFrequentProducts] = useState([]);

  const { id } = useParams();

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        // Fetch specific product with images from the improved route
        const res = await fetch(`http://localhost:5000/api/product/fetchById/${id}`);
        if (!res.ok) throw new Error("Oops! Product not found");
        const json = await res.json();
        setProduct(json);
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        setErr(err.message);
      }
    };
    getData();
  }, [id]);

  useEffect(() => {
    const fetchFrequent = async () => {
      if (!product) return;
      try {
        const res = await fetch("http://localhost:5000/api/product/getProducts?page=0&size=20");
        const json = await res.json();
        const allProducts = (json.content || json);

        // Use Eclat algorithm to find frequently bought together items
        const eclatRecommendations = findFrequentlyBoughtTogether(product, allProducts);

        // Fallback to random selection if Eclat doesn't return enough items
        if (eclatRecommendations.length < 3) {
          const remainingProducts = allProducts.filter(p => p.id !== product.id && !eclatRecommendations.find(r => r.id === p.id));
          const randomItems = remainingProducts.sort(() => 0.5 - Math.random()).slice(0, 3 - eclatRecommendations.length);
          eclatRecommendations.push(...randomItems);
        }

        setFrequentProducts(eclatRecommendations.slice(0, 4));
      } catch (e) {
        console.error(e);
        // Fallback to simple random selection
        try {
          const res = await fetch("http://localhost:5000/api/product/getProducts?page=0&size=10");
          const json = await res.json();
          const items = (json.content || json).filter(p => p.id !== product.id).sort(() => 0.5 - Math.random()).slice(0, 4);
          setFrequentProducts(items);
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }
    }
    fetchFrequent();
  }, [product?.id]);

  if (isLoading)
    return (
      <p className="h-screen flex flex-col justify-center items-center text-2xl">
        Loading...
      </p>
    );

  if (err || !product)
    return (
      <p className="h-screen flex flex-col justify-center items-center text-2xl px-4 text-center">
        <span>{err || "Product not found"}</span>
        <Link to="/product" className="text-lg text-sky-500 font-semibold mt-4">
          &larr; Back to Products
        </Link>
      </p>
    );

  const { title, description, price, rating, ProductImages, img, categoryId } = product;

  return (
    <React.Fragment>
      <div className="container flex" style={{ paddingTop: '120px', minHeight: '100%' }}>
        <div className="col-md-12" style={{ minHeight: '100%' }}>
          <div className="row" style={{ minHeight: '100%' }}>
            {/* LEFT SIDE: CAROUSEL */}
            <div className="col-md-4 mt-8 w-full lg:w-[300px] lg:mt-0 flex-shrink-0 h-full" style={{ minHeight: '100%' }}>
              <div class="p-3 pt-8 border bg-light h-auto" style={{ minHeight: '100%' }} >
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full" style={{ minHeight: '100%' }} >
                  <ImageCarousel
                    id={id}
                    title={title}
                    mainImage={img}
                    additionalImages={ProductImages}
                  />

                  {/* Price and Rating */}

                  <div className="flex items-center justify-between mt-6">
                    <br />
                    <span className="text-3xl md:text-4xl font-bold text-sky-600">Price : {price} INR/-</span>
                    {product.offers && product.offers.length > 0 && (
                      <span className="text-gray-400 line-through text-lg">
                        ${(price / (1 - (product.offers[0].discount / 100))).toFixed(2)}
                      </span>
                    )}

                    <div className="sm:ml-auto flex items-center bg-rose-50 rounded-full">
                      <StarRating rating={rating || 4.5} />
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* RIGHT SIDE: DETAILS */}
            <div className="col-md-8 mt-8 w-full lg:w-[300px] lg:mt-0 flex-shrink-0">
              <div class="p-3 pt-8 border bg-light">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="space-y-6">
                    {/* Product Title */}
                    <div className="border-b pb-4">
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                        {title}
                      </h1>
                    </div>



                    {/* Shipping Info */}
                    <div className="bg-sky-50 p-4 rounded-lg border border-sky-100">
                      <p className="text-sky-800 text-sm flex items-center gap-2">
                        <span className="text-sky-500 font-bold">✓</span> Free Shipping Across India
                      </p>
                      <p className="text-sky-800 text-sm flex items-center gap-2 mt-2">
                        <span className="text-sky-500 font-bold">✓</span> Delivery in 3-5 business days
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Description</h3>
                      <p className="text-gray-600 leading-relaxed text-sm">{description}</p>
                    </div>

                    {/* Product Selector */}
                    <div className="pt-4 border-t border-gray-100">
                      <ProductSelector product={product} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FREQUENTLY BOUGHT TOGETHER */}
          {frequentProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-sky-400 inline-block">
                Frequently Bought Together
              </h2>
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <FrequentlyBoughtCarousel
                  currentProduct={product}
                  frequentProducts={frequentProducts}
                />
                <div className="mt-6 text-center">
                  <p className="text-gray-500 text-sm mb-2">Total Price (All Items)</p>
                  <p className="text-3xl font-bold text-sky-600 mb-4">
                    ${(Number(product.price) + frequentProducts.reduce((sum, p) => sum + Number(p.price), 0)).toFixed(2)}
                  </p>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-transform hover:scale-105 active:scale-95">
                    Add All To Cart
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SIMILAR PRODUCTS */}
          <div className="mt-16">
            <SimilarProducts productCat={product} />
          </div>
        </div>
      </div>
    </React.Fragment >
  );
};



export default ProductDetailsCart;
