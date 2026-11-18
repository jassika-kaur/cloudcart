import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import EmptyState from '../components/common/EmptyState';

const WishlistPage = () => {
  const { wishlist, removeFromWishlist, moveToCart } = useWishlist();

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={Heart}
          title="Your Wishlist is Empty"
          description="Save your favorite gadgets, apparel, and home essentials here to purchase later or track discounts."
          actionText="Discover Products"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          My Saved Wishlist
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {wishlist.length} item(s) saved in your wishlist
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => {
          if (!product) return null;

          return (
            <div
              key={product._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between group hover:shadow-lg transition-all duration-300"
            >
              <div className="space-y-3">
                {/* Image */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={product.images && product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white shadow-xs transition"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Details */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                    {product.categoryName}
                  </span>
                  <Link
                    to={`/products/${product._id}`}
                    className="block text-sm font-bold text-slate-800 hover:text-indigo-600 transition truncate mt-0.5"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm font-black text-slate-900 mt-1">
                    ${Number(product.price).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Move to Cart button */}
              <button
                onClick={() => moveToCart(product._id)}
                disabled={product.stock === 0}
                className="mt-4 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
              >
                <ShoppingBag className="w-4 h-4" />
                Move to Cart
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;
