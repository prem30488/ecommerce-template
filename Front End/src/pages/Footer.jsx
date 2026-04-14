import React from 'react';
import "./Footer.css";
import "./topbutton.css";
import { WhatsappLogo } from "phosphor-react";
import { COMPANY_INFO } from '../constants/companyInfo';
export default function Footer() {

  // When the user scrolls down 20px from the top of the document, show the button
  React.useEffect(() => {
    const scrollFunction = () => {
      const myBtn = document.getElementById("myBtn");
      if (myBtn) {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
          myBtn.style.display = "block";
        } else {
          myBtn.style.display = "none";
        }
      }
    };

    window.addEventListener("scroll", scrollFunction);
    return () => window.removeEventListener("scroll", scrollFunction);
  }, []);

  // When the user clicks on the button, scroll to the top of the document
  function topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  }


  return (
    <React.Fragment>
      <button onClick={topFunction} id="myBtn" title="Go to top">Top</button>
      <a
        href={`https://api.whatsapp.com/send/?phone=${COMPANY_INFO.phone1.replace(/[^0-9]/g, '')}&text=Hi`}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float-btn-global"
        title="Chat with us on WhatsApp"
      >
        <WhatsappLogo size={32} weight="fill" />
      </a>

      <footer className="hanley-footer">
        <div className="footer-container">
          <div className="footer-top">

            <div className="footer-col">
              <h4>About {COMPANY_INFO.name.split(' ')[0]}</h4>
              <p>
                {COMPANY_INFO.seoDescription}
              </p>
              <div className="footer-contact-info">
                <span>{COMPANY_INFO.city}, {COMPANY_INFO.country || 'India'}</span>
                <span>{COMPANY_INFO.phone1}</span>
                <span>{COMPANY_INFO.email}</span>
              </div>
              <ul className="footer-socials">
                <li><a href="#"><i className="fa fa-instagram"></i></a></li>
                <li><a href="#"><i className="fa fa-youtube-play"></i></a></li>
                <li><a href="#"><i className="fa fa-facebook"></i></a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Quick links</h4>
              <ul className="footer-links">
                <li><a href="/advancedSearch">Search</a></li>
                <li><a href="/">Home</a></li>
                <li><a href="/products">All Products</a></li>
                <li><a href="/about">About</a></li>
                <li><a href="/contact">Contact</a></li>
                <li><a href="/your-wishlist">Wishlist</a></li>
                <li><a href="/SignIn">SignIn</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Policies</h4>
              <ul className="footer-links">
                <li><a href="/contact">Contact Information</a></li>
                <li><a href="/policies/privacy-policy">Privacy Policy</a></li>
                <li><a href="/policies/refund-policy">Refund Policy</a></li>
                <li><a href="/policies/terms-of-use">Terms of Use</a></li>

              </ul>
            </div>

            <div className="footer-col footer-newsletter">
              <h4>Sign Up to Newsletter</h4>
              <p>
                Sign up for our newsletter to receive ₹500 off your first order and exclusive updates on new products and sales.
              </p>
              <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  className="newsletter-input"
                  placeholder="Enter your email..."
                  required
                />
                <button type="submit" className="newsletter-btn">SUBSCRIBE</button>
              </form>
            </div>

          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} {COMPANY_INFO.name}. All Rights Reserved</span>
            <span>Lovingly built by {COMPANY_INFO.name} Team</span>
          </div>
        </div>
      </footer>
    </React.Fragment>
  );
}
