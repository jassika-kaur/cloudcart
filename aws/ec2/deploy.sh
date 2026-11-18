#!/usr/bin/env bash
# ==============================================================================
# CloudCart – Automated EC2 Deployment & Rollout Script
# Project: CloudCart (Cloud-Native E-Commerce Platform)
# Target Environment: Amazon Linux 2023 / Ubuntu 22.04 LTS on AWS EC2
# Docker Hub Repository: jassikakaur
# Frontend Image: jassikakaur/cloudcart-frontend:v1.0.0
# Backend Image:  jassikakaur/cloudcart-backend:v1.0.0
# ==============================================================================

set -euo pipefail

# ------------------------------------------------------------------------------
# Configuration Variables
# ------------------------------------------------------------------------------
APP_DIR="/opt/cloudcart"
ENV_FILE="${APP_DIR}/.env"
DOCKER_NETWORK="cloudcart-net"

# Image Tags (Defaults can be overridden via environment variables)
FRONTEND_IMAGE="${FRONTEND_IMAGE:-jassikakaur/cloudcart-frontend:v1.0.0}"
BACKEND_IMAGE="${BACKEND_IMAGE:-jassikakaur/cloudcart-backend:v1.0.0}"

# Ports
FRONTEND_HOST_PORT="${FRONTEND_HOST_PORT:-3000}"
BACKEND_HOST_PORT="${BACKEND_HOST_PORT:-5000}"

# Color codes for formatted logging
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO] $(date +'%Y-%m-%d %H:%M:%S') - $1${NC}"
}

log_success() {
    echo -e "${GREEN}[SUCCESS] $(date +'%Y-%m-%d %H:%M:%S') - $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}[WARN] $(date +'%Y-%m-%d %H:%M:%S') - $1${NC}"
}

log_error() {
    echo -e "${RED}[ERROR] $(date +'%Y-%m-%d %H:%M:%S') - $1${NC}" >&2
}

# ------------------------------------------------------------------------------
# Step 1: Ensure Docker is Installed and Running
# ------------------------------------------------------------------------------
log_info "Step 1: Checking Docker installation..."

if ! command -v docker &> /dev/null; then
    log_warn "Docker not detected. Installing Docker engine..."
    if command -v dnf &> /dev/null; then
        # Amazon Linux 2023 / Fedora / RHEL
        sudo dnf update -y
        sudo dnf install -y docker
    elif command -v apt-get &> /dev/null; then
        # Ubuntu / Debian
        sudo apt-get update -y
        sudo apt-get install -y docker.io
    else
        log_error "Unsupported package manager. Please install Docker manually."
        exit 1
    fi
fi

# Ensure Docker service is enabled and started
log_info "Ensuring Docker daemon is active..."
sudo systemctl enable docker
sudo systemctl start docker

# Add ec2-user or current user to docker group if not already added
if ! groups "$USER" | grep &>/dev/null '\bdocker\b'; then
    log_info "Adding user $USER to docker group..."
    sudo usermod -aG docker "$USER" || true
fi

# ------------------------------------------------------------------------------
# Step 2: Validate Environment File (.env)
# ------------------------------------------------------------------------------
log_info "Step 2: Checking application environment configuration..."

if [ ! -f "$ENV_FILE" ]; then
    log_warn "No .env file found at ${ENV_FILE}. Generating standard template..."
    sudo mkdir -p "$APP_DIR"
    sudo tee "$ENV_FILE" > /dev/null << 'EOF'
# ==============================================================================
# CloudCart Production Environment Configuration
# ==============================================================================
NODE_ENV=production
PORT=5000

# MongoDB URI (MongoDB Atlas or Private Subnet Instance)
MONGO_URI=mongodb://admin:CloudCart2026Secure@mongodb:27017/cloudcart?authSource=admin

# JWT Authentication Secrets (Generate secure 64-char strings)
JWT_SECRET=c10udc4rt_jwt_sup3r_s3cr3t_k3y_pr0duct10n_2026_mumb41!
JWT_EXPIRE=7d

# AWS S3 Storage Configuration
AWS_REGION=ap-south-1
AWS_S3_BUCKET=cloudcart-product-images-ap-south-1-major-project

# Client / CORS
CLIENT_URL=http://localhost:3000
EOF
    sudo chmod 600 "$ENV_FILE"
    log_info "Template .env created at ${ENV_FILE}. Update credentials with production values."
fi

# ------------------------------------------------------------------------------
# Step 3: Create Dedicated Docker Network
# ------------------------------------------------------------------------------
log_info "Step 3: Creating Docker network (${DOCKER_NETWORK}) if absent..."
if ! sudo docker network ls --format '{{.Name}}' | grep -Eq "^${DOCKER_NETWORK}\$"; then
    sudo docker network create "${DOCKER_NETWORK}"
    log_success "Docker network ${DOCKER_NETWORK} created."
else
    log_info "Docker network ${DOCKER_NETWORK} already exists."
fi

# ------------------------------------------------------------------------------
# Step 4: Pull Latest Docker Images from Docker Hub
# ------------------------------------------------------------------------------
log_info "Step 4: Pulling Docker images from Docker Hub..."
log_info "Pulling Backend: ${BACKEND_IMAGE}"
sudo docker pull "${BACKEND_IMAGE}"

log_info "Pulling Frontend: ${FRONTEND_IMAGE}"
sudo docker pull "${FRONTEND_IMAGE}"

# ------------------------------------------------------------------------------
# Step 5: Gracefully Stop and Remove Existing Application Containers
# ------------------------------------------------------------------------------
log_info "Step 5: Stopping existing application containers gracefully..."

for container in cloudcart-frontend cloudcart-backend; do
    if sudo docker ps -a --format '{{.Names}}' | grep -Eq "^${container}\$"; then
        log_info "Stopping container: ${container}..."
        sudo docker stop -t 10 "${container}" || true
        log_info "Removing container: ${container}..."
        sudo docker rm -f "${container}" || true
    fi
done

# ------------------------------------------------------------------------------
# Step 6: Launch Backend Container
# ------------------------------------------------------------------------------
log_info "Step 6: Launching CloudCart Backend Container..."
sudo docker run -d \
    --name cloudcart-backend \
    --restart unless-stopped \
    --network "${DOCKER_NETWORK}" \
    --network-alias backend \
    -p "${BACKEND_HOST_PORT}:5000" \
    --env-file "${ENV_FILE}" \
    -e AWS_REGION=ap-south-1 \
    --health-cmd="wget -qO- http://localhost:5000/health || exit 1" \
    --health-interval=15s \
    --health-timeout=5s \
    --health-retries=3 \
    --health-start-period=20s \
    "${BACKEND_IMAGE}"

log_success "Backend container started."

# ------------------------------------------------------------------------------
# Step 7: Launch Frontend Container
# ------------------------------------------------------------------------------
log_info "Step 7: Launching CloudCart Frontend Container..."
sudo docker run -d \
    --name cloudcart-frontend \
    --restart unless-stopped \
    --network "${DOCKER_NETWORK}" \
    --network-alias frontend \
    -p "${FRONTEND_HOST_PORT}:80" \
    --health-cmd="wget -qO- http://localhost:80 || exit 1" \
    --health-interval=15s \
    --health-timeout=5s \
    --health-retries=3 \
    --health-start-period=10s \
    "${FRONTEND_IMAGE}"

log_success "Frontend container started."

# ------------------------------------------------------------------------------
# Step 8: Validate Container Health Checks
# ------------------------------------------------------------------------------
log_info "Step 8: Verifying health status of deployed containers..."
sleep 5

log_info "Inspecting running containers:"
sudo docker ps --filter "name=cloudcart-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Verify HTTP response from backend
log_info "Probing Backend Health Endpoint (http://localhost:${BACKEND_HOST_PORT}/health)..."
for i in {1..10}; do
    if curl -s -f "http://localhost:${BACKEND_HOST_PORT}/health" > /dev/null; then
        log_success "Backend is healthy and responding with HTTP 200 OK!"
        break
    else
        log_warn "Waiting for Backend to initialize... (attempt $i/10)"
        sleep 3
    fi
    if [ "$i" -eq 10 ]; then
        log_error "Backend health check failed. Please inspect logs using: docker logs cloudcart-backend"
    fi
done

# Verify HTTP response from frontend
log_info "Probing Frontend HTTP Endpoint (http://localhost:${FRONTEND_HOST_PORT})..."
if curl -s -I "http://localhost:${FRONTEND_HOST_PORT}" | grep -Eq "HTTP/.* 200"; then
    log_success "Frontend is serving traffic normally!"
else
    log_warn "Frontend returned non-200 or is still initializing. Check logs with: docker logs cloudcart-frontend"
fi

# ------------------------------------------------------------------------------
# Step 9: Clean Up Dangling Docker Images & Volumes
# ------------------------------------------------------------------------------
log_info "Step 9: Pruning unused and dangling Docker images..."
sudo docker image prune -f

log_success "================================================================="
log_success " CloudCart Deployment Completed Successfully! "
log_success " Frontend: http://localhost:${FRONTEND_HOST_PORT}"
log_success " Backend:  http://localhost:${BACKEND_HOST_PORT}"
log_success "================================================================="
