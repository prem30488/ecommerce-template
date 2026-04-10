import React from 'react';
import './TermsOfService.css';

const RefundPolicy = () => {
    return (
        <div className="tos-container">
            <div className="tos-content">
                <div className="tos-header">
                    <h1>Refund Policy</h1>
                    <p className="last-updated">Last updated: November 5, 2025</p>
                </div>

                <div className="tos-body">
                    <p>
                        We have a <strong>7-day return policy</strong>, which means you have 7 days after receiving your item to request a return.
                    </p>
                    <p>
                        To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You’ll also need the receipt or proof of purchase.
                    </p>

                    <div className="tos-section">
                        <h2>Starting a Return</h2>
                        <p>To start a return, you can contact us at <span className="link-highlight">Info@hanleyhealthcare.com</span>.</p>
                        <p>
                            If your return is accepted, we’ll send you a return shipping label, as well as instructions on how and where to send your package. Items sent back to us without first requesting a return will not be accepted.
                        </p>
                    </div>

                    <div className="tos-section">
                        <h2>Damages and Issues</h2>
                        <p>
                            Please inspect your order upon reception and contact us immediately if the item is defective, damaged or if you receive the wrong item, so that we can evaluate the issue and make it right.
                        </p>
                    </div>

                    <div className="tos-section">
                        <h2>Exceptions / Non-returnable Items</h2>
                        <p>
                            Certain types of items cannot be returned, like perishable goods (such as food, flowers, or plants), custom products, and personal care goods. We also do not accept returns for hazardous materials, flammable liquids, or gases.
                        </p>
                        <blockquote>
                            Unfortunately, we cannot accept returns on sale items or gift cards.
                        </blockquote>
                    </div>

                    <div className="tos-section">
                        <h2>Exchanges</h2>
                        <p>
                            The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item.
                        </p>
                    </div>

                    <div className="tos-section">
                        <h2>Refunds</h2>
                        <p>
                            We will notify you once we’ve received and inspected your return, and let you know if the refund was approved or not. If approved, you’ll be automatically refunded on your original payment method within 10 business days.
                        </p>
                        <p>
                            If more than 15 business days have passed since we’ve approved your return, please contact us at <span className="link-highlight">Info@hanleyhealthcare.com</span>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RefundPolicy;
