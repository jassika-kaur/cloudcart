variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "app_security_group_id" {
  type = string
}

variable "ec2_instance_profile_name" {
  type = string
}

variable "frontend_target_group_arn" {
  type = string
}

variable "backend_target_group_arn" {
  type = string
}

variable "instance_type" {
  type    = string
  default = "t3.small"
}

variable "min_size" {
  type    = number
  default = 2
}

variable "max_size" {
  type    = number
  default = 4
}

variable "desired_capacity" {
  type    = number
  default = 2
}

variable "target_cpu_utilization" {
  type    = number
  default = 70.0
}

variable "frontend_image" {
  type    = string
  default = "jassikakaur/cloudcart-frontend:v1.0.0"
}

variable "backend_image" {
  type    = string
  default = "jassikakaur/cloudcart-backend:v1.0.0"
}

variable "frontend_host_port" {
  type    = number
  default = 3000
}

variable "backend_host_port" {
  type    = number
  default = 5000
}

variable "s3_bucket_name" {
  type = string
}

variable "mongo_uri" {
  type = string
}

variable "jwt_secret" {
  type      = string
  sensitive = true
}
