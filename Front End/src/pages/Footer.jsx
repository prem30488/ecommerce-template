import React from 'react';
import "./Footer.css";
import "./topbutton.css";
export default function Footer() {

  // When the user scrolls down 20px from the top of the document, show the button
  window.onscroll = function() {
    scrollFunction()
  };

  function scrollFunction() {
    if (document.body.scrollTop > 20
        || document.documentElement.scrollTop > 20) {
      document.getElementById("myBtn").style.display = "block";
    } else {
      document.getElementById("myBtn").style.display = "none";
    }
  }

  // When the user clicks on the button, scroll to the top of the document
  function topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  }


  return (
    <React.Fragment>
      <button onClick={topFunction} id="myBtn" title="Go to top">Top</button>
<footer>
        <div className="footer-content">
            <h3>Hanley Healthcare LLP</h3>
            <p>Hanley Healthcare is a blog website where you will find great tutorials on web design and development. Here each tutorial is beautifully described step by step with the required source code.</p>
            <ul className="socials">
                <li><a href="#"><i className
="fa fa-facebook"></i></a></li>
                <li><a href="#"><i className
="fa fa-twitter"></i></a></li>
                <li><a href="#"><i className
="fa fa-google-plus"></i></a></li>
                <li><a href="#"><i className="fa fa-youtube"></i></a></li>
                <li><a href="#"><i className="fa fa-linkedin-square"></i></a></li>
            </ul>
        </div>
        <div className="footer-bottom">
            <p>copyright &copy; 2023 <a href="#">Hanley Healthcare LLP</a>  powered by Parth Microsys</p>
                    <div className="footer-menu">
                      <ul className="f-menu">
                        <li><a href="/">Home</a></li>
                        <li><a href="/about">About Us</a></li>
                        <li><a href="/contact">Contact Us</a></li>

                        <li><a href="/refundPolicy">Refund policy</a></li>
                        <li><a href="/privacyPolicy">Privacy Policy</a></li>
                        <li><a href="/shippinganddelievery">Shipping & Delivery</a></li>
                        <li><a href="#">Track Order</a></li>



                        <li><a href="/productMen">Products</a></li>
                         <li><a href="/Signin">Signin</a></li> 
                      </ul>
                    </div>
        </div>

    </footer>
    </React.Fragment>
  );
}
