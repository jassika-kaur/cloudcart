const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  toggleUserBlock
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardAnalytics);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/users', getAllUsers);
router.put('/users/:id/block', toggleUserBlock);

module.exports = router;
