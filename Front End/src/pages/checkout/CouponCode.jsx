import React, { useContext, useId, useState, useEffect } from "react";
import { API_BASE_URL } from '../../constants/index.jsx';
import { ShopContext } from "../../context/shop-context";
import { CartItemFinal } from "../cart/cart-item-Final";
import { useNavigate } from "react-router-dom";
import FormDialog from "./FormDialog";



export const CouponCode = (props) => {
  const id = useId();
  const [input, setInput] = useState(props?.value ?? '');
  const { cartItems, getTotalCartAmount, addTotalAfterDiscount, products } = useContext(ShopContext);
  const totalAmount = getTotalCartAmount();
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [amountAfterCoupon, setAmountAfterCoupon] = useState([]);
  const [couponDiscount, setCouponDiscount] = useState([]);

  let index = 0;
  function verifyCoupon(code) {
    console.log(code);
    let amount = getTotalCartAmount();
    index = 0;
    debugger
    for (const coupon in coupons) {
      // const start = coupons[index].from;
      // const end = coupons[index].to;
      // const date = new Date();

      if (code === coupons[index].code) {//&& (date > start && date < end)){
        setAmountAfterCoupon(Number(amount - (amount * coupons[index].discount / 100)));
        setCouponDiscount(coupons[index].discount);
        addTotalAfterDiscount(Number(amount - (amount * coupons[index].discount / 100)));
        return;
      }
      index++;
    }
  };


  useEffect(() => {
    const getData = async () => {
      try {

        const resCode = await fetch(`${API_BASE_URL}/api/coupon/getCoupon?page=0&size=15`);
        if (!resCode.ok) throw new Error("Oops! An error has occured");
        const resJson = await resCode.json();
        setCoupons(resJson.content);
      } catch (err) {

      }
    };
    getData();


  }, []);

  return (
    <div>
      <div className="container mx-auto pb-20">
        <h2 className="text-center text-3xl py-10">Apply Coupon Code</h2>
      </div>
      <div className="cart">

        <input placeholder="Enter Coupon Code" id={id} value={input} onInput={e => setInput(e.target.value)} type="text" className="form-control form-control-solid mb-3 mb-lg-0" autoComplete="off"
        ></input>

        <span style={{ color: "red" }}>
          * required
        </span>
        {/* {products && products.map((product) => {
          if (cartItems[product.id] > 0) {
            return <CartItemFinal data={product} />;
          }
        })} */}
        {totalAmount > 0 ? (
          <div className="checkout">
            <div className="subtotal">
              {couponDiscount ?

                <div>
                  <h1 style={{ textDecoration: 'line-through' }}>
                    Subtotal: ${totalAmount.toLocaleString()}
                  </h1>
                  <h1 style={{ color: "black" }}>
                    Coupon Discount : {couponDiscount} % <br />
                    Subtotal: {amountAfterCoupon.toLocaleString()} INR/-
                  </h1>
                </div>
                : <h2>Subtotal: {totalAmount.toLocaleString()}</h2>
              }





            </div>
            <div className="buttons">

              <button onClick={() => verifyCoupon(input)}> Apply Coupon</button>
              {/* <button onClick={() => navigate("/checkout/")}>Proceed To Checkout</button> */}
            </div>
            <FormDialog />
          </div>

        ) : (
          <h1> Your Shopping Cart is Empty</h1>
        )}
      </div>
    </div>
  )
}

export default CouponCode;
