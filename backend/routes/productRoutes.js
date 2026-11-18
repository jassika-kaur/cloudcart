const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadToS3, getPresignedDownloadUrl, isS3Configured } = require('../services/s3Service');

// Upload product image route (Amazon S3 with local disk fallback)
router.post('/upload', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    // If Amazon S3 is configured, stream buffer to S3 bucket
    if (isS3Configured() && req.file.buffer) {
      const s3Result = await uploadToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
      return res.status(200).json({
        success: true,
        message: 'Image uploaded to Amazon S3 successfully',
        url: s3Result.url,
        key: s3Result.key,
        storage: 's3'
      });
    }

    // Fallback: local disk storage
    const filePath = `/uploads/${req.file.filename}`;
    res.status(200).json({
      success: true,
      message: 'Image uploaded to local storage successfully',
      url: filePath,
      storage: 'local'
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: `Image upload failed: ${error.message}`
    });
  }
});

// Endpoint to generate presigned S3 URLs for private image access
router.get('/presigned-url', protect, async (req, res) => {
  try {
    const { key } = req.query;
    if (!key) {
      return res.status(400).json({ success: false, message: 'S3 object key is required' });
    }
    if (!isS3Configured()) {
      return res.status(400).json({ success: false, message: 'Amazon S3 is not configured' });
    }
    const presignedUrl = await getPresignedDownloadUrl(key, 3600);
    res.status(200).json({ success: true, url: presignedUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.route('/')
  .get(getProducts)
  .post(protect, adminOnly, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, adminOnly, updateProduct)
  .delete(protect, adminOnly, deleteProduct);

router.get('/:id/related', getRelatedProducts);

router.route('/:id/reviews')
  .get(getProductReviews)
  .post(protect, createProductReview);

module.exports = router;
