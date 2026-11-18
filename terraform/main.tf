# ==============================================================================
# CloudCart – Terraform Root Infrastructure Orchestration
# Project: CloudCart (Cloud-Native E-Commerce Platform)
# AWS Region: ap-south-1 (Mumbai)
# ==============================================================================

# 1. Virtual Private Cloud (VPC) & Multi-AZ Networking
module "vpc" {
  source = "./modules/vpc"

  project_name              = var.project_name
  environment               = var.environment
  vpc_cidr                  = var.vpc_cidr
  availability_zones        = var.availability_zones
  public_subnet_cidrs       = var.public_subnet_cidrs
  private_subnet_cidrs      = var.private_subnet_cidrs
  enable_single_nat_gateway = var.enable_single_nat_gateway
}

# 2. Least Privilege Layer 4 Security Groups
module "security" {
  source = "./modules/security"

  project_name  = var.project_name
  environment   = var.environment
  vpc_id        = module.vpc.vpc_id
  vpc_cidr      = var.vpc_cidr
  frontend_port = var.frontend_host_port
  backend_port  = var.backend_host_port
}

# 3. Amazon S3 Media Storage with SSE-S3 AES-256 Encryption
module "s3" {
  source = "./modules/s3"

  project_name = var.project_name
  environment  = var.environment
}

# 4. Identity & Access Management (IAM Roles & IMDSv2 Instance Profile)
module "iam" {
  source = "./modules/iam"

  project_name  = var.project_name
  environment   = var.environment
  s3_bucket_arn = module.s3.bucket_arn
}

# 5. Application Load Balancer (ALB) with Path Routing
module "alb" {
  source = "./modules/alb"

  project_name          = var.project_name
  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  public_subnet_ids     = module.vpc.public_subnet_ids
  alb_security_group_id = module.security.alb_security_group_id
  frontend_port         = var.frontend_host_port
  backend_port          = var.backend_host_port
  enable_https          = var.enable_https
  acm_certificate_arn   = var.acm_certificate_arn
}

# 6. EC2 Auto Scaling Group (ASG) & Launch Template (Docker Stack)
module "asg" {
  source = "./modules/asg"

  project_name              = var.project_name
  environment               = var.environment
  aws_region                = var.aws_region
  private_subnet_ids        = module.vpc.private_subnet_ids
  app_security_group_id     = module.security.app_security_group_id
  ec2_instance_profile_name = module.iam.ec2_instance_profile_name
  frontend_target_group_arn = module.alb.frontend_target_group_arn
  backend_target_group_arn  = module.alb.backend_target_group_arn

  instance_type          = var.instance_type
  min_size               = var.asg_min_size
  max_size               = var.asg_max_size
  desired_capacity       = var.asg_desired_capacity
  target_cpu_utilization = var.asg_target_cpu_utilization

  frontend_image     = var.frontend_image
  backend_image      = var.backend_image
  frontend_host_port = var.frontend_host_port
  backend_host_port  = var.backend_host_port

  s3_bucket_name = module.s3.bucket_id
  mongo_uri      = var.mongo_uri
  jwt_secret     = var.jwt_secret
}

# 7. CloudWatch Telemetry, Alarms & SNS Alerting
module "cloudwatch" {
  source = "./modules/cloudwatch"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region
  asg_name     = module.asg.asg_name
  alert_email  = var.alert_email
}

# 8. Serverless Order Notification Lambda
module "lambda" {
  source = "./modules/lambda"

  project_name    = var.project_name
  environment     = var.environment
  aws_region      = var.aws_region
  lambda_role_arn = module.iam.lambda_role_arn
  source_dir      = "${path.root}/../aws/lambda/order-notification"
}
