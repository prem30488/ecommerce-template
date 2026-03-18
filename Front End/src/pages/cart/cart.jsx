import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../../context/shop-context";
import { CartItem } from "./cart-item";
import { MartItem } from "./mart-item";
import { LartItem } from "./lart-item";
import { FartItem } from "./fart-item";
import { FMartItem } from "./fmart-item";
import { FLartItem } from "./flart-item";
import { useNavigate, Link } from "react-router-dom";
import "./cart.css";
import CouponCode from "../checkout/CouponCode";
export const Cart = () => {
  const { cartItems, martItems, lartItems, freeCartItems, freeMartItems, freeLartItems, getTotalCartAmount, checkout } = useContext(ShopContext);
  const totalAmount = getTotalCartAmount();

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  useEffect(() => {
    const getData = async () => {
      try {

        const res = await fetch("//localhost:5000/api/product/getProducts?page=0&size=1000&sorted=true");
        if (!res.ok) throw new Error("Oops! An error has occured");
        const json = await res.json();
        setProducts(json.content);

      } catch (err) {

      }
    };
    getData();
  }, []);



  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData({ ...formData, [name]: value });
  // };



  return (
    <div className="">
      <div>
        <h1>Your Cart Items</h1>


        {products.map((product) => {
          if (cartItems[product.id] > 0) {
            return <CartItem data={product} />;
          }
        })}

        {products.map((product) => {
          if (martItems[product.id] > 0) {
            return <MartItem data={product} />;
          }
        })}

        {products.map((product) => {
          if (lartItems[product.id] > 0) {
            return <LartItem data={product} />;
          }
        })}

        {products.map((product) => {
          if (freeCartItems[product.id] > 0) {
            return <FartItem data={product} />;
          }
        })}

        {products.map((product) => {
          if (freeMartItems[product.id] > 0) {
            return <FMartItem data={product} />;
          }
        })}

        {products.map((product) => {
          if (freeLartItems[product.id] > 0) {
            return <FLartItem data={product} />;
          }
        })}
      </div>

      {totalAmount > 0 ? (
        <div className="checkout checkout-container">
          <div className="subtotal">
            <h1>Subtotal: {totalAmount.toLocaleString()} INR/-</h1>
          </div>
          <div>
            <CouponCode />

          </div>

        </div>

      ) : (
        <h1> Your Shopping Cart is Empty</h1>
      )}
    </div>
  );
};
