import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { ShopContext } from '../../context/shop-context';
import { useContext, useEffect } from "react";

import { CartItemFinal } from "../cart/cart-item-Final";
import { MartItemFinal } from "../cart/mart-item-Final";
import { LartItemFinal } from "../cart/lart-item-Final";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from 'yup';
import CheckoutForm from "./CheckoutForm";
export default function FormDialog() {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [openDialog2, setOpenDialog2] = useState(false);
  const { resetCart, cleanTotalAfterDiscount, cleanCustomerData } = useContext(ShopContext);
  const [orderId, setOrderId] = useState(0);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpenDialog2 = (id) => {
    setOpenDialog2(true);
    setOrderId(id);
  };

  const handleCloseDialog2 = () => {
    // insert order details in database here
    setOpenDialog2(false);
    handleClose();
    navigate("/previewInvoice/" + orderId);
    //resetCart();
    //cleanTotalAfterDiscount();
    //cleanCustomerData();
  };
  //const { id } = useParams();
  const { cartItems, lartItems, martItems, getTotalCartAmount, getTotalAfterDiscount } = useContext(ShopContext);
  const [products, setProducts] = useState([]);
  const totalAmount = getTotalCartAmount();
  let total = totalAmount;
  const totalAfterDiscount = getTotalAfterDiscount();



  useEffect(() => {
    const getData = async () => {
      try {

        const res = await fetch("http://localhost:3000/api/product/getProducts?page=0&size=1000&sorted=true");
        if (!res.ok) throw new Error("Oops! An error has occured");
        const json = await res.json();

        setProducts(json.content);
        //id?total=id:total=totalAmount;
        totalAfterDiscount ? total = totalAfterDiscount : total = totalAmount;
      } catch (err) {

      }
    };
    getData();
  }, []);


  return (
    <React.Fragment>
      <Button variant="outlined" onClick={handleClickOpen}>
        Proceed To Checkout
      </Button>
      <h1>Checkout Form</h1>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Checkout Form</DialogTitle>
        <DialogContent>
          <div>
            <div className="container mx-auto pb-20">
              <h2 className="text-center text-3xl py-10">Checkout</h2>
            </div>
            <div className="cart">

              {/* {products.map((product) => {
          if (cartItems[product.id] > 0) {
            return <CartItemFinal data={product} />;
          }
        })}

        {products.map((product) => {
          if (martItems[product.id] > 0) {
            return <MartItemFinal data={product} />;
          }
        })}

        {products.map((product) => {
          if (lartItems[product.id] > 0) {
            return <LartItemFinal data={product} />;
          }
        })} */}
              {totalAmount > 0 ? (
                <div className="checkout">
                  <div className="subtotal">
                    {
                      totalAfterDiscount ? <div>
                        <h2 style={{ textDecoration: "line-through" }}>Subtotal: {totalAmount.toLocaleString()}</h2>
                        <h2 style={{ color: "goldenrod" }}>Subtotal: {totalAfterDiscount} INR/-</h2>
                      </div>
                        :
                        <h2>Subtotal: {totalAmount.toLocaleString()} INR/-</h2>
                    }

                  </div>
                  {
                    totalAfterDiscount ?
                      <CheckoutForm subTtotal={totalAmount} total={totalAfterDiscount} callbackFn={handleOpenDialog2} />
                      : <CheckoutForm subTotal={totalAmount} total={totalAmount} callbackFn={handleOpenDialog2} />}
                </div>

              ) : (
                <h1> Your Shopping Cart is Empty</h1>
              )}
            </div>
          </div>
        </DialogContent>

        <DialogActions>

        </DialogActions>
      </Dialog>
      <Dialog open={openDialog2} onClose={handleCloseDialog2}>
        <DialogTitle>Secure Payment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <h1>Please pay using below upi scan.</h1>
            <img src="./images/gpay.jpeg" />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog2}>Close</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
