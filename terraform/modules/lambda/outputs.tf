output "function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.order_notification.function_name
}

output "function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.order_notification.arn
}
