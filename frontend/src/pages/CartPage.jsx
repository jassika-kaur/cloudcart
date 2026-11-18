import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  ArrowLeft
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/common/EmptyState';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'CLOUDCART10') {
      const discount = Math.round(cart.subtotal * 0.1 * 100) / 100;
      setCouponDiscount(discount);
      setCouponApplied(true);
      showToast('Coupon CLOUDCART10 applied: 10% discount added!', 'success');
    } else {
      showToast('Invalid coupon code. Try "CLOUDCART10"', 'error');
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Cart is Empty"
          description="Looks like you haven't added any products to your cart yet. Explore our top collections to find something you love."
          actionText="Start Shopping"
          actionLink="/products"
        />
      </div>
    );
  }

  const finalTotal = Math.max(0, cart.totalAmount - couponDiscount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Clear Cart */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Shopping Cart
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            You have <span className="font-bold text-slate-800">{cart.totalItems}</span> item(s) in your basket
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1.5 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
        {/* Left: Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {cart.items.map((item) => {
            const product = item.product;
            if (!product) return null;

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 shadow-xs"
              >
                {/* Thumbnail */}
                <Link
                  to={`/products/${product._id}`}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0"
                >
                  <img
                    src={product.images && product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                    {product.categoryName}
                  </span>
                  <Link
                    to={`/products/${product._id}`}
                    className="block text-sm font-bold text-slate-800 hover:text-indigo-600 transition truncate"
                  >
                    {product.name}
                  </Link>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-xs">
                    <span className="font-extrabold text-slate-900">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-slate-400 line-through">
                        ${Number(product.originalPrice).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-2.5 py-1 text-slate-600 hover:text-indigo-600 disabled:opacity-30 font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      disabled={item.quantity >= product.stock}
                      className="px-2.5 py-1 text-slate-600 hover:text-indigo-600 disabled:opacity-30 font-bold"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-sm font-extrabold text-slate-900 w-20 text-right">
                    ${(product.price * item.quantity).toFixed(2)}
                  </span>

                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="pt-4 flex items-center justify-between">
            <Link
              to="/products"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right: Order Summary Card (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6 sticky top-24">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h3>

            {/* Calculations breakdown */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({cart.totalItems} items)</span>
                <span className="font-semibold text-slate-800">${cart.subtotal.toFixed(2)}</span>
              </div>
              {cart.totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Product Savings</span>
                  <span className="font-semibold">-${cart.totalDiscount.toFixed(2)}</span>
                </div>
              )}
              {couponApplied && (
                <div className="flex justify-between text-indigo-600">
                  <span>Promo (CLOUDCART10)</span>
                  <span className="font-semibold">-${couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Estimated Shipping</span>
                <span>
                  {cart.shippingPrice === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase">Free</span>
                  ) : (
                    `$${cart.shippingPrice.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between text-base font-extrabold text-slate-900">
                <span>Final Total</span>
                <span className="text-indigo-600">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Coupon code (CLOUDCART10)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs uppercase text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Apply
              </button>
            </form>

            {/* Checkout Action */}
            <button
              onClick={() => navigate('/checkout', { state: { couponDiscount } })}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition hover:-translate-y-0.5"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>256-Bit SSL Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
