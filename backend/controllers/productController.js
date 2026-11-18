const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');

// @desc    Get all products with filtering, search, sorting & pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      rating,
      inStock,
      isFeatured,
      isTrending,
      isBestSeller,
      isNewArrival,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // Search keyword
    if (keyword && keyword.trim() !== '') {
      query.$or = [
        { name: { $regex: keyword.trim(), $options: 'i' } },
        { description: { $regex: keyword.trim(), $options: 'i' } },
        { brand: { $regex: keyword.trim(), $options: 'i' } },
        { categoryName: { $regex: keyword.trim(), $options: 'i' } }
      ];
    }

    // Category filter (support category ObjectId or slug/name)
    if (category && category !== 'all' && category !== '') {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        query.categoryName = { $regex: `^${category}$`, $options: 'i' };
      }
    }

    // Price filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        query.price.$lte = Number(maxPrice);
      }
    }

    // Rating filter
    if (rating !== undefined && rating !== '') {
      query.rating = { $gte: Number(rating) };
    }

    // In-Stock availability filter
    if (inStock === 'true' || inStock === true) {
      query.stock = { $gt: 0 };
    }

    // Special badges/sections
    if (isFeatured === 'true' || isFeatured === true) query.isFeatured = true;
    if (isTrending === 'true' || isTrending === true) query.isTrending = true;
    if (isBestSeller === 'true' || isBestSeller === true) query.isBestSeller = true;
    if (isNewArrival === 'true' || isNewArrival === true) query.isNewArrival = true;

    // Sorting
    let sortOptions = { createdAt: -1 }; // default newest
    if (sort === 'price-asc' || sort === 'price_asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price-desc' || sort === 'price_desc') {
      sortOptions = { price: -1 };
    } else if (sort === 'rating' || sort === 'popularity') {
      sortOptions = { rating: -1, numReviews: -1 };
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const skip = (pageNumber - 1) * pageSize;

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    const totalPages = Math.ceil(totalProducts / pageSize);

    res.status(200).json({
      success: true,
      count: products.length,
      totalProducts,
      totalPages,
      currentPage: pageNumber,
      products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID or slug
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: req.params.id } : { slug: req.params.id };

    const product = await Product.findOne(query).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    })
      .limit(4)
      .populate('category', 'name slug');

    res.status(200).json({
      success: true,
      products: related
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      discount,
      category,
      brand,
      images,
      stock,
      isFeatured,
      isTrending,
      isBestSeller,
      isNewArrival,
      specifications
    } = req.body;

    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, description, price, and category'
      });
    }

    const categoryObj = await Category.findById(category);
    if (!categoryObj) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category specified'
      });
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number(price),
      discount: discount ? Number(discount) : 0,
      category: categoryObj._id,
      categoryName: categoryObj.name,
      brand: brand || 'CloudCart',
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'],
      stock: stock !== undefined ? Number(stock) : 10,
      isFeatured: !!isFeatured,
      isTrending: !!isTrending,
      isBestSeller: !!isBestSeller,
      isNewArrival: !!isNewArrival,
      specifications: specifications || []
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (req.body.category && req.body.category !== String(product.category)) {
      const categoryObj = await Category.findById(req.body.category);
      if (categoryObj) {
        product.category = categoryObj._id;
        product.categoryName = categoryObj.name;
      }
    }

    const fields = [
      'name', 'description', 'price', 'originalPrice', 'discount',
      'brand', 'images', 'stock', 'isFeatured', 'isTrending',
      'isBestSeller', 'isNewArrival', 'specifications'
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.findByIdAndDelete(req.params.id);
    await Review.deleteMany({ product: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Product removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both rating and review comment'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed
    const alreadyReviewed = await Review.findOne({
      product: productId,
      user: req.user._id
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    const review = await Review.create({
      user: req.user._id,
      userName: req.user.name,
      product: productId,
      rating: Number(rating),
      comment
    });

    // Fetch updated product with recalculated average rating
    const updatedProduct = await Product.findById(productId);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
      product: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.id })
      .sort({ createdAt: -1 })
      .populate('user', 'name avatar');

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews
};
