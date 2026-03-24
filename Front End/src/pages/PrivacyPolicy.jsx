import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div style={{ backgroundColor: '#fcfdfa', minHeight: '100vh', padding: '120px 20px 80px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: '#ffffff', padding: '60px', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 800, color: '#1a3a3a', marginBottom: '10px', textAlign: 'center' }}>Privacy Policy</h1>
        <p style={{ color: '#667c7c', textAlign: 'center', marginBottom: '40px', fontSize: '16px' }}>Last updated: November 5, 2025</p>

        <div style={{ color: '#334e4e', lineHeight: '1.8', fontSize: '17px' }}>
          <p>
            Hanley Healthcare operates this store and website, including all related information, content, features, tools, products and services, in order to provide you, the customer, with a curated shopping experience (the "Services"). Hanley Healthcare is powered by Shopify, which enables us to provide the Services to you.
          </p>
          <p>
            This Privacy Policy describes how we collect, use, and disclose your personal information when you visit, use, or make a purchase or other transaction using the Services or otherwise communicate with us. If there is a conflict between our Terms of Service and this Privacy Policy, this Privacy Policy controls with respect to the collection, processing, and disclosure of your personal information.
          </p>
          <p>
            Please read this Privacy Policy carefully. By using and accessing any of the Services, you acknowledge that you have read this Privacy Policy and understand the collection, use, and disclosure of your information as described in this Privacy Policy.
          </p>

          <h2 style={{ fontSize: '28px', fontWeight: 700, marginTop: '40px', marginBottom: '20px', color: '#1a3a3a' }}>Personal Information We Collect or Process</h2>
          <p>
            When we use the term "personal information," we are referring to information that identifies or can reasonably be linked to you or another person. We may collect or process the following categories of personal information:
          </p>

          <h3 style={{ fontSize: '22px', fontWeight: 600, marginTop: '30px', marginBottom: '15px' }}>Information we collect directly from you</h3>
          <ul style={{ paddingLeft: '20px' }}>
            <li style={{ marginBottom: '10px' }}><strong>Contact details</strong> including your name, address, phone number, and email.</li>
            <li style={{ marginBottom: '10px' }}><strong>Ordering information</strong> including your name, billing address, shipping address, payment confirmation, and contact details.</li>
            <li style={{ marginBottom: '10px' }}><strong>Account information</strong> including your username, password, and security questions.</li>
            <li style={{ marginBottom: '10px' }}><strong>Shopping information</strong> including the items you view, put in your cart or add to your wishlist.</li>
            <li style={{ marginBottom: '10px' }}><strong>Customer support information</strong> including the information you choose to include in communications with us.</li>
          </ul>

          <h3 style={{ fontSize: '22px', fontWeight: 600, marginTop: '30px', marginBottom: '15px' }}>Information we collect through Cookies</h3>
          <p>
            We also automatically collect certain information about your interaction with the Services ("Usage Data"). To do this, we may use cookies, pixels, and similar technologies. Usage Data may include device information, browser information, information about your network connection, your IP address and other information regarding your interaction with the Services.
          </p>

          <h2 style={{ fontSize: '28px', fontWeight: 700, marginTop: '40px', marginBottom: '20px', color: '#1a3a3a' }}>How We Use Your Personal Information</h2>
          <ul style={{ paddingLeft: '20px' }}>
            <li style={{ marginBottom: '10px' }}><strong>Providing Products and Services:</strong> We use your personal information to provide you with the Services in order to perform our contract with you, including to process your payments, fulfill your orders, to send notifications to you related to you account, purchases, returns, exchanges or other transactions.</li>
            <li style={{ marginBottom: '10px' }}><strong>Marketing and Advertising:</strong> We use your personal information for marketing and promotional purposes, such as to send marketing, advertising and promotional communications by email, text message or postal mail, and to show you advertisements for products or services.</li>
            <li style={{ marginBottom: '10px' }}><strong>Security and Fraud Prevention:</strong> We use your personal information to detect, investigate or take action regarding possible fraudulent, illegal or malicious activity.</li>
            <li style={{ marginBottom: '10px' }}><strong>Communicating with you:</strong> We use your personal information to provide you with customer support and improve our Services.</li>
          </ul>

          <h2 style={{ fontSize: '28px', fontWeight: 700, marginTop: '40px', marginBottom: '20px', color: '#1a3a3a' }}>Storage and Security</h2>
          <p>
            Please be aware that no security measures are perfect or impenetrable, and we cannot guarantee “perfect security.” In addition, any information you send to us may not be secure while in transit. We recommend that you do not use unsecure channels to communicate sensitive or confidential information to us.
          </p>

          <h2 style={{ fontSize: '28px', fontWeight: 700, marginTop: '40px', marginBottom: '20px', color: '#1a3a3a' }}>Contact</h2>
          <p>
            Should you have any questions about our privacy practices or this Privacy Policy, or if you would like to exercise any of the rights available to you, please email us at <strong>info@hanleyhealthcare.com</strong> or contact us at:
          </p>
          <div style={{ backgroundColor: '#f4f9f4', padding: '30px', borderRadius: '16px', borderLeft: '5px solid #4CAF50', marginTop: '20px' }}>
            <p style={{ margin: 0, fontWeight: 700, color: '#1a3a3a' }}>Hanley Healthcare LLP</p>
            <p style={{ margin: '5px 0' }}>S-2, 2nd Floor, Heritage Plaza, Opp. Gurukul,</p>
            <p style={{ margin: '5px 0' }}>Drive-In Road, Ahmedabad,</p>
            <p style={{ margin: '5px 0', fontWeight: 600 }}>Gujarat - 380052, India</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
