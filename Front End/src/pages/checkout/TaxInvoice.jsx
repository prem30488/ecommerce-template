import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';
import { fetchOrderById } from '../../util/APIUtils';
import "./taxInvoice.css";
import { getCurrentDateDDMMYYYY } from '../../util/util';
import { COMPANY_INFO } from '../../constants/companyInfo';

const TaxInvoice = () => {
	const { orderId } = useParams();
	const [orderData, setOrderData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isGenerating, setIsGenerating] = useState(false);
	const [isPDFDownloaded, setIsPDFDownloaded] = useState(false);

	useEffect(() => {
		const loadOrder = async () => {
			try {
				const response = await fetchOrderById(orderId);
				if (response && response.success) {
					setOrderData(response.order);
				}
			} catch (err) {
				console.error("Failed to fetch order", err);
			} finally {
				setLoading(false);
			}
		};
		loadOrder();
	}, [orderId]);

	function generatePDF() {
		const element = document.querySelector('#html-template');
		if (!element) return;

		setIsGenerating(true);

		const pdf = new jsPDF('p', 'mm', 'a4');
		const pdfWidth = pdf.internal.pageSize.getWidth();
		const margin = 10;
		const innerWidth = pdfWidth - (margin * 2);

		pdf.html(element, {
			callback: function (doc) {
				doc.save(`Tax_Invoice_${orderId}.pdf`);
				setIsGenerating(false);
				setIsPDFDownloaded(true);
			},
			x: margin,
			y: margin,
			width: innerWidth,
			windowWidth: 750,
			autoPaging: 'text',
			html2canvas: {
				scale: 0.25,
				useCORS: true,
				logging: false,
				letterRendering: true
			}
		});
	}

	if (loading) {
		return <div className="invoice-preview-container" style={{ textAlign: 'center', paddingTop: '100px' }}>Loading invoice data...</div>;
	}

	if (!orderData) {
		return <div className="invoice-preview-container" style={{ textAlign: 'center', paddingTop: '100px' }}>Order not found.</div>;
	}

	const formData = orderData.customer || {};
	formData.billingAddress = typeof orderData.billingAddress === 'string' ? JSON.parse(orderData.billingAddress) : (orderData.billingAddress || {});
	formData.shippingAddress = typeof orderData.delieveryAddress === 'string' ? JSON.parse(orderData.delieveryAddress) : (orderData.delieveryAddress || {});
	formData.paymentType = orderData.paymentType;

	const totalAmount = parseFloat(orderData.subTotal || orderData.total || 0);
	const discountAmount = parseFloat(orderData.discountAmount || 0);
	const total = parseFloat(orderData.total || 0);
	const status = orderData.status || "Pending";
	
	const paidItems = orderData.lineItems?.filter(item => item.price > 0) || [];
	const freeItems = orderData.lineItems?.filter(item => item.price === 0) || [];

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

			<div id="html-template">
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
							Status: <span className={status === "Paid" ? "status-paid" : "status-pending"}>{status}</span>
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
							{formData.billingAddress?.addressLine2 && <>{formData.billingAddress.addressLine2}<br /></>}
							{formData.billingAddress?.city}, {formData.billingAddress?.state}<br />
							{formData.billingAddress?.country} - {formData.billingAddress?.zipcode}
						</p>
						<p>{formData.mobileNumber || formData.mobile}</p>
					</div>
					<div className="address-block">
						<h3>Ship To</h3>
						<p className="name">{formData.name}</p>
						<p>{formData.email}</p>
						<p>
							{formData.shippingAddress?.street}<br />
							{formData.shippingAddress?.addressLine2 && <>{formData.shippingAddress.addressLine2}<br /></>}
							{formData.shippingAddress?.city}, {formData.shippingAddress?.state}<br />
							{formData.shippingAddress?.country} - {formData.shippingAddress?.zipcode}
						</p>
						<p>{formData.mobileNumber || formData.mobile}</p>
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
						{paidItems.map((item, index) => {
							const amount = item.price * item.quantity;
							const sizeName = item.size === 'small' ? 'Small Pack' : (item.size === 'medium' ? 'Medium Pack' : (item.size === 'large' ? 'Large Pack' : item.size));
							return (
								<tr key={`paid_${index}`}>
									<td>
										<span className="item-desc">{item.product?.title || 'Unknown Product'}</span>
										<span className="item-size">{sizeName} • {item.flavor}</span>
									</td>
									<td>{item.product?.hmscode || "3004"}</td>
									<td>₹{item.price.toFixed(2)}</td>
									<td>{item.quantity}</td>
									<td>₹{amount.toFixed(2)}</td>
								</tr>
							);
						})}
					</tbody>
				</table>

				{freeItems.length > 0 && (
					<>
						<div className="free-items-banner" style={{ marginTop: '30px', background: '#F8FAFC', padding: '8px 15px', fontWeight: '800', borderLeft: '4px solid #C2410C', fontSize: '0.9rem' }}>
							COMPLIMENTARY GIFTS / BONUS ITEMS
						</div>
						<table className="invoice-items-table">
							<tbody>
								{freeItems.map((item, index) => {
									const sizeName = item.size === 'small' ? 'Small Pack' : (item.size === 'medium' ? 'Medium Pack' : (item.size === 'large' ? 'Large Pack' : item.size));
									return (
										<tr key={`free_${index}`}>
											<td style={{ width: '40%' }}>
												<span className="item-desc">{item.product?.productName || item.product?.title || 'Free Gift'} (Free Gift)</span>
												<span className="item-size">{sizeName}</span>
											</td>
											<td style={{ width: '15%' }}>{item.product?.hmscode || "3004"}</td>
											<td style={{ width: '15%' }}>₹0.00</td>
											<td style={{ width: '15%' }}>{item.quantity}</td>
											<td style={{ width: '15%' }}>₹0.00</td>
										</tr>
									);
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
							<span>-₹{discountAmount.toFixed(2)}</span>
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
						<p>• A finance charge of 1.5% will be made on unpaid balances after 30 days.</p>
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
