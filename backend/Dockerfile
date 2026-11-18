# ===================================================
# CloudCart Backend - Production Multi-Stage Dockerfile
# Base: Node.js 20 LTS Alpine (minimal footprint, hardened)
# ===================================================

FROM node:20-alpine AS production

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Install wget for healthcheck
RUN apk add --no-cache wget

# Create application working directory
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

# Copy application source code
COPY config/ ./config/
COPY controllers/ ./controllers/
COPY middleware/ ./middleware/
COPY models/ ./models/
COPY routes/ ./routes/
COPY services/ ./services/
COPY utils/ ./utils/
COPY server.js ./

# Create uploads directory and set appropriate ownership for non-root user
RUN mkdir -p /app/uploads && chown -R node:node /app

# Switch to standard non-root node user for security
USER node

# Expose backend REST API port
EXPOSE 5000

# Health check to ensure API is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Launch Express server
CMD ["node", "server.js"]
