const Order = require('../models/Order');
const Cart = require('../models/Cart');
const {
  validateAndCalculateOrder,
  deductInventoryStock,
  restoreInventoryStock
} = require('../services/orderService');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required'
      });
    }

    // Validate stock and recalculate prices on backend to prevent tampering
    const {
      processedItems,
      itemsPrice,
      shippingPrice,
      discountPrice,
      totalAmount
    } = await validateAndCalculateOrder(items);

    const isOnlinePayment = paymentMethod === 'Simulated Card' || paymentMethod === 'Simulated UPI';

    const order = new Order({
      user: req.user._id,
      items: processedItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      paymentStatus: isOnlinePayment ? 'Completed' : 'Pending',
      isPaid: isOnlinePayment,
      paidAt: isOnlinePayment ? new Date() : undefined,
      orderStatus: isOnlinePayment ? 'Confirmed' : 'Pending',
      itemsPrice,
      shippingPrice,
      discountPrice,
      totalAmount,
      statusTimeline: [
        {
          status: isOnlinePayment ? 'Confirmed' : 'Pending',
          timestamp: new Date(),
          note: isOnlinePayment ? 'Payment verified and order placed successfully.' : 'Order placed with Cash on Delivery.'
        }
      ]
    });

    const createdOrder = await order.save();

    // Deduct stock from products
    await deductInventoryStock(processedItems);

    // Empty user's cart
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [] } }
    );

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: createdOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Ownership check: must be owner or admin
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Ownership check: must be owner or admin
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this order'
      });
    }

    // Check if order is eligible for cancellation
    const nonCancellableStatuses = ['Shipped', 'Delivered', 'Cancelled'];
    if (nonCancellableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already ${order.orderStatus}`
      });
    }

    order.orderStatus = 'Cancelled';
    order.statusTimeline.push({
      status: 'Cancelled',
      timestamp: new Date(),
      note: req.body.reason || 'Cancelled by customer'
    });

    if (order.isPaid) {
      order.paymentStatus = 'Refunded';
    }

    await order.save();

    // Restore stock to inventory
    await restoreInventoryStock(order.items);

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate payment completion
// @route   PUT /api/orders/:id/pay
// @access  Private
const simulatePayment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentStatus = 'Completed';
    order.orderStatus = 'Confirmed';
    order.paymentResult = {
      id: 'SIM_PAY_' + Date.now(),
      status: 'COMPLETED',
      update_time: new Date().toISOString(),
      email_address: req.user.email
    };

    order.statusTimeline.push({
      status: 'Confirmed',
      timestamp: new Date(),
      note: 'Payment received via simulated gateway.'
    });

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment simulation successful',
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  simulatePayment
};
