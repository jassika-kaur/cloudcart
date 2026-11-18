import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    items: [],
    totalItems: 0,
    subtotal: 0,
    totalDiscount: 0,
    shippingPrice: 0,
    totalAmount: 0
  });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart({
        items: [],
        totalItems: 0,
        subtotal: 0,
        totalDiscount: 0,
        shippingPrice: 0,
        totalAmount: 0
      });
      return;
    }

    try {
      setLoading(true);
      const res = await API.get('/cart');
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      showToast('Please sign in to add products to your cart', 'info');
      return false;
    }

    try {
      const res = await API.post('/cart', { productId, quantity });
      if (res.data.success) {
        setCart(res.data.cart);
        showToast('Item added to your cart!', 'success');
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add item to cart';
      showToast(msg, 'error');
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;

    try {
      const res = await API.put(`/cart/${itemId}`, { quantity });
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update quantity';
      showToast(msg, 'error');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await API.delete(`/cart/${itemId}`);
      if (res.data.success) {
        setCart(res.data.cart);
        showToast('Item removed from cart', 'info');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove item';
      showToast(msg, 'error');
    }
  };

  const clearCart = async () => {
    try {
      const res = await API.delete('/cart');
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
