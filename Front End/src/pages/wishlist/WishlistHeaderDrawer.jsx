import React, { useContext, useState, useEffect } from 'react';
import { Drawer, Button } from '@mui/material';
import { WishlistContext } from '../../context/wishlist-context';
import { FaHeart } from 'react-icons/fa';
import Alert from 'react-s-alert';
import { Link } from 'react-router-dom';
import './wishlist-header-drawer.css';

export default function WishlistHeaderDrawer() {
    const { wishlistItems, getWishlistItemsWithDetails, removeFromWishlist } = useContext(WishlistContext);
    const [state, setState] = useState({
        top: false,
        left: false,
        bottom: false,
        right: false,
    });
    const [products, setProducts] = useState([]);

    useEffect(() => {
        if (state.right) {
            let isMounted = true;
            const fetchData = async () => {
                try {
                    const items = await getWishlistItemsWithDetails();
                    if (isMounted) setProducts(items || []);
                } catch (err) {
                    if (isMounted) setProducts([]);
                    console.error('Error fetching wishlist items:', err);
                }
            };
            fetchData();
            return () => { isMounted = false; };
        }
    }, [state.right, wishlistItems, getWishlistItemsWithDetails]);

    const toggleDrawer = (anchor, open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setState({ ...state, [anchor]: open });
    };

    const handleRemove = (productId) => {
        removeFromWishlist(productId);
        Alert.info('Removed from wishlist');
    };

    return (
        <React.Fragment key={'right'}>
            <div
                className="wishlist-header-trigger"
                onClick={toggleDrawer('right', true)}
                title="View Wishlist"
                style={{ fontSize: "24px", cursor: "pointer", marginRight: "10px" }}
            >
                <FaHeart style={{ color: '#ff4757' }} />
                {Object.keys(wishlistItems).length > 0 && (
                    <span className='badge badge-warning' id='lblWishlistCount'>
                        {Object.keys(wishlistItems).length}
                    </span>
                )}
            </div>
            <Drawer
                anchor={'right'}
                open={state['right']}
                onClose={toggleDrawer('right', false)}
                PaperProps={{
                    sx: { width: { xs: '100%', sm: '35%' } },
                }}
            >
                <div className="wishlist-drawer-main">
                    <div className="wishlist-drawer-title">
                        <h3>
                            <FaHeart /> My Wishlist ({Object.keys(wishlistItems).length})
                        </h3>
                        <button
                            onClick={toggleDrawer('right', false)}
                            className="close-drawer-btn"
                            style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                        >
                            ×
                        </button>
                    </div>

                    {Object.keys(wishlistItems).length === 0 ? (
                        <div className="wishlist-empty-state">
                            <FaHeart style={{ fontSize: '48px', color: '#ddd', marginBottom: '16px' }} />
                            <p>Your wishlist is empty</p>
                            <p style={{ fontSize: '12px', color: '#999' }}>Start adding your favorite items</p>
                        </div>
                    ) : (
                        <div className="wishlist-items-list">
                            {products.map((product) => (
                                <div key={product.id} className="wishlist-item-row">
                                    <div className="item-image-small">
                                        <img
                                            src={product.img || (product.imageURLs ? (product.imageURLs.split(',')[0].startsWith('http') ? product.imageURLs.split(',')[0] : `http://localhost:3000/api/product/image/${product.id}/${product.imageURLs.split(',')[0]}`) : `https://picsum.photos/seed/${product.id}/400/400`)}
                                            alt={product.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff' }}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `https://placehold.co/400x400?text=${encodeURIComponent(product.title)}`;
                                            }}
                                        />
                                    </div>
                                    <div className="item-detail-small">
                                        <h5>{product.title.slice(0, 25)}</h5>
                                        <p className="item-price-small">₹{product.price}</p>
                                    </div>
                                    <div className="item-actions-small">
                                        <Link
                                            to={`/productDetails/${product.id}`}
                                            onClick={() => toggleDrawer('right', false)({})}
                                            className="view-btn"
                                        >
                                            View
                                        </Link>
                                        <button
                                            className="remove-btn"
                                            onClick={() => handleRemove(product.id)}
                                            title="Remove"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {Object.keys(wishlistItems).length > 0 && (
                        <div className="wishlist-drawer-actions">
                            <Link
                                to="/wishlist"
                                onClick={() => toggleDrawer('right', false)({})}
                                className="btn-view-full-wishlist"
                            >
                                View Full Wishlist
                            </Link>
                        </div>
                    )}
                </div>
            </Drawer>
        </React.Fragment>
    );
}
