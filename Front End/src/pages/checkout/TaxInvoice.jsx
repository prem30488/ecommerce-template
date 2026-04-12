import React, { useContext, useEffect, useState } from 'react';
import { API_BASE_URL } from '../../constants/index.jsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';
import { ShopContext } from '../../context/shop-context';
import "./taxInvoice.css";
import { getCurrentDateDDMMYYYY } from '../../util/util';
import { useRef } from "react";
import { useParams } from "react-router-dom";
import { COMPANY_INFO } from '../../constants/companyInfo';
const TaxInvoice = ({ status }) => {
	const { orderId } = useParams();
	const para = useRef(null);
	const { cartItems, martItems, lartItems, freeCartItems, freeMartItems, freeLartItems, getTotalCartAmount, getTotalAfterDiscount, resetCart, getCustomerData, flavorCart, products } = useContext(ShopContext);
	const totalAmount = getTotalCartAmount();
	const formData = getCustomerData();
	const totalAfterDiscount = getTotalAfterDiscount();
	const total = totalAfterDiscount ? totalAfterDiscount : totalAmount;

	const getPriceForSize = (product, size) => {
		const flavorId = flavorCart[`${product.id}_${size}`] || (product.productFlavors && product.productFlavors[0]?.flavor_id) || 1;
		const activeFlavorData = product.productFlavors?.find(pf => String(pf.flavor_id) === String(flavorId));
		if (!activeFlavorData) return 0;
		if (size === "S") return activeFlavorData.price;
		if (size === "M") return activeFlavorData.priceMedium;
		if (size === "L") return activeFlavorData.priceLarge;
		return 0;
	};
	const { cleanCustomerData } = useContext(ShopContext);


	const [isGenerating, setIsGenerating] = useState(false);

	function generatePDF() {
		const element = document.querySelector('#html-template');
		if (!element) return;

		setIsGenerating(true);

		// A4 dimensions: 210mm x 297mm
		const pdf = new jsPDF('p', 'mm', 'a4');

		// PDF page width minus some margin
		const pdfWidth = pdf.internal.pageSize.getWidth();
		const margin = 10;
		const innerWidth = pdfWidth - (margin * 2);

		pdf.html(element, {
			callback: function (doc) {
				doc.save(`Tax_Invoice_${orderId}.pdf`);
				setIsGenerating(false);
			},
			x: margin,
			y: margin,
			width: innerWidth,
			windowWidth: 750, // Fixed width for consistent calculation
			autoPaging: 'text', // Better handling of multi-page
			html2canvas: {
				scale: 0.25, // Adjust quality vs speed
				useCORS: true, // For images from other domains
				logging: false,
				letterRendering: true
			}
		});
	}
	return (
		<div className="invoice-preview-container">
			<div className="invoice-actions">
				<button
					className="btn-generate"
					onClick={generatePDF}
					disabled={isGenerating}
				>
					{isGenerating ? (
						<>
							<i className="fas fa-spinner fa-spin" style={{ marginRight: '10px' }}></i> Generating...
						</>
					) : (
						<>
							<i className="fas fa-file-pdf" style={{ marginRight: '10px' }}></i> Download Tax Invoice
						</>
					)}
				</button>
			</div>

			<div id="html-template" style={{ padding: "60px", width: "100%" }}>
				<div className="invoice-header">
					<div className="brand-section">
						<h1>{COMPANY_INFO.name.split(' ')[0]}</h1>
						<p>{COMPANY_INFO.name.split(' ').slice(1).join(' ')}</p>
						<div className="logo-invoice" style={{ marginBottom: '10px' }}>
							<img src={COMPANY_INFO.logoUrl} alt={COMPANY_INFO.name} title={COMPANY_INFO.name} style={{ height: '40px' }} />
						</div>
						<p style={{ marginTop: '15px' }}>
							{COMPANY_INFO.address1}, {COMPANY_INFO.address2}<br />
							{COMPANY_INFO.city}, {COMPANY_INFO.state} - {COMPANY_INFO.pinCode}<br />
							GSTIN: {COMPANY_INFO.gstin}
						</p>
					</div>
					<div className="invoice-title-section">
						<h2>Tax Invoice</h2>
						<div className="status-badge" style={{ marginTop: '10px' }}>
							Status: <span className={status === "Paid" ? "status-paid" : "status-pending"}>{status || "Pending"}</span>
						</div>
					</div>
				</div>

				<div className="invoice-meta">
					<div className="meta-item">
						<label>Invoice Number</label>
						<span>#{orderId}</span>
					</div>
					<div className="meta-item">
						<label>Date</label>
						<span>{getCurrentDateDDMMYYYY("-")}</span>
					</div>
					<div className="meta-item">
						<label>Payment Method</label>
						<span>{formData.paymentType || "Razorpay Secure"}</span>
					</div>
				</div>

				<div className="address-grid">
					<div className="address-block">
						<h3>Bill To</h3>
						<p className="name">{formData.name}</p>
						<p>{formData.email}</p>
						<p>
							{formData.billingAddress?.street}<br />
							{formData.billingAddress?.city}, {formData.billingAddress?.state}<br />
							{formData.billingAddress?.country} - {formData.billingAddress?.zipcode}
						</p>
						<p>{formData.mobileNumber}</p>
					</div>
					<div className="address-block">
						<h3>Ship To</h3>
						<p className="name">{formData.name}</p>
						<p>{formData.email}</p>
						<p>
							{formData.shippingAddress?.street}<br />
							{formData.shippingAddress?.city}, {formData.shippingAddress?.state}<br />
							{formData.shippingAddress?.country} - {formData.shippingAddress?.zipcode}
						</p>
						<p>{formData.mobileNumber}</p>
					</div>
				</div>

				<table className="invoice-items-table">
					<thead>
						<tr>
							<th style={{ width: '40%' }}>Description</th>
							<th style={{ width: '15%' }}>HSN</th>
							<th style={{ width: '15%' }}>Rate</th>
							<th style={{ width: '15%' }}>Qty</th>
							<th style={{ width: '15%' }}>Amount</th>
						</tr>
					</thead>
					<tbody>
						{products.filter(p => p.active).map(product => {
							const sizes = [
								{ key: 'cartItems', label: 'S', name: 'Small Pack' },
								{ key: 'martItems', label: 'M', name: 'Medium Pack' },
								{ key: 'lartItems', label: 'L', name: 'Large Pack' }
							];

							return sizes.map(sizeInfo => {
								const cartMap = sizeInfo.key === 'cartItems' ? cartItems : (sizeInfo.key === 'martItems' ? martItems : lartItems);

								// Handle the key format: productId_flavorId
								const matchingKeys = Object.keys(cartMap).filter(k => k.startsWith(`${product.id}_`));

								return matchingKeys.map(key => {
									const qty = cartMap[key];
									if (qty <= 0) return null;

									const flavorId = key.split('_')[1];
									const rate = getPriceForSize(product, sizeInfo.label);

									// Simple offer calculation for display
									const offer = product.offers?.[0];
									const discountedRate = offer ? rate * (1 - offer.discount / 100) : rate;
									const amount = discountedRate * qty;

									return (
										<tr key={`${key}_${sizeInfo.label}`}>
											<td>
												<span className="item-desc">{product.title}</span>
												<span className="item-size">{sizeInfo.name} • {product.productFlavors?.find(pf => String(pf.flavor_id) === String(key.split('_')[1]))?.Flavor?.name || "Original"}</span>
											</td>
											<td>{product.hmscode || "3004"}</td>
											<td>₹{rate.toFixed(2)}</td>
											<td>{qty}</td>
											<td>₹{amount.toFixed(2)}</td>
										</tr>
									);
								});
							});
						})}
					</tbody>
				</table>

				{Array.isArray(Object.keys(freeCartItems)) && Object.keys(freeCartItems).length > 0 && (
					<>
						<div className="free-items-banner">Compimentary / Bonus Items</div>
						<table className="invoice-items-table">
							<tbody>
								{products.filter(p => p.active).map(product => {
									const freeSizes = [
										{ key: 'freeCartItems', label: 'S', name: 'Small Pack' },
										{ key: 'freeMartItems', label: 'M', name: 'Medium Pack' },
										{ key: 'freeLartItems', label: 'L', name: 'Large Pack' }
									];

									return freeSizes.map(sizeInfo => {
										const freeCartMap = sizeInfo.key === 'freeCartItems' ? freeCartItems : (sizeInfo.key === 'freeMartItems' ? freeMartItems : freeLartItems);
										const qty = freeCartMap[product.id];
										if (qty > 0) {
											return (
												<tr key={`free_${product.id}_${sizeInfo.label}`}>
													<td style={{ width: '40%' }}>
														<span className="item-desc">{product.title}</span>
														<span className="item-size">{sizeInfo.name} • {product.productFlavors?.find(pf => String(pf.flavor_id) === String(key.split('_')[1]))?.Flavor?.name || "Original"}</span>
													</td>
													<td style={{ width: '15%' }}>{product.hmscode || "3004"}</td>
													<td style={{ width: '15%' }}>₹0.00</td>
													<td style={{ width: '15%' }}>{qty}</td>
													<td style={{ width: '15%' }}>₹0.00</td>
												</tr>
											);
										}
										return null;
									});
								})}
							</tbody>
						</table>
					</>
				)}

				<div className="invoice-summary">
					<div className="summary-table">
						<div className="summary-row">
							<label>Subtotal</label>
							<span>₹{totalAmount.toFixed(2)}</span>
						</div>
						<div className="summary-row">
							<label>Discount</label>
							<span>-₹{(totalAmount - total).toFixed(2)}</span>
						</div>
						<div className="summary-row">
							<label>Estimated Tax (GST 18%)</label>
							<span>₹{(total * 0.18).toFixed(2)}</span>
						</div>
						<div className="summary-row total">
							<label>Total Amount</label>
							<span>₹{(total * 1.18).toFixed(2)}</span>
						</div>
					</div>
				</div>

				<div className="invoice-footer">
					<div className="notes-section">
						<h4>Notes & Terms</h4>
						<p>• A finance charge of 1.5%will be made on unpaid balances after 30 days.</p>
						<p>• Goods once sold will not be taken back or exchanged.</p>
						<p>• This is a computer-generated invoice and does not require a signature.</p>
						<p>• For any queries regarding your order, please contact {COMPANY_INFO.email}</p>
					</div>
					<div className="thank-you-msg">
						Thank you for choosing {COMPANY_INFO.name}. We appreciate your business!
					</div>
				</div>
			</div>
		</div>
	);
};

export default TaxInvoice;
