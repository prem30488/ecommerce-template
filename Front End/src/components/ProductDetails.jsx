import React, { useContext, useState, useEffect } from "react";
import { API_BASE_URL } from '../constants/index.jsx';
import { Link, useLocation, useParams } from "react-router-dom";
import { ShopContext } from "../context/shop-context";
import SimilarProducts from "./SimilarProducts"
import Compare from "./Compare";
import ImageCarousel from "../pages/productDetails/ImageCarousel";
import WishlistIcon from "./WishlistIcon";
const ProductDetails = ({ compare }) => {
  const { id: paramId } = useParams();
  const { state: locationProduct } = useLocation();
  const [product, setProduct] = useState(locationProduct || null);
  const { addToCart, cartItems } = useContext(ShopContext);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [filterProducts, setFilterProducts] = useState([]);

  useEffect(() => {
    const getProductData = async () => {
      if (!paramId) return;
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/product/fetchById/${paramId}`);
        if (!res.ok) throw new Error("Product not found");
        const json = await res.json();
        setProduct(json);
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        setErr(err.message);
      }
    };

    const getAllProducts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/product/getProducts?page=0&size=1000&sorted=true`);
        if (!res.ok) throw new Error("Oops! An error has occured");
        const json = await res.json();
        setProducts(json.content || json);
        setFilterProducts(json.content || json);
      } catch (err) {
        console.error(err);
      }
    };

    getProductData();
    getAllProducts();
  }, [paramId]);

  if (isLoading || !product)
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
          &larr;Go back to products
        </Link>
      </p>
    );

  const { id, img, title, description, category, brand, rating, price, ProductImages } = product;
  const cartItemCount = cartItems[id];
  const compareProducts = products.filter(p => p.compare);

  return (
    <section className="flex flex-col gap-16 py-10 bg-gray-100">
      <div className="container mx-auto flex justify-around items-start w-[100%]">
        <div className="flex flex-col gap-3 max-w-[100%] w-[100%]">
          <div className="flex-shrink-0 w-[100%]">
            <p className="text-gray-500">
              {"Home/"}
              {<Link to="/productMen">Products</Link>}
              {`/${title}`}
            </p>
            <h2 className="text-4xl font-bold">{title.slice(0, 60)}</h2>
            {/* <ImageCarousel
              id={id}
              title={title}
              mainImage={img}
              additionalImages={ProductImages}
            /> */}


            <span className="font-semibold text-xl">
              Price: <span className="text-2xl text-sky-600">${price}</span>
            </span>
            <p className={product.bestseller ? "text-orange-600 font-bold" : "text-sm text-gray-600"}>
              Bestseller: <span className="font-semibold capitalize"> {product.bestseller ? "Yes" : "No"}</span>
            </p>
            <div className="flex flex-col gap-2 bg-white p-4 rounded-lg shadow-sm">
              <h1 className="text-2xl font-semibold text-gray-800 border-b pb-2">Key features</h1>
              <p className="text-gray-700 leading-relaxed mt-2">{description}</p>
            </div>
            <h3 className="flex justify-between text-gray-700 text-lg mt-4">
              <span>Category: <span className="font-semibold">{category}</span></span>
              <span>
                Rating:{" "}
                <span className="text-rose-500 font-bold text-xl">
                  {rating ? rating.toString().slice(0, 3) : "N/A"}
                </span>
              </span>
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
              <button className="bg-sky-500 text-white hover:bg-sky-600 transition-colors duration-300 px-6 py-3 rounded-md text-lg font-semibold shadow-md" onClick={() => addToCart(id)}>
                Add To Cart {cartItemCount > 0 && <> ({cartItemCount})</>}
              </button>
              {/* Wishlist icon next to Add to Cart */}
              <div style={{ padding: '4px', display: 'flex', alignItems: 'center' }}>
                {/* Use large size for visibility */}
                <WishlistIcon productId={id} size="large" />
              </div>
            </div>
          </div>
        </div>
        <Link
          to="/products"
          className="text-xl py-4 text-center hover:text-sky-600 duration-300 select-none border-t border-gray-200"
        >
          &larr; Back to Products Catalog
        </Link>

        {compareProducts.length >= 2 &&
          <Compare products={compareProducts} />
        }
        <SimilarProducts productCat={product} />
      </div>


    </section>
  );
};

export default ProductDetails;



export const FETCH_PRODUCTS = 'FETCH_PRODUCTS';
export const COMPARE_PRODUCT = 'COMPARE_PRODUCT';
