import React from 'react';
import './TermsOfService.css';

const TermsOfService = () => {
    return (
        <div className="tos-container">
            <div className="tos-content">
                <div className="tos-header">
                    <h1>Terms of Service</h1>
                    <p className="last-updated">Last updated: November 5, 2025</p>
                </div>

                <div className="tos-body">
                    <blockquote>
                        OVERVIEW: This website is operated by Hanley Healthcare. Throughout the site, the terms “we”, “us” and “our” refer to Hanley Healthcare.
                    </blockquote>

                    <p>
                        Hanley Healthcare offers this website, including all information, tools and Services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.
                    </p>

                    <p>
                        By visiting our site and/ or purchasing something from us, you engage in our “Service” and agree to be bound by the following terms and conditions (“Terms of Service”, “Terms”), including those additional terms and conditions and policies referenced herein and/or available by hyperlink.
                    </p>

                    <div className="tos-section">
                        <h2>SECTION 1 - ONLINE STORE TERMS</h2>
                        <p>By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence.</p>
                        <ul>
                            <li>You may not use our products for any illegal or unauthorized purpose.</li>
                            <li>You must not transmit any worms or viruses or any code of a destructive nature.</li>
                            <li>A breach or violation of any of the Terms will result in an immediate termination of your Services.</li>
                        </ul>
                    </div>

                    <div className="tos-section">
                        <h2>SECTION 2 - GENERAL CONDITIONS</h2>
                        <p>We reserve the right to refuse Service to anyone for any reason at any time. You understand that your content (not including credit card information), may be transferred unencrypted and involve transmissions over various networks.</p>
                    </div>

                    <div className="tos-section">
                        <h2>SECTION 3 - ACCURACY OF INFORMATION</h2>
                        <p>We are not responsible if information made available on this site is not accurate, complete or current. The material on this site is provided for general information only.</p>
                    </div>

                    <div className="tos-section">
                        <h2>SECTION 4 - MODIFICATIONS</h2>
                        <p>Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service without notice.</p>
                    </div>

                    <div className="tos-section">
                        <h2>SECTION 5 - PRODUCTS OR SERVICES</h2>
                        <p>Certain products or Services may be available exclusively online through the website. We have made every effort to display as accurately as possible the colors and images of our products.</p>
                        <p>Review our <a href="/policies/refund-policy" className="link-highlight">Refund Policy</a> for more details.</p>
                    </div>

                    <div className="tos-section">
                        <h2>SECTION 6 - BILLING ACCURACY</h2>
                        <p>We reserve the right to refuse any order you place with us. In the event that we make a change to or cancel an order, we may attempt to notify you via email or billing address.</p>
                    </div>

                    <div className="tos-section">
                        <h2>SECTION 12 - PROHIBITED USES</h2>
                        <p>You are prohibited from using the site or its content for any unlawful purpose, to solicit others to perform or participate in any unlawful acts, or to infringe upon or violate our intellectual property rights.</p>
                    </div>

                    <div className="tos-section">
                        <h2>SECTION 13 - LIMITATION OF LIABILITY</h2>
                        <p>Hanley Healthcare does not guarantee that your use of our Service will be uninterrupted, timely, secure or error-free. In no case shall Hanley Healthcare, our directors, or employees be liable for any injury, loss, or claim.</p>
                    </div>

                    <div className="tos-section">
                        <h2>SECTION 20 - CONTACT INFORMATION</h2>
                        <p>Questions about the Terms of Service should be sent to us at <span className="link-highlight">Info@hanleyhealthcare.com</span>.</p>
                        
                        <div className="contact-box">
                            <h3>Hanley Healthcare LLP</h3>
                            <p>Plot No. 233, Pushpam Industrial Estate,</p>
                            <p>Vatwa G.I.D.C. Phase 1, Vatva, Ahmedabad,</p>
                            <p>Gujarat - 382445, India</p>
                            <p><strong>Phone:</strong> +91 7777936090</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
