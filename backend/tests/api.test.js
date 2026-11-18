const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Order = require('../models/Order');

let customerToken;
let adminToken;
let customerId;
let testCategory;
let testProduct;
let cartItemId;

beforeAll(async () => {
  const testUri = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/cloudcart_test';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(testUri);
  }

  // Clear test DB
  await User.deleteMany();
  await Category.deleteMany();
  await Product.deleteMany();
  await Cart.deleteMany();
  await Wishlist.deleteMany();
  await Order.deleteMany();

  // Seed initial Category and Product for testing
  testCategory = await Category.create({
    name: 'Electronics Test',
    description: 'Electronics for automated tests',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8'
  });

  testProduct = await Product.create({
    name: 'CloudBook Test Laptop',
    description: 'High performance laptop for testing purposes',
    price: 999.99,
    originalPrice: 1199.99,
    discount: 17,
    category: testCategory._id,
    categoryName: testCategory.name,
    brand: 'TestBrand',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8'],
    stock: 50
  });

  // Create an Admin user
  await User.create({
    name: 'System Admin',
    email: 'admin_test@cloudcart.com',
    password: 'Password123!',
    role: 'admin'
  });

  const adminLoginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin_test@cloudcart.com',
      password: 'Password123!'
    });

  adminToken = adminLoginRes.body.token;
});

afterAll(async () => {
  await User.deleteMany();
  await Category.deleteMany();
  await Product.deleteMany();
  await Cart.deleteMany();
  await Wishlist.deleteMany();
  await Order.deleteMany();
  await mongoose.disconnect();
});

describe('CloudCart API Test Suite', () => {
  // 1. User Registration
  test('POST /api/auth/register should register a new customer', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john_test@cloudcart.com',
        password: 'Password123!'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('john_test@cloudcart.com');
    expect(res.body.user.role).toBe('customer');

    customerToken = res.body.token;
    customerId = res.body.user._id;
  });

  // 2. User Login
  test('POST /api/auth/login should authenticate user and return token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john_test@cloudcart.com',
        password: 'Password123!'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  // 3. User Login validation
  test('POST /api/auth/login should fail with invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john_test@cloudcart.com',
        password: 'WrongPassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 4. Product Listing
  test('GET /api/products should return list of products', async () => {
    const res = await request(app).get('/api/products');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products.length).toBeGreaterThan(0);
  });

  // 5. Product Search
  test('GET /api/products?keyword=Laptop should return matching search results', async () => {
    const res = await request(app).get('/api/products?keyword=Laptop');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.products.length).toBeGreaterThan(0);
    expect(res.body.products[0].name).toContain('Laptop');
  });

  // 6. Adding Product to Cart
  test('POST /api/cart should add product to customer cart', async () => {
    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productId: testProduct._id.toString(),
        quantity: 2
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.cart.items.length).toBe(1);
    expect(res.body.cart.totalItems).toBe(2);

    cartItemId = res.body.cart.items[0]._id;
  });

  // 7. Updating Cart Quantities
  test('PUT /api/cart/:id should update quantity in cart', async () => {
    const res = await request(app)
      .put(`/api/cart/${cartItemId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        quantity: 3
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.cart.totalItems).toBe(3);
  });

  // 8. Order Creation
  test('POST /api/orders should create an order from items and address', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [
          {
            product: testProduct._id.toString(),
            quantity: 1
          }
        ],
        shippingAddress: {
          fullName: 'John Doe',
          phone: '+1 555 123 4567',
          street: '123 Test Street',
          city: 'Tech City',
          state: 'California',
          postalCode: '90001',
          country: 'United States'
        },
        paymentMethod: 'Cash on Delivery'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.order.orderNumber).toBeDefined();
    expect(res.body.order.orderStatus).toBe('Pending');
    expect(res.body.order.items.length).toBe(1);
  });

  // 9. Admin Authorization Check
  test('GET /api/admin/dashboard should reject standard customer with 403', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/admin/dashboard should succeed for admin user', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats).toBeDefined();
    expect(res.body.stats.totalProducts).toBeGreaterThanOrEqual(1);
  });
});
