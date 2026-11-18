const Product = require('../models/Product');

/**
 * Validates order items, checks stock, and calculates prices
 */
const validateAndCalculateOrder = async (items) => {
  if (!items || items.length === 0) {
    throw new Error('No order items provided');
  }

  const processedItems = [];
  let itemsPrice = 0;

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new Error(`Product not found: ${item.product}`);
    }

    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stock}`);
    }

    const price = product.price;
    const itemTotal = price * item.quantity;
    itemsPrice += itemTotal;

    processedItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      price: price,
      quantity: item.quantity
    });
  }

  const shippingPrice = itemsPrice > 50 ? 0 : 5; // Free shipping over $50
  const discountPrice = 0;
  const totalAmount = itemsPrice + shippingPrice - discountPrice;

  return {
    processedItems,
    itemsPrice: Math.round(itemsPrice * 100) / 100,
    shippingPrice,
    discountPrice,
    totalAmount: Math.round(totalAmount * 100) / 100
  };
};

/**
 * Decrement product stock when order is placed
 */
const deductInventoryStock = async (items) => {
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity }
    });
  }
};

/**
 * Restore product stock when order is cancelled
 */
const restoreInventoryStock = async (items) => {
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity }
    });
  }
};

module.exports = {
  validateAndCalculateOrder,
  deductInventoryStock,
  restoreInventoryStock
};
