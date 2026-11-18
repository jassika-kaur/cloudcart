# ===================================================
# CloudCart Frontend - Production Multi-Stage Dockerfile
# Stage 1: Build React application using Vite
# Stage 2: Serve optimized static assets via Nginx Alpine
# ===================================================

# ----- Stage 1: Build Stage -----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies using clean install
RUN npm ci

# Copy frontend source code and configs
COPY index.html ./
COPY vite.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY public/ ./public/
COPY src/ ./src/

# Compile production bundle
RUN npm run build

# ----- Stage 2: Production Web Server -----
FROM nginx:1.27-alpine

# Install wget for container health checks
RUN apk add --no-cache wget

# Remove default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with SPA routing & reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
