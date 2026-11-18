import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Smartphone,
  Banknote
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const CheckoutPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { cart, fetchCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const couponDiscount = location.state?.couponDiscount || 0;

  // Address form states
  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0] || {};
  const [shippingAddress, setShippingAddress] = useState({
    fullName: defaultAddress.fullName || user?.name || '',
    phone: defaultAddress.phone || user?.phone || '',
    street: defaultAddress.street || '',
    city: defaultAddress.city || '',
    state: defaultAddress.state || '',
    postalCode: defaultAddress.postalCode || '',
    country: defaultAddress.country || 'India'
  });

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [isProcessing, setIsProcessing] = useState(false);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    navigate('/login?redirect=checkout');
    return null;
  }

  if (!cart.items || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleAddressChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.postalCode
    ) {
      showToast('Please fill out all required shipping address fields', 'warning');
      return;
    }

    try {
      setIsProcessing(true);

      // Order items payload
      const orderItems = cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity
      }));

      const res = await API.post('/orders', {
        items: orderItems,
        shippingAddress,
        paymentMethod
      });

      if (res.data.success) {
        await fetchCart();
        showToast('Order placed successfully! Thank you for shopping with CloudCart.', 'success');
        navigate(`/orders/${res.data.order._id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to place order. Please try again.';
      showToast(msg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const finalTotal = Math.max(0, cart.totalAmount - couponDiscount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Secure Checkout
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete your delivery details and choose your preferred payment option.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
        {/* Left Section: Shipping & Payment (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. Shipping Address */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h2 className="text-lg font-bold text-slate-900">Shipping Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleAddressChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleAddressChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  name="street"
                  value={shippingAddress.street}
                  onChange={handleAddressChange}
                  placeholder="House/Apartment #, Street name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  required
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleAddressChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  State / Province *
                </label>
                <input
                  type="text"
                  required
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleAddressChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Postal / ZIP Code *
                </label>
                <input
                  type="text"
                  required
                  name="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={handleAddressChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleAddressChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* 2. Payment Method */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h2 className="text-lg font-bold text-slate-900">Payment Option</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Option 1: Cash on Delivery */}
              <label
                className={`p-4 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition ${
                  paymentMethod === 'Cash on Delivery'
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Banknote className="w-5 h-5 text-indigo-600" />
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={paymentMethod === 'Cash on Delivery'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-indigo-600"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Cash on Delivery</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Pay upon package doorstep arrival</p>
                </div>
              </label>

              {/* Option 2: Simulated Card */}
              <label
                className={`p-4 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition ${
                  paymentMethod === 'Simulated Card'
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Simulated Card"
                    checked={paymentMethod === 'Simulated Card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-indigo-600"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Simulated Card</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Instant online card clearance</p>
                </div>
              </label>

              {/* Option 3: Simulated UPI */}
              <label
                className={`p-4 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition ${
                  paymentMethod === 'Simulated UPI'
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Smartphone className="w-5 h-5 text-indigo-600" />
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Simulated UPI"
                    checked={paymentMethod === 'Simulated UPI'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-indigo-600"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Simulated UPI</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Google Pay / PhonePe / Paytm flow</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Section: Order Review (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6 sticky top-24">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Review
            </h3>

            {/* Items summary preview */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {cart.items.map((item) => {
                const prod = item.product;
                if (!prod) return null;
                return (
                  <div key={item._id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={prod.images && prod.images[0]}
                        alt={prod.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{prod.name}</p>
                        <p className="text-slate-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      ${(prod.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-800">${cart.subtotal.toFixed(2)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-indigo-600">
                  <span>Coupon Discount</span>
                  <span className="font-semibold">-${couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>
                  {cart.shippingPrice === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase">Free</span>
                  ) : (
                    `$${cart.shippingPrice.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between text-base font-extrabold text-slate-900">
                <span>Total to Pay</span>
                <span className="text-indigo-600">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              {isProcessing ? 'Processing Order...' : `Place Order ($${finalTotal.toFixed(2)})`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
