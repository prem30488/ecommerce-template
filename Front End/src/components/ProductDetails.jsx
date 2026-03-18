import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShopContext } from "../context/shop-context";
import SimilarProducts from "./SimilarProducts"
import Compare from "./Compare";

const ProductDetails = ({ compare }) => {
  const { state: product } = useLocation();
  const { id, img, title, description, category, brand, rating, price } = product;
  const { addToCart, cartItems } = useContext(ShopContext);
  const [products, setProducts] = useState([]);
  const cartItemCount = cartItems[id];

  const actions = this.props;
  const compareProducts = {};

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("//localhost:5000/api/product/getProducts?page=0&size=1000&sorted=true");
        if (!res.ok) throw new Error("Oops! An error has occured");
        const json = await res.json();
        setIsLoading(false);
        setProducts(json);
        setFilterProducts(json);
        compareProducts = products.filter(product => product.compare)
      } catch (err) {
        setIsLoading(false);
        setErr(err.message);
      }
    };
    getData();
    this.props.actions.getProducts();
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
    <section className="flex flex-col gap-16 py-10 bg-gray-100">
      <div className="container mx-auto flex justify-around  items-center w-[80%]">
        <div className="w-96 flex justify-end">
          <img src={img} alt={title} className="w-full select-none" />
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-gray-500">
            {"Home/"}
            {<Link to="/productMen">Products</Link>}
            {`/${title}`}
          </p>
          <h2 className="text-4xl">{title.slice(0, 30)}</h2>
          <span className="font-semibold">
            Price: <span className="text-2xl">{price}</span>
          </span>
          {/* <span className="font-semibold">Brand: {brand}</span> */}
          <p className={product.bestseller ? "bestseller" : "text-sm text-gray-600"}>
            Bestseller: <span className="font-semibold capitalize"> {product.bestseller ? "Yes" : "No"}</span>

          </p>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl">Key features</h1>
            <p className="text-gray-800">{description.slice(0, 35)}</p>
            <p className="text-gray-800">{description.slice(36, 70)}</p>
            <p className="text-gray-800">{description.slice(71, 100)}</p>
            <p className="text-gray-800">{description.slice(101, 130)}</p>
            <p className="text-gray-800">{description.slice(131, 170)}</p>
            <p className="text-gray-800">{description.slice(170, 201)}</p>
          </div>
          <h3 className="flex justify-between text-gray-700 text-lg">
            <span>Category: {category}</span>
            <span>
              Rating:{" "}
              <span className="text-rose-500 font-bold">
                {rating.slice(0, 3)}
              </span>
              <span>{rating.slice(3)}</span>
            </span>
          </h3>
          <button className="bg-sky-400 text-sky-50 hover:bg-sky-50 hover:text-sky-400 duration-300 border border-sky-400 px-2 py-1 rounded-md" onClick={() => addToCart(id)}>
            Add To Cart {cartItemCount > 0 && <> ({cartItemCount})</>}
          </button>
        </div>
      </div>
      <Link
        to="/product"
        className="text-xl py-1 text-center hover:text-cyan-500 duration-300 select-none"
      >
        &larr; Go to Products
      </Link>

      {compareProducts.length >= 2 &&
        <Compare products={compareProducts} />
      }
      <SimilarProducts productCat={product} />
    </section>

  );
};

export default ProductDetails;



export const FETCH_PRODUCTS = 'FETCH_PRODUCTS';
export const COMPARE_PRODUCT = 'COMPARE_PRODUCT';
