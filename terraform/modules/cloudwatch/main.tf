# ==============================================================================
# CloudCart – CloudWatch Monitoring, Alarms & SNS Alerting Module
# ==============================================================================

# SNS Topic for System & Operational Alerts
resource "aws_sns_topic" "ops_alerts" {
  name = "${var.project_name}-${var.environment}-ops-alerts"

  tags = {
    Name = "${var.project_name}-ops-alerts"
  }
}

resource "aws_sns_topic_subscription" "email_sub" {
  topic_arn = aws_sns_topic.ops_alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# ------------------------------------------------------------------------------
# CloudWatch Metric Alarms
# ------------------------------------------------------------------------------

# Alarm 1: High CPU Utilization on EC2 Auto Scaling Cluster
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "${var.project_name}-${var.environment}-high-cpu-utilization"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 70
  alarm_description   = "Triggers when average cluster CPU utilization exceeds 70% for 10 minutes"
  alarm_actions       = [aws_sns_topic.ops_alerts.arn]
  ok_actions          = [aws_sns_topic.ops_alerts.arn]

  dimensions = {
    AutoScalingGroupName = var.asg_name
  }
}

# Alarm 2: EC2 Status Check Failed
resource "aws_cloudwatch_metric_alarm" "status_check_failed" {
  alarm_name          = "${var.project_name}-${var.environment}-status-check-failed"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "StatusCheckFailed"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Maximum"
  threshold           = 1
  alarm_description   = "Triggers when an EC2 instance fails hypervisor or OS status check"
  alarm_actions       = [aws_sns_topic.ops_alerts.arn]

  dimensions = {
    AutoScalingGroupName = var.asg_name
  }
}

# ------------------------------------------------------------------------------
# Unified CloudWatch Operational Dashboard
# ------------------------------------------------------------------------------
resource "aws_cloudwatch_dashboard" "overview" {
  dashboard_name = "${var.project_name}-${var.environment}-overview"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/EC2", "CPUUtilization", "AutoScalingGroupName", var.asg_name, { "stat" : "Average", "color" : "#1f77b4" }],
            ["...", { "stat" : "Maximum", "color" : "#d62728" }]
          ]
          view   = "timeSeries"
          region = var.aws_region
          title  = "EC2 Cluster CPU Utilization (%)"
          period = 300
          yAxis = {
            left = { min = 0, max = 100 }
          }
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["CloudCart/SystemMetrics", "mem_used_percent", "AutoScalingGroupName", var.asg_name, { "stat" : "Average", "color" : "#2ca02c" }]
          ]
          view   = "timeSeries"
          region = var.aws_region
          title  = "EC2 Cluster Memory Utilization (%)"
          period = 300
          yAxis = {
            left = { min = 0, max = 100 }
          }
        }
      }
    ]
  })
}
