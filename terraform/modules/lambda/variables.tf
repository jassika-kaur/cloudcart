variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "lambda_role_arn" {
  type = string
}

variable "source_dir" {
  type        = string
  description = "Path to the Lambda source directory"
}
