import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('cloudcart_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('cloudcart_token') || null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('cloudcart_token');
      if (storedToken) {
        try {
          const res = await API.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('cloudcart_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();

    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
      showToast('Your session has expired. Please log in again.', 'warning');
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data;

      setToken(receivedToken);
      setUser(receivedUser);

      localStorage.setItem('cloudcart_token', receivedToken);
      localStorage.setItem('cloudcart_user', JSON.stringify(receivedUser));

      showToast(`Welcome back, ${receivedUser.name}!`, 'success');
      return { success: true, user: receivedUser };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check credentials.';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  const register = async (name, email, password, role = 'customer') => {
    try {
      const res = await API.post('/auth/register', { name, email, password, role });
      const { token: receivedToken, user: receivedUser } = res.data;

      setToken(receivedToken);
      setUser(receivedUser);

      localStorage.setItem('cloudcart_token', receivedToken);
      localStorage.setItem('cloudcart_user', JSON.stringify(receivedUser));

      showToast('Account created successfully! Welcome to CloudCart.', 'success');
      return { success: true, user: receivedUser };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Try again.';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cloudcart_token');
    localStorage.removeItem('cloudcart_user');
    showToast('Logged out successfully', 'info');
  };

  const updateProfile = async (data) => {
    try {
      const res = await API.put('/users/profile', data);
      setUser(res.data.user);
      localStorage.setItem('cloudcart_user', JSON.stringify(res.data.user));
      showToast('Profile updated successfully', 'success');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  const addAddress = async (addressData) => {
    try {
      const res = await API.post('/users/addresses', addressData);
      setUser((prev) => ({ ...prev, addresses: res.data.addresses }));
      showToast('Address added successfully', 'success');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add address';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      const res = await API.delete(`/users/addresses/${addressId}`);
      setUser((prev) => ({ ...prev, addresses: res.data.addresses }));
      showToast('Address removed', 'info');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete address';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        deleteAddress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
