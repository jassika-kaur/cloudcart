# ==============================================================================
# CloudCart – Terraform Root Variables Specification
# ==============================================================================

variable "aws_region" {
  description = "AWS deployment region"
  type        = string
  default     = "ap-south-1"
}

# --- AWS Authentication (Optional: Can also be set via AWS_ACCESS_KEY_ID env vars) ---
variable "aws_access_key" {
  description = "AWS Access Key ID (optional, defaults to environment variable if null)"
  type        = string
  default     = null
  sensitive   = true
}

variable "aws_secret_key" {
  description = "AWS Secret Access Key (optional, defaults to environment variable if null)"
  type        = string
  default     = null
  sensitive   = true
}

variable "aws_session_token" {
  description = "AWS Session Token (optional, required if using AWS Academy / Learner Lab)"
  type        = string
  default     = null
  sensitive   = true
}

variable "environment" {
  description = "Deployment environment (e.g. dev, staging, production)"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Base name for CloudCart resource naming and tagging"
  type        = string
  default     = "cloudcart"
}

# --- VPC & Networking Variables ---
variable "vpc_cidr" {
  description = "IPv4 CIDR block for the CloudCart VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of Availability Zones to deploy across for Multi-AZ redundancy"
  type        = list(string)
  default     = ["ap-south-1a", "ap-south-1b"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public ingress subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private application compute subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24"]
}

variable "enable_single_nat_gateway" {
  description = "Use a single NAT Gateway instead of one per AZ to optimize costs during testing"
  type        = bool
  default     = true
}

# --- Compute & Auto Scaling Variables ---
variable "instance_type" {
  description = "EC2 instance type for application nodes (e.g. t3.small, t3.medium, or t2.micro for Free Tier)"
  type        = string
  default     = "t3.small"
}

variable "asg_min_size" {
  description = "Minimum number of instances in Auto Scaling Group"
  type        = number
  default     = 1
}

variable "asg_max_size" {
  description = "Maximum number of instances in Auto Scaling Group"
  type        = number
  default     = 3
}

variable "asg_desired_capacity" {
  description = "Desired number of instances in Auto Scaling Group"
  type        = number
  default     = 2
}

variable "asg_target_cpu_utilization" {
  description = "Target average CPU utilization percentage to trigger horizontal scaling"
  type        = number
  default     = 70.0
}

# --- Docker Hub Images ---
variable "frontend_image" {
  description = "Docker image for CloudCart React/Nginx frontend"
  type        = string
  default     = "jassikakaur/cloudcart-frontend:v1.0.0"
}

variable "backend_image" {
  description = "Docker image for CloudCart Node.js/Express backend"
  type        = string
  default     = "jassikakaur/cloudcart-backend:v1.0.0"
}

variable "frontend_host_port" {
  description = "Host port exposed for frontend container"
  type        = number
  default     = 3000
}

variable "backend_host_port" {
  description = "Host port exposed for backend container"
  type        = number
  default     = 5000
}

# --- Secrets & Application Parameters ---
variable "mongo_uri" {
  description = "MongoDB connection string (MongoDB Atlas URI or internal VPC MongoDB endpoint)"
  type        = string
  default     = "mongodb://admin:CloudCart2026Secure@mongodb:27017/cloudcart?authSource=admin"
}

variable "jwt_secret" {
  description = "Cryptographically secure secret key for signing JSON Web Tokens"
  type        = string
  sensitive   = true
  default     = "c10udc4rt_jwt_sup3r_s3cr3t_k3y_pr0duct10n_2026_mumb41!"
}

# --- Ingress & SSL ---
variable "enable_https" {
  description = "Enable HTTPS listener and SSL termination on the Application Load Balancer"
  type        = bool
  default     = false
}

variable "acm_certificate_arn" {
  description = "ARN of the ACM SSL/TLS certificate if enable_https is true"
  type        = string
  default     = ""
}

# --- Monitoring & Notifications ---
variable "alert_email" {
  description = "Email address for Amazon SNS system alert notifications"
  type        = string
  default     = "devops-alerts@cloudcart.internal"
}
