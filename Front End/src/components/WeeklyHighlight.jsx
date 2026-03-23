import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/shop-context";
import Alert from "react-s-alert";
import "./weeklyhighlight.css";

/* ── Fallback product when API returns nothing ── */
const WHEY_FALLBACK = {
  id: null,
  title: "Hanley Whey Protein",
  description:
    "Hanley Whey Protein delivers 24g of highly-absorbable protein enhanced with probiotics and enzymes to fuel muscle recovery and support digestive health.",
  img: "/images/hanley-whey-protein.jpg",
  price: 1999,
  rating: "4.9/5",
  stock: 100,
};

/* ── Star rating renderer ── */
const StarRating = ({ rating }) => {
  const score = parseFloat((rating || "0").split("/")[0]);
  const full = Math.floor(score);
  const half = score - full >= 0.5;
  return (
    <span className="wh-stars" aria-label={`Rating ${rating}`}>
      {Array.from({ length: 5 }, (_, i) => {
        if (i < full) return <span key={i} className="wh-star wh-star--filled">★</span>;
        if (i === full && half)
          return <span key={i} className="wh-star wh-star--half">★</span>;
        return <span key={i} className="wh-star">★</span>;
      })}
      <span className="wh-rating-text">{rating}</span>
    </span>
  );
};

const WeeklyHighlight = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, cartItems } = useContext(ShopContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("//localhost:5000/api/product/weeklyBestSeller")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setProduct(data || WHEY_FALLBACK);
        setLoading(false);
      })
      .catch(() => {
        setProduct(WHEY_FALLBACK);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="wh-section">
        <div className="wh-skeleton" aria-busy="true" />
      </section>
    );
  }

  const { id, title, description, img, price, rating, stock } = product;
  const cartCount = id ? (cartItems[id] || 0) : 0;
  const isOutOfStock = stock === 0;

  const handleAddToCart = () => {
    if (!id) {
      Alert.info("Please search for this product on our site!");
      return;
    }
    if (cartCount >= stock) {
      Alert.info("Item is out of stock!");
      return;
    }
    addToCart(id, "S");
    Alert.success(`${title} added to cart!`);
  };

  const handleMoreInfo = () => {
    if (!id) return;
    navigate("/productDetails/" + id);
  };

  return (
    <section className="wh-section">
      {/* Badge strip */}
      <div className="wh-badge-strip">
        <span className="wh-badge-icon">🏆</span>
        <span className="wh-badge-label">Week&apos;s Bestseller</span>
      </div>

      <div className="wh-card">
        {/* Product image */}
        <div className="wh-image-col">
          <div className="wh-image-frame">
            <img
              src={img}
              alt={title}
              className="wh-product-image"
              onError={(e) => {
                e.target.src =
                  "/images/hanley-whey-protein.jpg";
              }}
            />
            <div className="wh-glow" />
          </div>
        </div>

        {/* Product details */}
        <div className="wh-content-col">
          <span className="wh-eyebrow">WEEK'S HIGHLIGHT</span>
          <h2 className="wh-title">{title}</h2>

          <StarRating rating={rating} />

          <p className="wh-description">{description}</p>

          <div className="wh-price-row">
            <span className="wh-price">₹{parseFloat(price).toLocaleString("en-IN")}</span>
            {!isOutOfStock ? (
              <span className="wh-stock-badge wh-stock-badge--in">In Stock</span>
            ) : (
              <span className="wh-stock-badge wh-stock-badge--out">Out of Stock</span>
            )}
          </div>

          <div className="wh-cta-row">
            {/* Add to Cart button — styled consistently with the project */}
            <button
              className="wh-btn wh-btn--cart"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              title={isOutOfStock ? "Out of stock" : "Add to cart"}
            >
              <svg
                className="wh-btn-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {cartCount > 0 ? `Add to Cart (${cartCount})` : "Add to Cart"}
            </button>

            {/* More Info link */}
            {id && (
              <button
                className="wh-btn wh-btn--info"
                onClick={handleMoreInfo}
                title="View full product details"
              >
                More Info
                <svg
                  className="wh-btn-icon wh-btn-icon--right"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}
          </div>

          {/* Social proof */}
          <p className="wh-social-proof">
            ⭐ Trusted by <strong>10,000+</strong> customers this month
          </p>
        </div>
      </div>
    </section>
  );
};

export default WeeklyHighlight;
