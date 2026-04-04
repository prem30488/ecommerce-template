import React, { useContext, useState } from 'react';
import { WishlistContext } from '../../context/wishlist-context';
import { FaTimes, FaFacebook, FaTwitter, FaInstagram, FaWhatsapp, FaLink } from 'react-icons/fa';
import './wishlist-share-modal.css';

const WishlistShareModal = ({ item, onClose }) => {
  const { getWishlistShareLink } = useContext(WishlistContext);
  const [copied, setCopied] = useState(false);
  const shareLink = getWishlistShareLink();

  const parsePrice = (productItem) => {
    if (!productItem) return 0;
    const product = productItem.Product || productItem;
    const flavor = product?.productFlavors?.[0];
    if (flavor) {
      const v = flavor.price ?? flavor.priceMedium ?? flavor.priceLarge;
      if (v !== undefined && v !== null && !Number.isNaN(Number(v))) return Number(v);
    }
    const fallback = product.price ?? product.priceMedium ?? product.priceLarge;
    if (fallback !== undefined && fallback !== null && !Number.isNaN(Number(fallback))) return Number(fallback);
    return 0;
  };

  const formatINR = (value) => {
    const n = Number(value);
    if (Number.isNaN(n)) return '₹0.00';
    return `₹${n.toFixed(2)}`;
  };

  const displayPrice = formatINR(parsePrice(item));

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
    const description = encodeURIComponent(`Check out this amazing product: ${item.title}`);
    const imageUrl = encodeURIComponent(item.img);

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(itemLink)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(itemLink)}&text=${title}`,
      whatsapp: `https://wa.me/?text=${title}%20${encodeURIComponent(itemLink)}`,
      instagram: itemLink // Instagram doesn't have a direct share URL, open in new tab
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="wishlist-share-modal-overlay" onClick={onClose}>
      <div className="wishlist-share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Share "{item.title}"</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <div className="share-image">
            <img src={item.img} alt={item.title} />
          </div>

          <div className="share-info">
            <p className="share-price">Price: <strong>{displayPrice}</strong></p>
            <p className="share-description">{item.description?.substring(0, 80)}...</p>
          </div>

          <div className="social-share-section">
            <h4>Share on Social Media</h4>
            <div className="social-buttons">
              <button
                className="social-btn facebook"
                onClick={() => handleShareSocial('facebook')}
                title="Share on Facebook"
              >
                <FaFacebook /> Facebook
              </button>
              <button
                className="social-btn twitter"
                onClick={() => handleShareSocial('twitter')}
                title="Share on Twitter"
              >
                <FaTwitter /> Twitter
              </button>
              <button
                className="social-btn whatsapp"
                onClick={() => handleShareSocial('whatsapp')}
                title="Share on WhatsApp"
              >
                <FaWhatsapp /> WhatsApp
              </button>
            </div>
          </div>

          <div className="link-share-section">
            <h4>Copy Link</h4>
            <div className="link-copy-group">
              <input
                type="text"
                className="link-input"
                value={`${shareLink}&product=${item.id}`}
                readOnly
              />
              <button
                className="copy-btn"
                onClick={handleCopyLink}
                style={{ backgroundColor: copied ? '#4caf50' : '#2196F3' }}
              >
                <FaLink /> {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistShareModal;
