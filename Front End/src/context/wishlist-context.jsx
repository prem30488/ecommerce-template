import { createContext, useEffect, useState } from "react";
import Alert from 'react-s-alert';
import { API_BASE_URL } from "../constants";
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
      const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
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
    const idStr = String(productId);
    console.log('addToWishlist called for product:', idStr);

    if (wishlistItems[idStr]) {
      console.log('Item already in wishlist');
      return;
    }

    // Optimistic update
    const tempItem = {
      id: Date.now(), // temporary ID
      productId: idStr,
      addedAt: new Date().toISOString(),
      isOptimistic: true
    };

    setWishlistItems(prev => ({
      ...prev,
      [idStr]: tempItem
    }));

    try {
      const token = localStorage.getItem('authToken') || 'mock-token';
      const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: idStr,
          session_id: sessionId
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Update with real data from server
        setWishlistItems(prev => ({
          ...prev,
          [idStr]: {
            id: data.id,
            productId: idStr,
            addedAt: data.createdAt
          }
        }));
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 400 && errorData.error === 'Item already in wishlist') {
          console.log('Item already in wishlist on server, keeping local state.');
          // Remove optimistic flag if you use one, or just keep as is
          return;
        }

        // Rollback on other failure
        setWishlistItems(prev => {
          const updated = { ...prev };
          delete updated[idStr];
          return updated;
        });
        console.error('Failed to add to wishlist:', response.status, errorData);
        Alert.error('Failed to add to wishlist');
      }
    } catch (err) {
      // Rollback on network error
      setWishlistItems(prev => {
        const updated = { ...prev };
        delete updated[idStr];
        return updated;
      });
      console.error('Failed to add to wishlist:', err);
      Alert.error('Network error. Failed to add to wishlist');
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId) => {
    const idStr = String(productId);
    console.log('removeFromWishlist called for product:', idStr);

    const wishlistItem = wishlistItems[idStr];
    if (!wishlistItem) {
      console.log('Item not in wishlist');
      return;
    }

    // Capture the item for potential rollback
    const previousItem = { ...wishlistItem };

    // Optimistic update
    setWishlistItems(prev => {
      const updated = { ...prev };
      delete updated[idStr];
      return updated;
    });

    try {
      const token = localStorage.getItem('authToken') || 'mock-token';
      const response = await fetch(`${API_BASE_URL}/api/wishlist/${idStr}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Rollback on failure
        setWishlistItems(prev => ({
          ...prev,
          [idStr]: previousItem
        }));
        console.error('Failed to remove from wishlist:', response.status);
        Alert.error('Failed to remove from wishlist');
      }
    } catch (err) {
      // Rollback on network error
      setWishlistItems(prev => ({
        ...prev,
        [idStr]: previousItem
      }));
      console.error('Failed to remove from wishlist:', err);
      Alert.error('Network error. Failed to remove from wishlist');
    }
  };

  // Check if item is in wishlist
  const isInWishlist = (productId) => {
    return !!wishlistItems[String(productId)];
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
        fetch(`${API_BASE_URL}/api/product/fetchById/${productId}`)
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
      await fetch(`${API_BASE_URL}/api/wishlist`, {
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
        await fetch(`${API_BASE_URL}/api/wishlist/email-on-close`, {
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
