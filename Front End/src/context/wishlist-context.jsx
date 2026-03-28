import { createContext, useEffect, useState } from "react";

export const WishlistContext = createContext(null);

const getDefaultWishlist = () => {
  return {};
};

export const WishlistContextProvider = (props) => {
  const [wishlistItems, setWishlistItems] = useState(getDefaultWishlist());
  const [products, setProducts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  // Initialize session ID and load wishlist on mount
  useEffect(() => {
    // Generate session ID
    const sessionToken = sessionStorage.getItem('sessionId') || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('sessionId', sessionToken);
    setSessionId(sessionToken);

    // Get user ID from localStorage (set during login)
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      loadWishlist(storedUserId);
    }

    // Set up session close handler
    const handleBeforeUnload = () => {
      handleSessionClose();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Load wishlist from backend
  const loadWishlist = async (userIdParam) => {
    try {
      const token = localStorage.getItem('authToken') || 'mock-token';
      const response = await fetch(`http://localhost:5000/api/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const wishlistMap = {};
        data.forEach(item => {
          wishlistMap[item.product_id] = {
            id: item.id,
            productId: item.product_id,
            addedAt: item.createdAt
          };
        });
        setWishlistItems(wishlistMap);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    }
  };

  // Add item to wishlist
  const addToWishlist = async (productId) => {
    console.log('addToWishlist called for product:', productId);
    if (wishlistItems[productId]) {
      console.log('Item already in wishlist');
      return;
    }

    try {
      const token = localStorage.getItem('authToken') || 'mock-token';
      const response = await fetch(`http://localhost:5000/api/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productId,
          session_id: sessionId
        })
      });

      console.log('Add to wishlist response:', response.status);

      if (response.ok) {
        const data = await response.json();
        setWishlistItems(prev => ({
          ...prev,
          [productId]: {
            id: data.id,
            productId: productId,
            addedAt: data.createdAt
          }
        }));
        console.log('Added to wishlist successfully:', productId);
      } else {
        console.error('Failed to add to wishlist:', response.status);
      }
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId) => {
    console.log('removeFromWishlist called for product:', productId);
    const wishlistItem = wishlistItems[productId];
    if (!wishlistItem) {
      console.log('Item not in wishlist');
      return;
    }

    try {
      const token = localStorage.getItem('authToken') || 'mock-token';
      const response = await fetch(`http://localhost:5000/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Remove from wishlist response:', response.status);

      if (response.ok) {
        setWishlistItems(prev => {
          const updated = { ...prev };
          delete updated[productId];
          return updated;
        });
        console.log('Removed from wishlist successfully:', productId);
      } else {
        console.error('Failed to remove from wishlist:', response.status);
      }
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    }
  };

  // Check if item is in wishlist
  const isInWishlist = (productId) => {
    return !!wishlistItems[productId];
  };

  // Get wishlist count
  const getWishlistCount = () => {
    return Object.keys(wishlistItems).length;
  };

  // Get all wishlist items with product details
  const getWishlistItemsWithDetails = async () => {
    try {
      const productIds = Object.keys(wishlistItems);
      if (productIds.length === 0) {
        return [];
      }

      // Fetch product details for all wishlist items
      const productDetailsPromises = productIds.map(productId =>
        fetch(`http://localhost:5000/api/product/fetchById/${productId}`)
          .then(res => res.ok ? res.json() : null)
          .catch(err => {
            console.error(`Failed to fetch product ${productId}:`, err);
            return null;
          })
      );

      const productDetails = await Promise.all(productDetailsPromises);

      // Filter out null results and add wishlist metadata
      return productDetails
        .filter(product => product !== null)
        .map(product => ({
          ...product,
          wishlistAddedAt: wishlistItems[product.id]?.addedAt
        }));
    } catch (err) {
      console.error('Failed to get wishlist items with details:', err);
      return [];
    }
  };

  // Clear wishlist
  const clearWishlist = async () => {
    try {
      const token = localStorage.getItem('authToken') || 'mock-token';
      await fetch(`http://localhost:5000/api/wishlist`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setWishlistItems(getDefaultWishlist());
    } catch (err) {
      console.error('Failed to clear wishlist:', err);
    }
  };

  // Handle session close - send email
  const handleSessionClose = async () => {
    if (userId && Object.keys(wishlistItems).length > 0) {
      try {
        const token = localStorage.getItem('authToken') || 'mock-token';
        await fetch(`http://localhost:5000/api/wishlist/email-on-close`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            user_id: userId,
            session_id: sessionId,
            wishlist_items: Object.keys(wishlistItems)
          })
        });
      } catch (err) {
        console.error('Failed to send wishlist email:', err);
      }
    }
  };

  // Get shareable wishlist link
  const getWishlistShareLink = () => {
    if (!userId) return null;
    return `${window.location.origin}/wishlist/shared?userId=${userId}&sessionId=${sessionId}`;
  };

  const value = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistCount,
    getWishlistItemsWithDetails,
    clearWishlist,
    getWishlistShareLink,
    userId,
    sessionId
  };

  return (
    <WishlistContext.Provider value={value}>
      {props.children}
    </WishlistContext.Provider>
  );
};
