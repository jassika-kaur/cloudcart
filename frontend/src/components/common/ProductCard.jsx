import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  if (!product) return null;

  const wishlisted = isInWishlist(product._id);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlisted) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product._id);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product._id, 1);
  };

  const primaryImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

  const discountPercent =
    product.discount ||
    (product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Badges & Wishlist Action */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col gap-1 items-start">
          {discountPercent > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-rose-500 text-white shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500 text-white shadow-xs">
              Best Seller
            </span>
          )}
        </div>
        <button
          onClick={handleWishlistToggle}
          className={`pointer-events-auto p-2 rounded-full transition-colors backdrop-blur-md shadow-xs ${
            wishlisted
              ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
              : 'bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white'
          }`}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Image Container */}
      <Link
        to={`/products/${product._id}`}
        className="block relative aspect-square overflow-hidden bg-slate-100"
      >
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Quick View Overlay on Desktop */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-3.5 py-1.5 rounded-full bg-white/95 text-slate-800 text-xs font-semibold shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            View Details
          </span>
        </div>
      </Link>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider truncate">
            {product.categoryName || 'General'}
          </span>
          <span className="text-[11px] text-slate-400 truncate">
            {product.brand || 'CloudCart'}
          </span>
        </div>

        <Link
          to={`/products/${product._id}`}
          className="text-sm font-semibold text-slate-800 hover:text-indigo-600 transition-colors line-clamp-2 min-h-[40px]"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Rating summary */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex items-center text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
          </div>
          <span className="text-xs font-bold text-slate-700">
            {product.rating ? Number(product.rating).toFixed(1) : '4.5'}
          </span>
          <span className="text-[11px] text-slate-400">
            ({product.numReviews || 0})
          </span>
        </div>

        {/* Pricing and Cart button */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900">
                ${Number(product.price).toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  ${Number(product.originalPrice).toFixed(2)}
                </span>
              )}
            </div>
            {product.stock <= 5 && product.stock > 0 ? (
              <span className="text-[10px] font-medium text-amber-600">
                Only {product.stock} left in stock
              </span>
            ) : product.stock === 0 ? (
              <span className="text-[10px] font-medium text-rose-500">
                Out of Stock
              </span>
            ) : null}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`p-2.5 rounded-xl transition duration-200 flex items-center justify-center shadow-xs ${
              product.stock === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
            }`}
            title="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
