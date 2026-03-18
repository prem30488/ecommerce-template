import React, { useContext, useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ShopContext } from '../../context/shop-context';
import "./taxInvoice.css";
import { getCurrentDateDDMMYYYY } from '../../util/util';
import { useRef } from "react";
import { useParams } from "react-router-dom";
const TaxInvoice = ({ status }) => {
	const { orderId } = useParams();
	const para = useRef(null);
	const { cartItems, martItems, lartItems, freeCartItems, freeMartItems, freeLartItems, getTotalCartAmount, getTotalAfterDiscount, resetCart, getCustomerData } = useContext(ShopContext);
	const totalAmount = getTotalCartAmount();
	const formData = getCustomerData();
	const totalAfterDiscount = getTotalAfterDiscount();
	const total = totalAfterDiscount ? totalAfterDiscount : totalAmount;
	// const [items, setItems] = useState([
	//  // { id: 1, description: 'Item 1', quantity: 2, price: 10 },
	//  // { id: 2, description: 'Item 2', quantity: 1, price: 15 },
	//   // Add more items as needed
	// ]);
	const [products, setProducts] = useState([]);
	const { cleanCustomerData } = useContext(ShopContext);
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

	function generatePDF() {


		var doc = new jsPDF('1', 'mm', [1400, 1410]);
		var pdfjs = document.querySelector('#html-template');
		// Convert HTML invoice template source into PDF in JavaScript   
		doc.html(pdfjs, {
			callback: function (doc) {
				doc.save("Tax Invoice.pdf");
			},
			x: 10,
			y: 10
		});
		//cleanCustomerData();
	}
	return (
		<React.Fragment>
			<div style={{ paddingTop: "100px" }}></div>
			<p>
				Dear, {formData.name} , Thank you for shopping with us. Please download Tax Invoice for your order. Your order will take 3-5 working days to be delievered.
			</p>
			<div id="html-template" style={{ padding: "50px", width: "100%", height: "100%" }}>
				<table id="my-table" style={{ width: "100%", height: "100%" }}>
					<tr style={{ width: "100%", height: "100%" }}> <td style={{ width: "100%", height: "100%" }}>
						<header>
							<h1>Tax Invoice</h1>
							<address >
								<b><p>Hanley Healthcare LLP<br />Vatva GIDC, Ahmedabad, 382006</p></b>
							</address>
							<br /><br /><br />
							<p>Billing Address :</p>
							<address>
								<p>{formData.name}</p>
								<p>{formData.email}</p>
								<p>{formData.billingAddress.street}<br />{formData.billingAddress.city},{formData.billingAddress.state},{formData.billingAddress.country} - {formData.billingAddress.zipcode}</p>
								<p>{formData.mobileNumber}</p>
							</address>
							<br /><br /><br /><br /><br />
							<p>Delievery Address :</p>
							<address>
								<p>{formData.name}</p>
								<p>{formData.email}</p>
								<p>{formData.shippingAddress.street}<br />{formData.shippingAddress.city},{formData.shippingAddress.state},{formData.shippingAddress.country} - {formData.shippingAddress.zipcode}</p>
								<p>{formData.mobileNumber}</p>
							</address>
							<span><img alt="" src="http://www.jonathantneal.com/examples/invoice/logo.png" /></span>
						</header>
						<article>
							<table class="meta">
								<tr>
									<th><span>Invoice #</span></th>
									<td><span>{orderId}</span></td>
								</tr>
								<tr>
									<th><span >Date</span></th>
									<td><span >{getCurrentDateDDMMYYYY("-")}</span></td>
								</tr>
							</table>
							<table class="inventory">
								<thead>
									<tr>
										<th><span >Item</span></th>
										<th><span >HSN Code</span></th>
										<th><span >Rate</span></th>
										<th><span >Quantity</span></th>
										<th><span >Price</span></th>
									</tr>
								</thead>
								<tbody>
									{products.filter((p1) => p1.active === true).map((product1) => {
										if (cartItems[product1.id] > 0) {
											//return <CartItemFinal data={product} />;
											return <tr>
												<td><span >{product1.title}</span></td>
												<td><span >{product1.hmscode}</span></td>
												<td><span data-prefix>INR </span><span>{product1.price} - Small pack</span></td>
												<td><span >{cartItems[product1.id]}</span></td>
												<td><span data-prefix>INR </span><span>{product1.offers[0] ? product1.price - (product1.price * product1.offers[0].discount / 100) : product1.price}</span></td>
											</tr>;
										}
									})}

									{products.filter((p2) => p2.active === true).map((product2) => {
										if (martItems[product2.id] > 0) {
											//return <CartItemFinal data={product} />;
											return <tr>
												<td><span >{product2.title}</span></td>
												<td><span >{product2.hmscode}</span></td>
												<td><span data-prefix>INR </span><span>{product2.priceMedium} - Medium Pack</span></td>
												<td><span >{martItems[product2.id]}</span></td>
												<td><span data-prefix>INR </span><span>{product2.offers[0] ? product2.priceMedium - (product2.priceMedium * product2.offers[0].discount / 100) : product2.priceMedium}</span></td>
											</tr>;
										}
									})}

									{products.filter((p3) => p3.active === true).map((product3) => {
										if (lartItems[product3.id] > 0) {
											//return <CartItemFinal data={product} />;
											return <tr>
												<td><span >{product3.title}</span></td>
												<td><span >{product3.hmscode}</span></td>
												<td><span data-prefix>INR </span><span>{product3.priceLarge} - Large Pack</span></td>
												<td><span >{lartItems[product3.id]}</span></td>
												<td><span data-prefix>INR </span><span>{product3.offers[0] ? product3.priceLarge - (product3.priceLarge * product3.offers[0].discount / 100) : product3.priceLarge}</span></td>
											</tr>;
										}
									})}

								</tbody>
							</table>
							<div>Free Items (if any as per offers):</div>
							<table class="inventory">
								<thead>
									<tr>
										<th><span >Item</span></th>
										<th><span >HSN Code</span></th>
										<th><span >Rate</span></th>
										<th><span >Quantity</span></th>
										<th><span >Price</span></th>
									</tr>
								</thead>
								<tbody>
									{products.filter((p1) => p1.active === true).map((product1) => {
										if (freeCartItems[product1.id] > 0) {
											//return <CartItemFinal data={product} />;
											return <tr>
												<td><span >{product1.title}</span></td>
												<td><span >{product1.hmscode}</span></td>
												<td><span data-prefix>INR </span><span>0.0 - Small pack</span></td>
												<td><span >{freeCartItems[product1.id]}</span></td>
												<td><span data-prefix>INR </span><span>0.0</span></td>
											</tr>;
										}
									})}

									{products.filter((p2) => p2.active === true).map((product2) => {
										if (freeMartItems[product2.id] > 0) {
											//return <CartItemFinal data={product} />;
											return <tr>
												<td><span >{product2.title}</span></td>
												<td><span >{product2.hmscode}</span></td>
												<td><span data-prefix>INR </span><span>0.0 - Medium Pack</span></td>
												<td><span >{freeMartItems[product2.id]}</span></td>
												<td><span data-prefix>INR </span><span>0.0</span></td>
											</tr>;
										}
									})}

									{products.filter((p3) => p3.active === true).map((product3) => {
										if (freeLartItems[product3.id] > 0) {
											//return <CartItemFinal data={product} />;
											return <tr>
												<td><span >{product3.title}</span></td>
												<td><span >{product3.hmscode}</span></td>
												<td><span data-prefix>INR </span><span>0.0 - Large Pack</span></td>
												<td><span >{freeLartItems[product3.id]}</span></td>
												<td><span data-prefix>INR </span><span>0.0</span></td>
											</tr>;
										}
									})}

								</tbody>
							</table>
							<table class="balance">
								<tr>
									<th><span >Total</span></th>
									<td><span data-prefix>INR </span><span>${total}</span></td>
								</tr>

								<tr>
									<th><span >Tax(GST)</span></th>
									<td><span data-prefix>INR </span><span>${total * 18 / 100}</span></td>
								</tr>
								<tr>
									<th><span >Amount Paid</span></th>
									<td><span data-prefix>INR </span><span contenteditable>{status === "Paid" ? total + (total * 18 / 100) : 0.00} </span></td>
								</tr>
								<tr>
									<th><span >Balance Due</span></th>
									<td><span data-prefix>INR </span><span>{total + (total * 18 / 100)}</span></td>
								</tr>
							</table>
						</article>
					</td>
					</tr>
				</table>
				<aside>
					<h1><span >Additional Notes</span></h1>
					<div contenteditable>
						<p>A finance charge of 1.5% will be made on unpaid balances after 30 days.</p>
					</div>
				</aside>

			</div>
			<div className="buttons">
				{/* <button >Pay</button>  */}
				<button onClick={generatePDF}>Generate PDF</button>
			</div>
		</React.Fragment>
	);
};

export default TaxInvoice;
