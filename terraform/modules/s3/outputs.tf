output "bucket_id" {
  description = "Name/ID of the S3 product images bucket"
  value       = aws_s3_bucket.product_images.id
}

output "bucket_arn" {
  description = "ARN of the S3 product images bucket"
  value       = aws_s3_bucket.product_images.arn
}
