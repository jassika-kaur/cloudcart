const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const path = require('path');

// Initialize AWS S3 Client using AWS SDK v3
// Automatically resolves credentials from the EC2 IAM Instance Profile / Role
const region = process.env.AWS_REGION || 'ap-south-1';
const bucketName = process.env.AWS_S3_BUCKET;

let s3Client = null;

if (bucketName) {
  s3Client = new S3Client({
    region,
    // AWS SDK v3 default credential provider chain:
    // 1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
    // 2. IAM Roles for Amazon EC2 (Instance Profile via IMDSv2)
    // 3. ECS task roles
  });
  console.log(`[AWS S3] Initialized client for bucket "${bucketName}" in region "${region}"`);
} else {
  console.log('[AWS S3] AWS_S3_BUCKET not set. Falling back to local disk storage for uploads.');
}

/**
 * Uploads a file buffer directly to Amazon S3 with server-side encryption
 * @param {Buffer} fileBuffer - Raw buffer of the file
 * @param {string} originalName - Original filename
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<{ key: string, url: string }>}
 */
const uploadToS3 = async (fileBuffer, originalName, mimeType) => {
  if (!s3Client || !bucketName) {
    throw new Error('S3 Client is not configured. Set AWS_S3_BUCKET environment variable.');
  }

  const ext = path.extname(originalName).toLowerCase();
  const uniqueKey = `products/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: uniqueKey,
    Body: fileBuffer,
    ContentType: mimeType,
    ServerSideEncryption: 'AES256', // S3-managed encryption key (SSE-S3)
    Metadata: {
      'original-name': originalName,
      'uploaded-by': 'cloudcart-backend'
    }
  });

  await s3Client.send(command);

  // If the bucket uses a CloudFront distribution or public read policy:
  const directUrl = process.env.CLOUDFRONT_DOMAIN
    ? `https://${process.env.CLOUDFRONT_DOMAIN}/${uniqueKey}`
    : `https://${bucketName}.s3.${region}.amazonaws.com/${uniqueKey}`;

  return {
    key: uniqueKey,
    url: directUrl,
    bucket: bucketName,
    region
  };
};

/**
 * Generates a time-limited presigned GET URL for private bucket objects
 * @param {string} key - S3 object key
 * @param {number} expiresIn - Expiration time in seconds (default 3600 = 1 hour)
 * @returns {Promise<string>}
 */
const getPresignedDownloadUrl = async (key, expiresIn = 3600) => {
  if (!s3Client || !bucketName) {
    throw new Error('S3 Client is not configured');
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
};

/**
 * Deletes an object from Amazon S3
 * @param {string} key - S3 object key
 */
const deleteFromS3 = async (key) => {
  if (!s3Client || !bucketName) return;

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key
  });

  await s3Client.send(command);
};

const isS3Configured = () => {
  return !!(s3Client && bucketName);
};

module.exports = {
  uploadToS3,
  getPresignedDownloadUrl,
  deleteFromS3,
  isS3Configured
};
