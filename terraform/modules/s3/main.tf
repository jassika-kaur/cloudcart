# ==============================================================================
# CloudCart – S3 Media Storage Module
# Zero-Trust Bucket with 100% Block Public Access & SSE-S3 AES-256
# ==============================================================================

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "product_images" {
  bucket        = "${var.project_name}-product-images-${var.environment}-${random_id.bucket_suffix.hex}"
  force_destroy = false

  tags = {
    Name        = "${var.project_name}-product-images"
    Purpose     = "Product catalog media and uploads"
  }
}

# Bucket Versioning for Disaster Recovery
resource "aws_s3_bucket_versioning" "versioning" {
  bucket = aws_s3_bucket.product_images.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Default Server-Side Encryption (SSE-S3 AES256)
resource "aws_s3_bucket_server_side_encryption_configuration" "encryption" {
  bucket = aws_s3_bucket.product_images.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# Strict 100% Block Public Access
resource "aws_s3_bucket_public_access_block" "public_access" {
  bucket = aws_s3_bucket.product_images.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Cross-Origin Resource Sharing (CORS) Policy for Pre-signed URLs
resource "aws_s3_bucket_cors_configuration" "cors" {
  bucket = aws_s3_bucket.product_images.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "HEAD"]
    allowed_origins = ["*"] # Can be restricted to specific domain in production
    expose_headers  = ["ETag", "x-amz-server-side-encryption"]
    max_age_seconds = 3600
  }
}
