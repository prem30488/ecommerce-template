import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { COMPANY_INFO } from '../../../../constants/companyInfo';
import "../../../checkout/taxInvoice.css";

export const AdminInvoice = ({ order, onGenerated }) => {
    
    useEffect(() => {
        if (!order) return;
        
        const generate = async () => {
            const element = document.querySelector('#admin-html-template-' + order.id);
            if (!element) return;

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const margin = 10;
            const innerWidth = pdfWidth - (margin * 2);

            pdf.html(element, {
                callback: function (doc) {
                    doc.save(`Tax_Invoice_Admin_${order.id}.pdf`);
                    if (onGenerated) onGenerated();
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
        };

        // Small delay to ensure DOM is fully painted
        setTimeout(generate, 300);
    }, [order]);

    if (!order) return null;

    return (
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '750px', background: 'white' }}>
            <div id={`admin-html-template-${order.id}`} style={{ padding: "60px", width: "100%", background: 'white' }}>
                <div className="invoice-header">
                    <div className="brand-section">
                        <h1>{COMPANY_INFO.name.split(' ')[0]}</h1>
                        <p>{COMPANY_INFO.name.split(' ').slice(1).join(' ')}</p>
                        <div className="logo-invoice" style={{ marginBottom: '10px' }}>
                            <img src={COMPANY_INFO.logoUrl} alt={COMPANY_INFO.name} style={{ height: '40px' }} />
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
                            Status: <span className={order.status === "Paid" ? "status-paid" : "status-pending"}>{order.status || "Pending"}</span>
                        </div>
                    </div>
                </div>

                <div className="invoice-meta">
                    <div className="meta-item">
                        <label>Invoice Number</label>
                        <span>#{order.id}</span>
                    </div>
                    <div className="meta-item">
                        <label>Date</label>
                        <span>{new Date(order.createdAt || order.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="meta-item">
                        <label>Payment Method</label>
                        <span>{order.paymentType || "Razorpay Secure"}</span>
                    </div>
                </div>

                <div className="address-grid">
                    <div className="address-block">
                        <h3>Bill To</h3>
                        <p className="name">{order.customer?.name || 'Guest'}</p>
                        <p>{order.customer?.email}</p>
                        <p>
                            {order.billingAddress?.street || ''}<br />
                            {order.billingAddress?.city || ''}, {order.billingAddress?.state || ''}<br />
                            {order.billingAddress?.country || ''} - {order.billingAddress?.zipcode || ''}
                        </p>
                        <p>{order.customer?.mobile}</p>
                    </div>
                    <div className="address-block">
                        <h3>Ship To</h3>
                        <p className="name">{order.customer?.name || 'Guest'}</p>
                        <p>{order.customer?.email}</p>
                        <p>
                            {order.delieveryAddress?.street || ''}<br />
                            {order.delieveryAddress?.city || ''}, {order.delieveryAddress?.state || ''}<br />
                            {order.delieveryAddress?.country || ''} - {order.delieveryAddress?.zipcode || ''}
                        </p>
                        <p>{order.customer?.mobile}</p>
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
                        {(order.lineItems || []).map((item, idx) => {
                            const rate = (item.price || 0) > 0 ? item.price : ((order.subTotal || order.total) / (order.lineItems?.length || 1));
                            const qty = item.quantity || 1;
                            const amount = rate * qty;
                            return (
                                <tr key={idx}>
                                    <td>
                                        <span className="item-desc">{item.product?.title || 'Unknown Product'}</span>
                                        <span className="item-size">{item.size || '-'} • {item.flavor || 'Original'}</span>
                                    </td>
                                    <td>{item.product?.hmscode || "3004"}</td>
                                    <td>₹{rate.toFixed(2)}</td>
                                    <td>{qty}</td>
                                    <td>₹{amount.toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <div className="invoice-summary">
                    <div className="summary-table">
                        <div className="summary-row">
                            <label>Subtotal</label>
                            <span>₹{parseFloat(order.subTotal || order.total).toFixed(2)}</span>
                        </div>
                        <div className="summary-row total">
                            <label>Total Amount</label>
                            <span>₹{parseFloat(order.total).toFixed(2)}</span>
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
