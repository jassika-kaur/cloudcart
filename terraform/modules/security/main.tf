# ==============================================================================
# CloudCart – Security Groups Module (Least Privilege Layer 4 Firewalls)
# ==============================================================================

# 1. ALB Security Group (Public Ingress)
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-${var.environment}-alb-sg"
  description = "Security group for CloudCart Application Load Balancer"
  vpc_id      = var.vpc_id

  # Public HTTP Ingress
  ingress {
    description = "Allow inbound HTTP from anywhere for redirection"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Public HTTPS Ingress
  ingress {
    description = "Allow inbound HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound to EC2 instances
  egress {
    description = "Allow outbound to EC2 application tier"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-alb-sg"
  }
}

# 2. EC2 Application Security Group (Private Compute)
resource "aws_security_group" "app" {
  name        = "${var.project_name}-${var.environment}-app-sg"
  description = "Security group for CloudCart EC2 application instances"
  vpc_id      = var.vpc_id

  # Ingress from ALB to Frontend Container
  ingress {
    description     = "Allow traffic to Frontend container strictly from ALB"
    from_port       = var.frontend_port
    to_port         = var.frontend_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # Ingress from ALB to Backend API Container
  ingress {
    description     = "Allow traffic to Backend API container strictly from ALB"
    from_port       = var.backend_port
    to_port         = var.backend_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # Ingress for Prometheus (Port 9090 - Private Internal VPC Access Only)
  ingress {
    description = "Allow Prometheus internal scraping strictly within VPC"
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  # Ingress for Node Exporter (Port 9100 - Private Internal VPC Access Only)
  ingress {
    description = "Allow Node Exporter internal metrics strictly within VPC"
    from_port   = 9100
    to_port     = 9100
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  # Ingress for Grafana Dashboard (Port 3001 - Restricted Admin Access)
  ingress {
    description = "Allow Grafana analytics access from authorized admin CIDR"
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = var.admin_cidr_blocks
  }

  # Ingress for Jenkins CI/CD Controller (Port 8080 - Restricted Admin Access)
  ingress {
    description = "Allow Jenkins controller access from authorized admin CIDR"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = var.admin_cidr_blocks
  }

  # Outbound to Internet via NAT Gateway (Docker Hub pulls, S3 API calls, etc.)
  egress {
    description = "Allow all outbound traffic via NAT Gateway"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-app-sg"
  }
}

# 3. Database Security Group (Private MongoDB Tier)
resource "aws_security_group" "mongodb" {
  name        = "${var.project_name}-${var.environment}-mongodb-sg"
  description = "Security group for CloudCart MongoDB database"
  vpc_id      = var.vpc_id

  # Ingress strictly from App Tier
  ingress {
    description     = "Allow MongoDB access strictly from EC2 App Security Group"
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  egress {
    description = "Allow outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-mongodb-sg"
  }
}
