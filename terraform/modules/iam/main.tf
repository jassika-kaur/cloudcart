# ==============================================================================
# CloudCart – IAM Module (Principle of Least Privilege & IMDSv2 Instance Roles)
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. EC2 Application Instance Role & Instance Profile
# ------------------------------------------------------------------------------
data "aws_iam_policy_document" "ec2_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ec2_app_role" {
  name               = "${var.project_name}-${var.environment}-ec2-app-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json

  tags = {
    Name = "${var.project_name}-ec2-app-role"
  }
}

resource "aws_iam_instance_profile" "ec2_instance_profile" {
  name = "${var.project_name}-${var.environment}-ec2-instance-profile"
  role = aws_iam_role.ec2_app_role.name
}

# S3 Least Privilege Access Policy
resource "aws_iam_policy" "s3_access" {
  name        = "${var.project_name}-${var.environment}-s3-access-policy"
  description = "Allows CloudCart backend to read, write, and delete product catalog images"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3BucketLevelAccess"
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetBucketLocation"
        ]
        Resource = var.s3_bucket_arn
      },
      {
        Sid    = "S3ObjectLevelReadWrite"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject"
        ]
        Resource = "${var.s3_bucket_arn}/*"
      },
      {
        Sid       = "EnforceTLSRequestsOnly"
        Effect    = "Deny"
        Action    = "s3:*"
        Resource  = [var.s3_bucket_arn, "${var.s3_bucket_arn}/*"]
        Condition = {
          Bool = {
            "aws:SecureTransport" = "false"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "attach_s3" {
  role       = aws_iam_role.ec2_app_role.name
  policy_arn = aws_iam_policy.s3_access.arn
}

# CloudWatch Agent Telemetry Policy
resource "aws_iam_policy" "cloudwatch_agent" {
  name        = "${var.project_name}-${var.environment}-cloudwatch-agent-policy"
  description = "Allows CloudWatch Agent to publish system metrics and stream OS logs"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "CloudWatchMetrics"
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData",
          "cloudwatch:GetMetricData",
          "cloudwatch:GetMetricStatistics",
          "cloudwatch:ListMetrics"
        ]
        Resource = "*"
      },
      {
        Sid    = "CloudWatchLogs"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams",
          "logs:DescribeLogGroups"
        ]
        Resource = "arn:aws:logs:*:*:log-group:/aws/ec2/cloudcart/*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "attach_cloudwatch" {
  role       = aws_iam_role.ec2_app_role.name
  policy_arn = aws_iam_policy.cloudwatch_agent.arn
}

# AWS Systems Manager Managed Policy (Enables Secure Terminal Access without Port 22 SSH)
resource "aws_iam_role_policy_attachment" "attach_ssm" {
  role       = aws_iam_role.ec2_app_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# ------------------------------------------------------------------------------
# 2. Serverless Lambda Execution Role
# ------------------------------------------------------------------------------
data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda_order_notification_role" {
  name               = "${var.project_name}-${var.environment}-lambda-notification-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json

  tags = {
    Name = "${var.project_name}-lambda-notification-role"
  }
}

resource "aws_iam_policy" "lambda_notification" {
  name        = "${var.project_name}-${var.environment}-lambda-notification-policy"
  description = "Allows Lambda to send transactional emails via SES and write logs to CloudWatch"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "CloudWatchLogging"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:log-group:/aws/lambda/*"
      },
      {
        Sid    = "AmazonSESEmailDispatch"
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "attach_lambda_notification" {
  role       = aws_iam_role.lambda_order_notification_role.name
  policy_arn = aws_iam_policy.lambda_notification.arn
}
