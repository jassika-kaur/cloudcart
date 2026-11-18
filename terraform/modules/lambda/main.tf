# ==============================================================================
# CloudCart – Serverless Order Notification Lambda Module
# ==============================================================================

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = var.source_dir
  output_path = "${path.module}/order_notification.zip"
  excludes    = ["node_modules", "package-lock.json", ".git"]
}

resource "aws_lambda_function" "order_notification" {
  function_name    = "${var.project_name}-${var.environment}-order-notification"
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  role             = var.lambda_role_arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 256

  environment {
    variables = {
      SENDER_EMAIL = "no-reply@cloudcart.com"
    }
  }

  tags = {
    Name = "${var.project_name}-order-notification"
  }
}
