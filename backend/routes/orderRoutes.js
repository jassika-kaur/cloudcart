const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  simulatePayment
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All order routes require authentication

router.route('/')
  .post(createOrder);

router.get('/my-orders', getMyOrders);

router.route('/:id')
  .get(getOrderById);

router.put('/:id/cancel', cancelOrder);
router.put('/:id/pay', simulatePayment);

module.exports = router;
