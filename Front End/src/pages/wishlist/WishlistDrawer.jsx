import React, { useContext, useState } from 'react';
import { WishlistContext } from '../../context/wishlist-context';
import { FaTimes, FaHeart } from 'react-icons/fa';
import { Drawer, Button } from '@mui/material';
import './wishlist-drawer.css';

const WishlistDrawer = ({ open, onClose }) => {
  const { wishlistItems, getWishlistItemsWithDetails, removeFromWishlist } = useContext(WishlistContext);
  const [items, setItems] = useState([]);

  const parsePrice = (productItem) => {
    if (!productItem) return 0;
    const product = productItem.Product || productItem;
    const flavor = product?.productFlavors?.[0];
    if (flavor) {
      const val = flavor.price ?? flavor.priceMedium ?? flavor.priceLarge;
      if (val !== undefined && val !== null && !Number.isNaN(Number(val))) return Number(val);
    }
    const fallback = product.price ?? product.priceMedium ?? product.priceLarge;
    if (fallback !== undefined && fallback !== null && !Number.isNaN(Number(fallback))) return Number(fallback);
    return 0;
  };

  const formatINR = (amount) => {
    const n = Number(amount);
    if (Number.isNaN(n)) return '₹0.00';
    return `₹${n.toFixed(2)}`;
  };

  React.useEffect(() => {
    const wishlistProducts = getWishlistItemsWithDetails();
    setItems(wishlistProducts);
  }, [wishlistItems]);

  const handleRemoveItem = (productId) => {
    removeFromWishlist(productId);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      className="wishlist-drawer"
    >
      <div className="wishlist-drawer-content">
        <div className="wishlist-drawer-header">
          <h2>
            <FaHeart /> My Wishlist ({items.length})
          </h2>
          <button onClick={onClose} className="close-drawer-btn">
            <FaTimes />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="wishlist-drawer-empty">
            <p>Your wishlist is empty</p>
          </div>
        ) : (
          <div className="wishlist-drawer-items">
            {items.map((item) => (
              <div key={item.id} className="wishlist-drawer-item">
                <div className="item-image">
                  <img src={item.img} alt={item.title} />
                </div>
                <div className="item-details">
                  <h4>{item.title}</h4>
                  <p className="item-category">{item.category}</p>
                  <p className="item-price">{formatINR(parsePrice(item))}</p>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveItem(item.id)}
                  title="Remove from wishlist"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="wishlist-drawer-footer">
          <Button
            fullWidth
            variant="contained"
            color="primary"
            href="/wishlist"
            onClick={onClose}
            sx={{ backgroundColor: '#ff4757' }}
          >
            View Full Wishlist
          </Button>
        </div>
      </div>
    </Drawer>
  );
};

export default WishlistDrawer;
