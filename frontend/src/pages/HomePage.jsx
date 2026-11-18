import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  TrendingUp,
  Sparkles,
  Zap,
  Tag,
  ShieldCheck,
  Star,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';
import API from '../services/api';
import ProductCard from '../components/common/ProductCard';
import { ProductCardSkeleton } from '../components/common/LoadingSkeleton';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [catsRes, featRes, trendRes, bestRes, newRes] = await Promise.all([
          API.get('/categories'),
          API.get('/products?isFeatured=true&limit=4'),
          API.get('/products?isTrending=true&limit=4'),
          API.get('/products?isBestSeller=true&limit=4'),
          API.get('/products?isNewArrival=true&limit=4')
        ]);

        if (catsRes.data.success) setCategories(catsRes.data.categories);
        if (featRes.data.success) setFeaturedProducts(featRes.data.products);
        if (trendRes.data.success) setTrendingProducts(trendRes.data.products);
        if (bestRes.data.success) setBestSellers(bestRes.data.products);
        if (newRes.data.success) setNewArrivals(newRes.data.products);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white py-16 sm:py-24">
        {/* Decorative Background Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Next-Gen Cloud-Native Shopping Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Premium Shopping. <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                  Engineered For Speed.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Discover over 30+ curated flagship electronics, luxury fashion, artisanal home goods, and active wellness essentials with instant delivery.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/products"
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition hover:-translate-y-0.5"
                >
                  Explore Collection
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/products?isBestSeller=true"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl text-sm font-semibold backdrop-blur-md flex items-center justify-center gap-2 transition"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  Best Sellers
                </Link>
              </div>

              {/* Trust Metrics */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <p className="text-2xl font-black text-white">30+</p>
                  <p className="text-xs text-slate-400">Curated Products</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">4.8★</p>
                  <p className="text-xs text-slate-400">Customer Rating</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">2-Day</p>
                  <p className="text-xs text-slate-400">Express Delivery</p>
                </div>
              </div>
            </div>

            {/* Right Hero Graphic Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-800/80 backdrop-blur-md p-5">
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80"
                    alt="CloudPro UltraBook 15X"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full shadow-md">
                    Featured Flagship
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-400 uppercase">Electronics</span>
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> 4.9 (48 reviews)
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">CloudPro UltraBook 15X</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    Next-gen 15.6" 4K OLED laptop with 32GB RAM, 1TB NVMe SSD, and 18-hour battery life.
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-700/60">
                    <div>
                      <span className="text-xs text-slate-400 line-through mr-2">$1499.99</span>
                      <span className="text-xl font-black text-white">$1299.99</span>
                    </div>
                    <Link
                      to="/products"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
              Browse By Department
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Featured Categories
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            All Categories <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col items-center text-center shadow-xs hover:shadow-lg hover:border-indigo-300 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden mb-3 bg-slate-100">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition">
                {cat.name}
              </h3>
              <span className="text-[11px] text-slate-400 mt-0.5">
                {cat.productCount ? `${cat.productCount} items` : 'Explore'}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Trending Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-500 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>What Everyone's Buying</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Trending Right Now
            </h2>
          </div>
          <Link
            to="/products?isTrending=true"
            className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="space-y-4 max-w-xl text-center md:text-left z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5" /> Limited Time Deal
            </span>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Get 10% Off Your Entire Cart Today
            </h3>
            <p className="text-indigo-100 text-sm">
              Use promo code <span className="bg-white text-indigo-700 font-mono font-bold px-2 py-0.5 rounded">CLOUDCART10</span> at checkout for instant savings across all departments!
            </p>
          </div>
          <Link
            to="/products"
            className="shrink-0 px-8 py-3.5 bg-white hover:bg-slate-100 text-indigo-700 rounded-xl text-sm font-bold shadow-lg transition hover:scale-105 z-10"
          >
            Shop The Sale
          </Link>
        </div>
      </section>

      {/* 5. Best-Selling Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">
              Top Rated by Customers
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Best Sellers
            </h2>
          </div>
          <Link
            to="/products?isBestSeller=true"
            className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 6. New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
              Just Added to Catalog
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/products?isNewArrival=true"
            className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
