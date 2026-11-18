import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, Phone, MapPin, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      {/* Value Proposition Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold">Free Express Shipping</h4>
              <p className="text-xs text-slate-400 mt-1">Orders above $50 qualify for expedited 2-day delivery</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold">Secure Checkout</h4>
              <p className="text-xs text-slate-400 mt-1">256-bit encrypted checkout with Razorpay & COD</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-400 shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold">30-Day Easy Returns</h4>
              <p className="text-xs text-slate-400 mt-1">Hassle-free replacement or immediate store credit</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold">Authentic Guaranteed</h4>
              <p className="text-xs text-slate-400 mt-1">100% genuine products directly from certified brands</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Cloud<span className="text-indigo-400">Cart</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              CloudCart is an ultra-modern, cloud-native e-commerce flagship. Engineered with React, Node.js, Express and MongoDB for lightning-fast shopping experiences.
            </p>
            <div className="space-y-2 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>CloudCart Tech Campus, Silicon Valley, CA</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>+1 (800) 555-CLOUDCART (Mon - Fri 9am-6pm)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>support@cloudcart.dev</span>
              </div>
            </div>
          </div>

          {/* Quick Shop */}
          <div>
            <h5 className="text-white text-sm font-semibold mb-4">Shop Categories</h5>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/products?category=Electronics" className="hover:text-white transition">Electronics</Link></li>
              <li><Link to="/products?category=Fashion" className="hover:text-white transition">Fashion & Apparel</Link></li>
              <li><Link to="/products?category=Home+and+Kitchen" className="hover:text-white transition">Home & Kitchen</Link></li>
              <li><Link to="/products?category=Beauty" className="hover:text-white transition">Beauty & Wellness</Link></li>
              <li><Link to="/products?category=Sports" className="hover:text-white transition">Sports & Fitness</Link></li>
              <li><Link to="/products?category=Accessories" className="hover:text-white transition">Luxury Accessories</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5 className="text-white text-sm font-semibold mb-4">Customer Care</h5>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/orders" className="hover:text-white transition">Track Your Order</Link></li>
              <li><Link to="/profile" className="hover:text-white transition">Account Settings</Link></li>
              <li><Link to="/cart" className="hover:text-white transition">Cart & Checkout</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition">My Wishlist</Link></li>
              <li><span className="text-slate-500 cursor-not-allowed">Shipping Policies</span></li>
              <li><span className="text-slate-500 cursor-not-allowed">Terms of Service</span></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h5 className="text-white text-sm font-semibold mb-4">Stay in the Loop</h5>
            <p className="text-xs text-slate-400 mb-3">
              Subscribe for exclusive flash sales, seasonal discounts, and product drops.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed to CloudCart updates!'); }} className="space-y-2">
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2 text-xs font-semibold transition shadow-xs"
              >
                Join Newsletter
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} CloudCart Technologies Inc. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">VISA</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">MASTERCARD</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">UPI</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">CASH ON DELIVERY</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
