import React from 'react';

const RefundPolicy = () => {
  return (
    <div style={{ backgroundColor: '#fcfdfa', minHeight: '100vh', padding: '120px 20px 80px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: '#ffffff', padding: '60px', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 800, color: '#1a3a3a', marginBottom: '10px', textAlign: 'center' }}>Refund Policy</h1>
        <p style={{ color: '#667c7c', textAlign: 'center', marginBottom: '40px', fontSize: '16px' }}>Last updated: November 5, 2025</p>

        <div style={{ color: '#334e4e', lineHeight: '1.8', fontSize: '17px' }}>
          <p>
            We have a 7-day return policy, which means you have 7 days after receiving your item to request a return.
          </p>
          <p>
            To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You’ll also need the receipt or proof of purchase.
          </p>
          <p>
            To start a return, you can contact us at <strong>Info@hanleyhealthcare.com</strong>.
          </p>
          <p>
            If your return is accepted, we’ll send you a return shipping label, as well as instructions on how and where to send your package. Items sent back to us without first requesting a return will not be accepted.
          </p>

          <h2 style={{ fontSize: '28px', fontWeight: 700, marginTop: '40px', marginBottom: '20px', color: '#1a3a3a' }}>Damages and Issues</h2>
          <p>
            Please inspect your order upon reception and contact us immediately if the item is defective, damaged or if you receive the wrong item, so that we can evaluate the issue and make it right.
          </p>

          <h2 style={{ fontSize: '28px', fontWeight: 700, marginTop: '40px', marginBottom: '20px', color: '#1a3a3a' }}>Exceptions / Non-returnable Items</h2>
          <p>
            Certain types of items cannot be returned, like perishable goods (such as food, flowers, or plants), custom products (such as special orders or personalized items), and personal care goods (such as beauty products). We also do not accept returns for hazardous materials, flammable liquids, or gases. Please get in touch if you have questions or concerns about your specific item.
          </p>
          <p>
            Unfortunately, we cannot accept returns on sale items or gift cards.
          </p>

          <h2 style={{ fontSize: '28px', fontWeight: 700, marginTop: '40px', marginBottom: '20px', color: '#1a3a3a' }}>Exchanges</h2>
          <p>
            The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item.
          </p>

          <h2 style={{ fontSize: '28px', fontWeight: 700, marginTop: '40px', marginBottom: '20px', color: '#1a3a3a' }}>European Union 14-day Cooling Off Period</h2>
          <p>
            Notwithstanding the above, if the merchandise is being shipped into the European Union, you have the right to cancel or return your order within 14 days, for any reason and without a justification. As above, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You’ll also need the receipt or proof of purchase.
          </p>

          <h2 style={{ fontSize: '28px', fontWeight: 700, marginTop: '40px', marginBottom: '20px', color: '#1a3a3a' }}>Refunds</h2>
          <p>
            We will notify you once we’ve received and inspected your return, and let you know if the refund was approved or not. If approved, you’ll be automatically refunded on your original payment method within 10 business days. Please remember it can take some time for your bank or credit card company to process and post the refund too.
          </p>
          <p>
            If more than 15 business days have passed since we’ve approved your return, please contact us at <strong>Info@hanleyhealthcare.com</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
