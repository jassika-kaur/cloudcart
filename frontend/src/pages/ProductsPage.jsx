import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  X,
  Star,
  Search,
  Check,
  RotateCcw,
  PackageSearch
} from 'lucide-react';
import API from '../services/api';
import ProductCard from '../components/common/ProductCard';
import { ProductCardSkeleton } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Filter states
  const categoryParam = searchParams.get('category') || '';
  const keywordParam = searchParams.get('keyword') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const ratingParam = searchParams.get('rating') || '';
  const inStockParam = searchParams.get('inStock') === 'true';
  const isBestSellerParam = searchParams.get('isBestSeller') === 'true';
  const isTrendingParam = searchParams.get('isTrending') === 'true';
  const isNewArrivalParam = searchParams.get('isNewArrival') === 'true';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get('/categories');
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams(searchParams);
        if (!query.has('limit')) query.set('limit', '40');

        const res = await API.get(`/products?${query.toString()}`);
        if (res.data.success) {
          setProducts(res.data.products);
          setTotalProducts(res.data.totalProducts);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === '' || value === null || value === undefined || value === false) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters =
    categoryParam ||
    keywordParam ||
    minPriceParam ||
    maxPriceParam ||
    ratingParam ||
    inStockParam ||
    isBestSellerParam ||
    isTrendingParam ||
    isNewArrivalParam;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header & Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {keywordParam
              ? `Results for "${keywordParam}"`
              : categoryParam
              ? categoryParam
              : 'All Products'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing <span className="font-bold text-slate-800">{products.length}</span> of {totalProducts} items
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {hasActiveFilters && '•'}
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">Sort:</span>
            <select
              value={sortParam}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 shadow-xs cursor-pointer"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid with Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="space-y-3 pb-6 border-b border-slate-200">
            <label className="text-xs font-bold text-slate-700 uppercase">Category</label>
            <div className="space-y-1.5">
              <button
                onClick={() => updateFilter('category', '')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  !categoryParam
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Departments
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => updateFilter('category', cat.name)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                    categoryParam === cat.name
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.productCount > 0 && (
                    <span className="text-[10px] text-slate-400">({cat.productCount})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3 pb-6 border-b border-slate-200">
            <label className="text-xs font-bold text-slate-700 uppercase">Price Range ($)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPriceParam}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPriceParam}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Customer Rating Filter */}
          <div className="space-y-3 pb-6 border-b border-slate-200">
            <label className="text-xs font-bold text-slate-700 uppercase">Customer Rating</label>
            <div className="space-y-2">
              {[4, 3, 2].map((stars) => (
                <button
                  key={stars}
                  onClick={() => updateFilter('rating', ratingParam === String(stars) ? '' : stars)}
                  className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg text-xs transition ${
                    ratingParam === String(stars) ? 'bg-amber-50 text-amber-900 font-bold' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < stars ? 'fill-amber-400' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-600">& Above</span>
                </button>
              ))}
            </div>
          </div>

          {/* Availability Checkbox */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase">Availability</label>
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockParam}
                onChange={(e) => updateFilter('inStock', e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No products matched your search"
              description="Try adjusting your filters or search keywords to find what you are looking for."
              actionText="Reset Filters"
              onAction={clearAllFilters}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsFilterDrawerOpen(false)}
          />
          <div className="relative ml-auto w-80 h-full bg-white shadow-2xl p-6 overflow-y-auto z-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                <h3 className="text-base font-bold text-slate-900">Filters</h3>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category */}
              <div className="space-y-3 pb-6 border-b border-slate-200">
                <label className="text-xs font-bold text-slate-700 uppercase">Category</label>
                <div className="space-y-1">
                  <button
                    onClick={() => updateFilter('category', '')}
                    className={`block w-full text-left px-2 py-1.5 rounded-lg text-xs ${
                      !categoryParam ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => updateFilter('category', cat.name)}
                      className={`block w-full text-left px-2 py-1.5 rounded-lg text-xs ${
                        categoryParam === cat.name ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="py-6 border-b border-slate-200 space-y-3">
                <label className="text-xs font-bold text-slate-700 uppercase">Price Range ($)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPriceParam}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPriceParam}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-2">
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Apply Filters
              </button>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    clearAllFilters();
                    setIsFilterDrawerOpen(false);
                  }}
                  className="w-full py-2 text-slate-500 hover:text-slate-700 text-xs font-medium"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
