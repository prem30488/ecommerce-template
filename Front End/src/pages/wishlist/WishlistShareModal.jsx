import React, { useContext, useState } from 'react';
import { WishlistContext } from '../../context/wishlist-context';
import { FaTimes, FaFacebook, FaTwitter, FaInstagram, FaWhatsapp, FaLink } from 'react-icons/fa';
import './wishlist-share-modal.css';

const WishlistShareModal = ({ item, onClose }) => {
  const { getWishlistShareLink } = useContext(WishlistContext);
  const [copied, setCopied] = useState(false);
  const shareLink = getWishlistShareLink();

  const getPriceData = (productItem) => {
    if (!productItem) return { originalPrice: 0, finalPrice: 0, discountInfo: null };
    const product = productItem.Product || productItem;

    // Default to size 'S' for simplicity in modal, or use item size if available
    const flavor = product?.productFlavors?.[0];
    const sizeKey = 'price'; // Default
    let basePrice = 0;

    if (flavor) {
      basePrice = flavor[sizeKey] || flavor.price || product.price || 0;
    } else {
      basePrice = product.price || 0;
    }

    const activeOffer = product.offers?.find(o => o.active && o.discount > 0 && (!o.size || o.size === 'S'));

    let finalPrice = basePrice;
    let discountInfo = null;

    if (activeOffer) {
      if (activeOffer.type === 2) {
        finalPrice = Math.max(0, basePrice - activeOffer.discount);
        discountInfo = `₹${activeOffer.discount} OFF`;
      } else {
        finalPrice = basePrice * (1 - activeOffer.discount / 100);
        discountInfo = `${activeOffer.discount}% OFF`;
      }
    }

    return { originalPrice: basePrice, finalPrice, discountInfo };
  };

  const formatINR = (value) => {
    const n = Number(value);
    if (Number.isNaN(n)) return '₹0.00';
    return `₹${Math.round(n).toLocaleString()}`;
  };

  const { originalPrice, finalPrice, discountInfo } = getPriceData(item);

  const handleCopyLink = () => {
    const itemLink = `${shareLink}&product=${item.id}`;
    navigator.clipboard.writeText(itemLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShareSocial = (platform) => {
    const itemLink = `${shareLink}&product=${item.id}`;
    const title = encodeURIComponent(item.title);

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(itemLink)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(itemLink)}&text=${title}`,
      whatsapp: `https://wa.me/?text=${title}%20${encodeURIComponent(itemLink)}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="wishlist-share-modal-overlay" onClick={onClose}>
      <div className="wishlist-share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Share This Item</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <div className="product-preview-card">
            <div className="share-image">
              <img src={item.img} alt={item.title} />
            </div>

            <div className="share-info">
              <div className="share-price">
                <span style={{ color: 'var(--color-secondary)' }}>Current Price</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <strong>{formatINR(finalPrice)}</strong>
                  {discountInfo && (
                    <span style={{
                      fontSize: '10px',
                      background: 'var(--color-badge-sale-ultra-light)',
                      color: 'var(--color-badge-sale)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontWeight: '900',
                      border: '1px solid var(--color-badge-sale-light)'
                    }}>
                      {discountInfo}
                    </span>
                  )}
                </div>
              </div>
              <h4 style={{ margin: '10px 0 0 0', fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-text)' }}>
                {item.title}
              </h4>
              {item.description && (
                <p className="share-description">{item.description}</p>
              )}
            </div>
          </div>

          <div className="social-share-section">
            <div className="section-title">
              <h4>Share via Socials</h4>
              <div className="line"></div>
            </div>
            <div className="social-buttons">
              <button
                className="social-btn facebook"
                onClick={() => handleShareSocial('facebook')}
                title="Share on Facebook"
              >
                <FaFacebook />
                <span>Facebook</span>
              </button>
              <button
                className="social-btn twitter"
                onClick={() => handleShareSocial('twitter')}
                title="Share on Twitter"
              >
                <FaTwitter />
                <span>Twitter</span>
              </button>
              <button
                className="social-btn whatsapp"
                onClick={() => handleShareSocial('whatsapp')}
                title="Share on WhatsApp"
              >
                <FaWhatsapp />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          <div className="link-share-section">
            <div className="section-title">
              <h4>Direct Link</h4>
              <div className="line"></div>
            </div>
            <div className="link-copy-group">
              <div className="link-input-wrapper">
                <input
                  type="text"
                  className="link-input"
                  value={`${shareLink}&product=${item.id}`}
                  readOnly
                />
              </div>
              <button
                className={`copy-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopyLink}
              >
                <FaLink /> {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default WishlistShareModal;
