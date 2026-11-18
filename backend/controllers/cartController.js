const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper to get or create a cart for the user
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name slug price originalPrice discount images stock category categoryName'
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Filter out items where product may have been deleted
    const validItems = cart.items.filter(item => item.product != null);
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    // Calculate totals
    let subtotal = 0;
    let totalDiscount = 0;

    cart.items.forEach(item => {
      const currentPrice = item.product.price;
      const original = item.product.originalPrice || currentPrice;
      subtotal += currentPrice * item.quantity;
      if (original > currentPrice) {
        totalDiscount += (original - currentPrice) * item.quantity;
      }
    });

    const shippingPrice = subtotal > 50 || subtotal === 0 ? 0 : 5; // Free shipping over $50
    const totalAmount = subtotal + shippingPrice;

    res.status(200).json({
      success: true,
      cart: {
        _id: cart._id,
        items: cart.items,
        totalItems: cart.items.reduce((acc, item) => acc + item.quantity, 0),
        subtotal: Math.round(subtotal * 100) / 100,
        totalDiscount: Math.round(totalDiscount * 100) / 100,
        shippingPrice,
        totalAmount: Math.round(totalAmount * 100) / 100
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.stock < 1) {
      return res.status(400).json({
        success: false,
        message: 'Product is currently out of stock'
      });
    }

    const qtyToAdd = Math.max(1, parseInt(quantity, 10));
    let cart = await getOrCreateCart(req.user._id);

    // Check if item already exists in cart
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      const newQty = cart.items[itemIndex].quantity + qtyToAdd;
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more than available stock (${product.stock})`
        });
      }
      cart.items[itemIndex].quantity = newQty;
      cart.items[itemIndex].price = product.price;
    } else {
      if (qtyToAdd > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Requested quantity exceeds available stock (${product.stock})`
        });
      }
      cart.items.push({
        product: product._id,
        quantity: qtyToAdd,
        price: product.price
      });
    }

    await cart.save();
    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
// @access  Private
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const itemId = req.params.id;

    if (quantity === undefined || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity greater than zero is required'
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    const product = await Product.findById(item.product);
    if (!product) {
      cart.items.pull(itemId);
      await cart.save();
      return res.status(404).json({
        success: false,
        message: 'Product no longer exists. Removed from cart.'
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Maximum available stock is ${product.stock}`
      });
    }

    item.quantity = Number(quantity);
    item.price = product.price;
    await cart.save();

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items.pull({ _id: req.params.id });
    await cart.save();

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart: {
        items: [],
        totalItems: 0,
        subtotal: 0,
        totalDiscount: 0,
        shippingPrice: 0,
        totalAmount: 0
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
