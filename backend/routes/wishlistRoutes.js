const express = require('express');
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All wishlist routes are protected

router.route('/')
  .get(getWishlist)
  .post(addToWishlist);

router.route('/:id')
  .delete(removeFromWishlist);

router.post('/:id/move-to-cart', moveToCart);

module.exports = router;
