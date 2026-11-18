# ==============================================================================
# CloudCart – EC2 Auto Scaling Group (ASG) & Launch Template Module
# Multi-AZ Resilient Compute Stack with IMDSv2 & Dynamic Target Tracking
# ==============================================================================

# Fetch the Latest Amazon Linux 2023 AMI in Mumbai Region
data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-kernel-6.12-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ------------------------------------------------------------------------------
# EC2 Launch Template Specification
# ------------------------------------------------------------------------------
resource "aws_launch_template" "app" {
  name_prefix   = "${var.project_name}-${var.environment}-lt-"
  image_id      = data.aws_ami.al2023.id
  instance_type = var.instance_type

  iam_instance_profile {
    name = var.ec2_instance_profile_name
  }

  vpc_security_group_ids = [var.app_security_group_id]

  # Hardware-enforced IMDSv2 (Mitigates SSRF credential vulnerabilities)
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  # Root EBS Volume with GP3 & Default KMS Encryption
  block_device_mappings {
    device_name = "/dev/xvda"

    ebs {
      volume_size           = 30
      volume_type           = "gp3"
      iops                  = 3000
      throughput            = 125
      encrypted             = true
      delete_on_termination = true
    }
  }

  # Automated Cloud-Init User Data Script
  user_data = base64encode(<<-EOF
    #!/bin/bash
    exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1
    echo "=== Bootstrapping CloudCart Instance: $(date) ==="

    dnf install -y docker jq --allowerasing

    systemctl enable docker
    systemctl start docker
    usermod -aG docker ec2-user

    mkdir -p /opt/cloudcart
    chown -R ec2-user:ec2-user /opt/cloudcart

    cat << 'ENVFILE' > /opt/cloudcart/.env
    NODE_ENV=production
    PORT=5000
    MONGO_URI=${var.mongo_uri}
    JWT_SECRET=${var.jwt_secret}
    JWT_EXPIRE=7d
    AWS_REGION=${var.aws_region}
    AWS_S3_BUCKET=${var.s3_bucket_name}
    CLIENT_URL=http://localhost:${var.frontend_host_port}
    ENVFILE

    chmod 600 /opt/cloudcart/.env

    # Setup Dedicated Bridge Network
    docker network create cloudcart-net 2>/dev/null || true

    # Run Local MongoDB Database Container
    docker run -d \
      --name cloudcart-mongodb \
      --restart unless-stopped \
      --network cloudcart-net \
      --network-alias mongodb \
      -e MONGO_INITDB_ROOT_USERNAME=admin \
      -e MONGO_INITDB_ROOT_PASSWORD=CloudCart2026Secure \
      -e MONGO_INITDB_DATABASE=cloudcart \
      mongo:7.0

    echo "Waiting for MongoDB container to initialize..."
    sleep 8

    # Pull Official Application Images from Docker Hub
    docker pull ${var.backend_image}
    docker pull ${var.frontend_image}

    # Run Backend Container
    docker run -d \
      --name cloudcart-backend \
      --restart unless-stopped \
      --network cloudcart-net \
      --network-alias backend \
      -p ${var.backend_host_port}:5000 \
      --env-file /opt/cloudcart/.env \
      -e AWS_REGION=${var.aws_region} \
      ${var.backend_image}

    # Run Frontend Container
    docker run -d \
      --name cloudcart-frontend \
      --restart unless-stopped \
      --network cloudcart-net \
      --network-alias frontend \
      -p ${var.frontend_host_port}:80 \
      ${var.frontend_image}

    # Wait for backend to be ready and seed database
    echo "Waiting for backend API to be ready..."
    for i in {1..30}; do
      if curl -s http://localhost:${var.backend_host_port}/health | grep -q "OK"; then
        echo "Backend is healthy! Seeding database..."
        docker exec cloudcart-backend npm run seed 2>/dev/null || true
        break
      fi
      sleep 2
    done

    echo "=== CloudCart Container Stack Bootstrapped Successfully ==="
  EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "${var.project_name}-${var.environment}-instance"
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

# ------------------------------------------------------------------------------
# Auto Scaling Group (Multi-AZ in Private Subnets)
# ------------------------------------------------------------------------------
resource "aws_autoscaling_group" "app" {
  name_prefix         = "${var.project_name}-${var.environment}-asg-"
  vpc_zone_identifier = var.private_subnet_ids

  target_group_arns = [
    var.frontend_target_group_arn,
    var.backend_target_group_arn
  ]

  health_check_type         = "ELB"
  health_check_grace_period = 900

  min_size         = var.min_size
  max_size         = var.max_size
  desired_capacity = var.desired_capacity

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  instance_refresh {
    strategy = "Rolling"
    preferences {
      min_healthy_percentage = 50
      instance_warmup        = 300
    }
  }

  tag {
    key                 = "Name"
    value               = "${var.project_name}-app-worker"
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
    ignore_changes        = [desired_capacity]
  }
}

# ------------------------------------------------------------------------------
# Dynamic Scaling Policy: Target Tracking (Average CPU Utilization)
# ------------------------------------------------------------------------------
resource "aws_autoscaling_policy" "cpu_target_tracking" {
  name                   = "${var.project_name}-${var.environment}-cpu-target-tracking"
  policy_type            = "TargetTrackingScaling"
  autoscaling_group_name = aws_autoscaling_group.app.name

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }

    target_value     = var.target_cpu_utilization
    disable_scale_in = false
  }
}
