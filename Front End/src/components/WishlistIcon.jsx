import React, { useContext } from 'react';
import { WishlistContext } from '../context/wishlist-context';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import Alert from 'react-s-alert';
import './wishlist-icon.css';

const WishlistIcon = ({ productId, size = 'medium', showText = false, customStyle = {} }) => {
    const contextValue = useContext(WishlistContext);

    if (!contextValue) {
        console.error('WishlistContext is not available. Make sure WishlistContextProvider wraps your app.');
        return null;
    }

    const { isInWishlist, addToWishlist, removeFromWishlist } = contextValue;
    const inWishlist = isInWishlist(productId);

    const handleToggleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();


        try {
            if (inWishlist) {
                await removeFromWishlist(productId);
                Alert.warning('Removed from wishlist', {
                    customClass: 'wishlist-removed-toast'
                });
            } else {
                await addToWishlist(productId);
                Alert.success('Added to wishlist');
            }
        } catch (err) {
            console.error('Error toggling wishlist:', err);
            Alert.error('Failed to update wishlist');
        }
    };

    const sizeClasses = {
        small: 'wishlist-icon-small',
        medium: 'wishlist-icon-medium',
        large: 'wishlist-icon-large'
    };

    return (
        <button
            className={`wishlist-icon-btn ${sizeClasses[size]} ${inWishlist ? 'in-wishlist' : ''}`}
            onClick={handleToggleWishlist}
            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            type="button"
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            style={{ ...customStyle, ...(showText ? { display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' } : {}) }}
        >
            {inWishlist ? (
                <FaHeart className="wishlist-icon" />
            ) : (
                <FaRegHeart className="wishlist-icon" />
            )}
            {showText && <span>{inWishlist ? 'Added' : 'Add to Wishlist'}</span>}
        </button>
    );
};

export default WishlistIcon;
