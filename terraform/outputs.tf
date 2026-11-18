# ==============================================================================
# CloudCart – Terraform Root Outputs Specification
# ==============================================================================

output "alb_dns_name" {
  description = "Public URL to access CloudCart via the Application Load Balancer"
  value       = module.alb.alb_dns_name
}

output "alb_arn" {
  description = "ARN of the Application Load Balancer"
  value       = module.alb.alb_arn
}

output "vpc_id" {
  description = "ID of the CloudCart VPC"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "List of private compute subnet IDs"
  value       = module.vpc.private_subnet_ids
}

output "s3_bucket_name" {
  description = "Name of the S3 product catalog images bucket"
  value       = module.s3.bucket_id
}

output "s3_bucket_arn" {
  description = "ARN of the S3 product catalog images bucket"
  value       = module.s3.bucket_arn
}

output "asg_name" {
  description = "Name of the EC2 Auto Scaling Group"
  value       = module.asg.asg_name
}

output "cloudwatch_dashboard_name" {
  description = "Name of the CloudWatch operational dashboard"
  value       = module.cloudwatch.dashboard_name
}

output "sns_alert_topic_arn" {
  description = "ARN of the SNS topic for operational alerts"
  value       = module.cloudwatch.sns_topic_arn
}

output "lambda_order_notification_name" {
  description = "Name of the order notification serverless Lambda function"
  value       = module.lambda.function_name
}
