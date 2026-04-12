import React from 'react';
import { COMPANY_INFO } from '../constants/companyInfo';
import './TermsOfService.css';

const PrivacyPolicy = () => {
    return (
        <div className="tos-container">
            <div className="tos-content">
                <div className="tos-header">
                    <h1>Privacy Policy</h1>
                    <p className="last-updated">Last updated: November 5, 2025</p>
                </div>

                <div className="tos-body">
                    <p>
                        {COMPANY_INFO.name} operates this store and website, including all related information, content, features, tools, products and services, in order to provide you, the customer, with a curated shopping experience (the "Services"). {COMPANY_INFO.name} is powered by Shopify, which enables us to provide the Services to you.
                    </p>
                    <p>
                        This Privacy Policy describes how we collect, use, and disclose your personal information when you visit, use, or make a purchase or other transaction using the Services or otherwise communicate with us.
                    </p>

                    <div className="tos-section">
                        <h2>Personal Information We Collect</h2>
                        <p>When we use the term "personal information," we are referring to information that identifies or can reasonably be linked to you or another person. We may collect or process the following:</p>
                        
                        <h3>Information we collect directly from you</h3>
                        <ul>
                            <li><strong>Contact details:</strong> including your name, address, phone number, and email.</li>
                            <li><strong>Ordering information:</strong> including your name, billing address, shipping address, and payment confirmation.</li>
                            <li><strong>Account information:</strong> including your username, password, and security questions.</li>
                            <li><strong>Shopping information:</strong> including the items you view, put in your cart or add to your wishlist.</li>
                        </ul>

                        <h3>Information we collect through Cookies</h3>
                        <p>We automatically collect certain information about your interaction with the Services ("Usage Data"). To do this, we may use cookies, pixels, and similar technologies.</p>
                    </div>

                    <div className="tos-section">
                        <h2>How We Use Your Personal Information</h2>
                        <ul>
                            <li><strong>Providing Products and Services:</strong> Fulfilling orders, processing payments, and sending notifications.</li>
                            <li><strong>Marketing and Advertising:</strong> Sending promotional communications and showing targeted advertisements.</li>
                            <li><strong>Security and Fraud Prevention:</strong> Detecting and investigating possible fraudulent activity.</li>
                            <li><strong>Customer Support:</strong> Improving our Services and communicating with you.</li>
                        </ul>
                    </div>

                    <div className="tos-section">
                        <h2>Storage and Security</h2>
                        <p>
                            Please be aware that no security measures are perfect or impenetrable, and we cannot guarantee “perfect security.” In addition, any information you send to us may not be secure while in transit. We recommend that you do not use unsecure channels to communicate sensitive or confidential information to us.
                        </p>
                    </div>

                    <div className="tos-section">
                        <h2>Contact</h2>
                        <p>Should you have any questions about our privacy practices, please email us at <span className="link-highlight">{COMPANY_INFO.email}</span> or contact us at:</p>
                        
                        <div className="contact-box">
                            <h3>{COMPANY_INFO.name}</h3>
                            <p>{COMPANY_INFO.address1},</p>
                            <p>{COMPANY_INFO.address2}, {COMPANY_INFO.city},</p>
                            <p>{COMPANY_INFO.state} - {COMPANY_INFO.pinCode}, India</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
