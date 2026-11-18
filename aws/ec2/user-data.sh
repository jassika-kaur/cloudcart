#!/bin/bash
# ==============================================================================
# CloudCart – EC2 Instance User Data Bootstrap Script
# Operating System: Amazon Linux 2023 (AL2023)
# Purpose: Fully automate host provisioning, Docker setup, CloudWatch agent,
#          and initial deployment of CloudCart container images on first boot.
# Log Output: /var/log/user-data.log
# ==============================================================================

exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1
echo "=== Starting CloudCart EC2 Bootstrap: $(date) ==="

# ------------------------------------------------------------------------------
# 1. System Package Updates & Prerequisites
# ------------------------------------------------------------------------------
echo "[1/6] Updating system packages and installing dependencies..."
dnf update -y
dnf install -y docker git curl jq amazon-cloudwatch-agent

# ------------------------------------------------------------------------------
# 2. Docker Service Setup & Permissions
# ------------------------------------------------------------------------------
echo "[2/6] Enabling and starting Docker daemon..."
systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user

# Ensure Docker socket permissions
chmod 666 /var/run/docker.sock || true

# ------------------------------------------------------------------------------
# 3. Create Application Workspace Directory
# ------------------------------------------------------------------------------
echo "[3/6] Setting up /opt/cloudcart application directory..."
mkdir -p /opt/cloudcart
chown -R ec2-user:ec2-user /opt/cloudcart

# ------------------------------------------------------------------------------
# 4. Generate Application Environment File (.env)
# ------------------------------------------------------------------------------
echo "[4/6] Creating /opt/cloudcart/.env production configuration..."
cat << 'EOF' > /opt/cloudcart/.env
# CloudCart Production Environment Configuration
NODE_ENV=production
PORT=5000

# Database Configuration (Update with your MongoDB Atlas or EC2 MongoDB Endpoint)
MONGO_URI=mongodb://admin:CloudCart2026Secure@mongodb:27017/cloudcart?authSource=admin

# JWT Authentication
JWT_SECRET=c10udc4rt_jwt_sup3r_s3cr3t_k3y_pr0duct10n_2026_mumb41!
JWT_EXPIRE=7d

# AWS S3 Storage
AWS_REGION=ap-south-1
AWS_S3_BUCKET=cloudcart-product-images-ap-south-1-major-project

# Client URL
CLIENT_URL=http://localhost:3000
EOF

chmod 600 /opt/cloudcart/.env
chown ec2-user:ec2-user /opt/cloudcart/.env

# ------------------------------------------------------------------------------
# 5. Create Standalone deploy.sh Script
# ------------------------------------------------------------------------------
echo "[5/6] Creating /opt/cloudcart/deploy.sh rollout script..."
cat << 'EOF' > /opt/cloudcart/deploy.sh
#!/bin/bash
set -euo pipefail

APP_DIR="/opt/cloudcart"
ENV_FILE="${APP_DIR}/.env"
DOCKER_NETWORK="cloudcart-net"
FRONTEND_IMAGE="jassikakaur/cloudcart-frontend:v1.0.0"
BACKEND_IMAGE="jassikakaur/cloudcart-backend:v1.0.0"

echo "[INFO] Pulling images..."
docker pull "$BACKEND_IMAGE"
docker pull "$FRONTEND_IMAGE"

# Ensure network
docker network create "$DOCKER_NETWORK" 2>/dev/null || true

# Stop existing containers safely
for c in cloudcart-frontend cloudcart-backend; do
    docker stop "$c" 2>/dev/null || true
    docker rm -f "$c" 2>/dev/null || true
done

# Run Backend
docker run -d \
    --name cloudcart-backend \
    --restart unless-stopped \
    --network "$DOCKER_NETWORK" \
    --network-alias backend \
    -p 5000:5000 \
    --env-file "$ENV_FILE" \
    -e AWS_REGION=ap-south-1 \
    "$BACKEND_IMAGE"

# Run Frontend
docker run -d \
    --name cloudcart-frontend \
    --restart unless-stopped \
    --network "$DOCKER_NETWORK" \
    --network-alias frontend \
    -p 3000:80 \
    "$FRONTEND_IMAGE"

echo "[INFO] Verifying status..."
sleep 5
docker ps --filter "name=cloudcart-"
docker image prune -f
echo "[SUCCESS] CloudCart containers are online!"
EOF

chmod +x /opt/cloudcart/deploy.sh
chown ec2-user:ec2-user /opt/cloudcart/deploy.sh

# ------------------------------------------------------------------------------
# 6. Execute Initial Deployment
# ------------------------------------------------------------------------------
echo "[6/6] Executing initial deployment..."
su - ec2-user -c "/opt/cloudcart/deploy.sh"

echo "=== CloudCart EC2 Bootstrap Completed Successfully: $(date) ==="
