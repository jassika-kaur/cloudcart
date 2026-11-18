output "sns_topic_arn" {
  description = "ARN of the CloudCart SNS Ops Alerts Topic"
  value       = aws_sns_topic.ops_alerts.arn
}

output "dashboard_name" {
  description = "Name of the CloudWatch dashboard"
  value       = aws_cloudwatch_dashboard.overview.dashboard_name
}
