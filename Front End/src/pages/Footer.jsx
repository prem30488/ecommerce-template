import React from 'react';
import "./Footer.css";
import "./topbutton.css";
import { CaretUp } from "phosphor-react";

import { COMPANY_INFO } from '../constants/companyInfo';
import CompanyGmapInfo from '../components/CompanyGMapInfo';

export default function Footer() {
  const [modal, setModal] = React.useState({ show: false, message: '', isError: false });


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
      <button onClick={topFunction} id="myBtn" title="Go to top"><CaretUp size={24} weight="bold" /></button>

      <a
        href={`https://api.whatsapp.com/send/?phone=${COMPANY_INFO.phone1.replace(/[^0-9]/g, '')}&text=Hi`}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float-btn-global"
        title="Chat with us on WhatsApp"
      >
        {/* <WhatsappLogo size={32} weight="fill" /> */}
        <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24" fill="#ffffff">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.94 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"></path>
        </svg>


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
                <li><a href="/policies/privacy-policy">Privacy Policy</a></li>
                <li><a href="/policies/refund-policy">Refund Policy</a></li>
                <li><a href="/policies/terms-of-use">Terms of Use</a></li>
                <li><a href="/policies/terms-of-service">Terms of Service</a></li>

              </ul>
            </div>

            <div className="footer-col footer-newsletter">
              <h4>Sign Up to Newsletter</h4>
              <p>
                Sign up for our newsletter to receive ₹500 off your first order and exclusive updates on new products and sales.
              </p>
              <form className="newsletter-form" onSubmit={async (e) => {
                e.preventDefault();
                const email = e.target.email.value;
                const btn = e.target.querySelector('button');
                const originalText = btn.innerText;

                try {
                  btn.innerText = '...';
                  btn.disabled = true;

                  const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/newsletter/subscribe`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                  });

                  const data = await response.json();
                  if (data.success) {
                    setModal({ show: true, message: data.message, isError: false });
                    e.target.reset();
                  } else {
                    setModal({ show: true, message: data.message || 'Something went wrong. Please try again.', isError: true });
                  }
                } catch (error) {
                  console.error('Newsletter error:', error);
                  setModal({ show: true, message: 'Failed to connect to the server. Please try again later.', isError: true });
                } finally {
                  btn.innerText = originalText;
                  btn.disabled = false;
                }
              }}>
                <input
                  type="email"
                  name="email"
                  className="newsletter-input"
                  placeholder="Enter your email..."
                  required
                />
                <button type="submit" className="newsletter-btn">SUBSCRIBE</button>
              </form>
            </div>

            {COMPANY_INFO.googleMapLink && (
              <div className="footer-col">
                <h4>Our Location</h4>
                <CompanyGmapInfo height="400" />
              </div>
            )}

          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} {COMPANY_INFO.name}. All Rights Reserved</span>
            <span>Lovingly built by {COMPANY_INFO.name} Team</span>
          </div>
        </div>
      </footer>

      {modal.show && (
        <div className="newsletter-modal-overlay" onClick={() => setModal({ ...modal, show: false })}>
          <div className="newsletter-modal-content" onClick={e => e.stopPropagation()}>
            <div className="newsletter-modal-icon" style={modal.isError ? { background: '#fef2f2', color: '#ef4444' } : {}}>
              {modal.isError ? '!' : '✓'}
            </div>
            <h3>{modal.isError ? 'Oops!' : 'Thank You!'}</h3>
            <p>{modal.message}</p>
            <button className="newsletter-modal-close-btn" onClick={() => setModal({ ...modal, show: false })}>
              {modal.isError ? 'Try Again' : 'Awesome!'}
            </button>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}
