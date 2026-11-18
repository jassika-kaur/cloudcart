import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useCart } from './CartContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { fetchCart } = useCart();

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }

    try {
      setLoading(true);
      const res = await API.get('/wishlist');
      if (res.data.success) {
        setWishlist(res.data.wishlist);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const isInWishlist = (productId) => {
    return wishlist.some(
      (item) => (item._id || item) === productId || item._id === productId
    );
  };

  const addToWishlist = async (productId) => {
    if (!isAuthenticated) {
      showToast('Please sign in to save items to your wishlist', 'info');
      return false;
    }

    try {
      const res = await API.post('/wishlist', { productId });
      if (res.data.success) {
        setWishlist(res.data.wishlist);
        showToast('Added to your wishlist!', 'success');
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not add to wishlist';
      showToast(msg, 'error');
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const res = await API.delete(`/wishlist/${productId}`);
      if (res.data.success) {
        setWishlist(res.data.wishlist);
        showToast('Removed from wishlist', 'info');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove from wishlist';
      showToast(msg, 'error');
    }
  };

  const moveToCart = async (productId) => {
    try {
      const res = await API.post(`/wishlist/${productId}/move-to-cart`);
      if (res.data.success) {
        await fetchWishlist();
        await fetchCart();
        showToast('Moved item to your cart!', 'success');
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to move to cart';
      showToast(msg, 'error');
      return false;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        fetchWishlist,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        moveToCart
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
