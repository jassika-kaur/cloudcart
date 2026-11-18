import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/common/ProductCard';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Review form states
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.product);

          // Fetch related and reviews
          const [relRes, revRes] = await Promise.all([
            API.get(`/products/${id}/related`),
            API.get(`/products/${id}/reviews`)
          ]);

          if (relRes.data.success) setRelatedProducts(relRes.data.products);
          if (revRes.data.success) setReviews(revRes.data.reviews);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <Link to="/products" className="mt-4 inline-block px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold">
          Back to Products
        </Link>
      </div>
    );
  }

  const wishlisted = isInWishlist(product._id);

  const handleWishlistToggle = () => {
    if (wishlisted) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product._id);
    }
  };

  const handleAddToCart = async () => {
    await addToCart(product._id, quantity);
  };

  const handleBuyNow = async () => {
    const added = await addToCart(product._id, quantity);
    if (added) {
      navigate('/checkout');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to leave a review', 'info');
      navigate('/login');
      return;
    }

    try {
      setIsSubmittingReview(true);
      const res = await API.post(`/products/${id}/reviews`, {
        rating: newRating,
        comment: newComment
      });

      if (res.data.success) {
        showToast('Review submitted successfully!', 'success');
        setReviews([res.data.review, ...reviews]);
        setProduct(res.data.product);
        setNewComment('');
        setNewRating(5);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit review';
      showToast(msg, 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const discountPercent =
    product.discount ||
    (product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-800 transition">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/products" className="hover:text-slate-800 transition">Products</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to={`/products?category=${encodeURIComponent(product.categoryName)}`} className="hover:text-slate-800 transition">
          {product.categoryName}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Product Media Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-square bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs relative">
            <img
              src={product.images[selectedImage] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-rose-500 text-white rounded-full text-xs font-bold uppercase shadow-md">
                {discountPercent}% OFF
              </span>
            )}
            <button
              onClick={handleWishlistToggle}
              className={`absolute top-4 right-4 p-3 rounded-full transition shadow-md ${
                wishlisted ? 'bg-rose-50 text-rose-500' : 'bg-white/90 text-slate-400 hover:text-rose-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                    selectedImage === idx ? 'border-indigo-600 shadow-md' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                {product.brand || 'CloudCart Exclusive'}
              </span>
              <span className="text-xs text-slate-500">
                SKU: {product._id.substring(18).toUpperCase()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Ratings & Stock */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 rounded-lg text-amber-700 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating ? Number(product.rating).toFixed(1) : '4.5'}</span>
              </div>
              <span className="text-xs text-slate-500">
                {reviews.length || product.numReviews || 0} Customer Reviews
              </span>
              <span className="text-slate-300">•</span>
              {product.stock > 0 ? (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="text-xs font-semibold text-rose-500">
                  Currently Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-baseline gap-3">
            <span className="text-3xl font-black text-slate-900">
              ${Number(product.price).toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-base text-slate-400 line-through">
                ${Number(product.originalPrice).toFixed(2)}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full ml-auto">
                Save ${(product.originalPrice - product.price).toFixed(2)} ({discountPercent}%)
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Overview
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700 uppercase">Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="px-3 py-1.5 text-slate-600 hover:text-indigo-600 disabled:opacity-30 transition font-bold"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-sm font-bold text-slate-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="px-3 py-1.5 text-slate-600 hover:text-indigo-600 disabled:opacity-30 transition font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-200 disabled:cursor-not-allowed text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 disabled:bg-slate-200 disabled:cursor-not-allowed text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                Buy Now
              </button>
            </div>
          </div>

          {/* Highlights & Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 text-center">
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <Truck className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-slate-800">Free Express</p>
              <p className="text-[10px] text-slate-400">On orders over $50</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <RotateCcw className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-slate-800">30-Day Return</p>
              <p className="text-[10px] text-slate-400">Simple store credit</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-slate-800">100% Genuine</p>
              <p className="text-[10px] text-slate-400">Direct from factory</p>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Table (if any) */}
      {product.specifications && product.specifications.length > 0 && (
        <section className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Product Specifications</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {product.specifications.map((spec, index) => (
              <div key={index} className="flex justify-between py-2.5 px-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="font-semibold text-slate-500">{spec.key}</span>
                <span className="font-bold text-slate-800">{spec.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Customer Reviews & Feedback Form */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Customer Reviews ({reviews.length})
            </h3>
          </div>
        </div>

        {/* Write a Review Form */}
        <form onSubmit={handleReviewSubmit} className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-4">
          <h4 className="text-sm font-bold text-slate-900">Write an honest product review</h4>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Your Rating:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setNewRating(star)}
                  className="p-1 hover:scale-110 transition"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <textarea
            rows="3"
            required
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your experience with this item..."
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
          ></textarea>
          <button
            type="submit"
            disabled={isSubmittingReview}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            {isSubmittingReview ? 'Submitting...' : 'Post Review'}
          </button>
        </form>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              No reviews yet. Be the first to review this product!
            </p>
          ) : (
            reviews.map((rev) => (
              <div key={rev._id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {rev.userName ? rev.userName.charAt(0) : 'U'}
                    </div>
                    <span className="text-xs font-bold text-slate-800">{rev.userName}</span>
                  </div>
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600">{rev.comment}</p>
                <span className="text-[10px] text-slate-400 block">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-4">
          <h3 className="text-xl font-bold text-slate-900">Related Products</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailsPage;
