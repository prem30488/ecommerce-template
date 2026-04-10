import PropTypes from 'prop-types';
import React, { useEffect, useState } from "react";
import ImageCarousel from "../../../../pages/productDetails/ImageCarousel";

// ── Field order for the card body ──────────────────────────
const BODY_FIELDS = ["title", "categories", "audience", "price", "bestseller", "featured", "discount"];

// Functional wrapper
function ResultCard({ bootstrapCss, doc, fields, onSelect }) {
  const get = (fieldName) => {
    const val = [].concat(doc[fieldName] || null).filter(v => v !== null);
    return val.join(", ");
  };

  const getArray = (fieldName) => {
    return [].concat(doc[fieldName] || null).filter(v => v !== null);
  };

  // ── Image resolution: same logic as the rest of the app ──
  // Solr stores `img` as the resolved path /images/{productId}/{flavorId}/{filename}
  // Fall back to probing common flavor folder slots if img is missing.
  const productId = get("id");
  const storedImg = get("img");   // e.g. "/images/5/3/1.jpg"

  const [carouselImages, setCarouselImages] = useState([]);

  useEffect(() => {
    if (productId) {
      const fetchImages = async () => {
        try {
          const res = await fetch(`/api/product/scanMedia/${productId}`);
          const data = await res.json();
          if (data && data.allImages && data.allImages.length > 0) {
            setCarouselImages(data.allImages);
          }
        } catch (e) {
          console.error("Failed to fetch product media for search result:", e);
        }
      };
      // Short delay to avoid spamming the backend during fast rendering/scrolling, though optional.
      fetchImages();
    }
  }, [productId]);

  // Build a prioritised candidate list:
  // 1. The stored img path (already resolved by backend seeder)
  // 2. Guess: /images/{productId}/1/1.jpg  (flavor folder 1)
  // 3. Guess: /images/{productId}/2/1.jpg  (flavor folder 2)
  // 4. Transparent placeholder
  const imgCandidates = [
    storedImg || null,
    productId ? `/images/${productId}/1/1.jpg` : null,
    productId ? `/images/${productId}/2/1.jpg` : null,
    productId ? `/images/${productId}/3/1.jpg` : null,
    'https://placehold.co/400x400/1a1f2e/20d391?text=No+Image',
  ].filter(Boolean);

  const [imgIdx, setImgIdx] = useState(0);
  const imgSrc = imgCandidates[imgIdx];

  const handleImgError = () => {
    if (imgIdx < imgCandidates.length - 1) setImgIdx(i => i + 1);
  };

  const title = get("title") || "Product";
  const price = get("price");
  const categoriesList = getArray("categories");
  const audience = get("audience");
  const bestseller = get("bestseller_s") || get("bestseller");
  const featured = get("featured_s") || get("featured");
  const discount = get("discount_s") || get("discount");

  const handleClick = () => {
    onSelect(doc);
    if (doc.id) window.location.href = `/productDetails/${doc.id}`;
  };

  return (
    <div
      className="solr-result-card"
      onClick={handleClick}
      title={`View ${title}`}
    >
      {/* Image */}
      <div className="card-img-wrap" style={{ position: 'relative', overflow: 'hidden' }}>
        {carouselImages.length > 0 ? (
          <div style={{ width: '100%', height: '100%' }}>
            <ImageCarousel
              id={productId}
              title={title}
              mainImage={carouselImages[0]}
              imageList={carouselImages}
              thumbs={false}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        ) : (
          <img
            src={imgSrc}
            alt={title}
            onError={handleImgError}
          />
        )}
        {/* Badges overlay */}
        <div style={{
          position: 'absolute', top: 10, right: 10,
          display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end',
          zIndex: 10
        }}>
          {bestseller === "Yes" && (
            <span style={{
              background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
              color: '#fff', borderRadius: 20, padding: '2px 9px',
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5px'
            }}>🏆 Bestseller</span>
          )}
          {featured === "Yes" && (
            <span style={{
              background: 'linear-gradient(135deg,#8b5cf6,#0ea5e9)',
              color: '#fff', borderRadius: 20, padding: '2px 9px',
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5px'
            }}>✨ Featured</span>
          )}
          {discount && discount !== "0%" && discount !== "0" && (
            <span style={{
              background: 'linear-gradient(135deg,#ec4899,#db2777)',
              color: '#fff', borderRadius: 20, padding: '2px 9px',
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5px'
            }}>🔥 {discount}</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="card-body">
        {/* Title */}
        <div className="field-row field-title" style={{ marginBottom: 10 }}>
          <span className="field-value" style={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3 }}>
            {title}
          </span>
        </div>

        {/* Price */}
        {price && (
          <div style={{ marginBottom: 10 }}>
            <span style={{
              fontSize: '1.15rem', fontWeight: 800,
              background: 'linear-gradient(135deg,#20d391,#0ea5e9)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              ₹{parseFloat(price).toLocaleString('en-IN')}
            </span>
          </div>
        )}

        {/* Meta row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {categoriesList.map((cat, idx) => (
            <span key={`cat-${idx}`} style={{
              background: 'rgba(14,165,233,0.1)', color: '#38bdf8',
              borderRadius: 20, padding: '2px 10px', fontSize: '0.7rem', fontWeight: 600
            }}>{cat}</span>
          ))}
          {audience && (
            <span style={{
              background: 'rgba(139,92,246,0.1)', color: '#a78bfa',
              borderRadius: 20, padding: '2px 10px', fontSize: '0.7rem', fontWeight: 600
            }}>{audience}</span>
          )}
        </div>

        {/* CTA hint */}
        <div style={{
          fontSize: '0.72rem', color: 'var(--search-muted)',
          display: 'flex', alignItems: 'center', gap: 4, marginTop: 4
        }}>
          <span>View details</span>
          <span style={{ color: 'var(--search-accent)' }}>→</span>
        </div>
      </div>
    </div>
  );
}

// Wrap in class-based for backwards compatibility with parent
class Result extends React.Component {
  render() {
    return <ResultCard {...this.props} />;
  }
}

Result.propTypes = {
  bootstrapCss: PropTypes.bool,
  doc: PropTypes.object,
  fields: PropTypes.array,
  onSelect: PropTypes.func.isRequired
};

export default Result;
