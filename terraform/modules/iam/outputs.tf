output "ec2_instance_profile_name" {
  description = "Name of the EC2 IAM Instance Profile"
  value       = aws_iam_instance_profile.ec2_instance_profile.name
}

output "ec2_instance_profile_arn" {
  description = "ARN of the EC2 IAM Instance Profile"
  value       = aws_iam_instance_profile.ec2_instance_profile.arn
}

output "ec2_role_arn" {
  description = "ARN of the EC2 Application Role"
  value       = aws_iam_role.ec2_app_role.arn
}

output "lambda_role_arn" {
  description = "ARN of the Lambda Execution Role"
  value       = aws_iam_role.lambda_order_notification_role.arn
}
