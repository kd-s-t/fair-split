# Multi-stage Dockerfile for SplitSafe
# Stage 1: Base image with Node.js
FROM node:20-alpine AS base

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Install system dependencies
RUN apk add --no-cache \
    curl \
    wget \
    git \
    build-base \
    python3 \
    make \
    g++

# Stage 2: Frontend build
FROM base AS frontend-builder

WORKDIR /app

# Set environment variables for lightningcss (x64 for EC2)
ENV LIGHTNING_CSS_BINARY_TARGET=linux-x64-musl
ENV NODE_OPTIONS="--max-old-space-size=512"

# Copy package files
COPY frontend/package*.json ./
COPY frontend/next.config.ts ./
COPY frontend/tailwind.config.js ./
COPY frontend/postcss.config.mjs ./
COPY frontend/tsconfig.json ./

# Install all dependencies (including dev dependencies needed for build)
# Force rebuild of native modules for the correct architecture
RUN npm install --include=dev --no-optional --force

# Copy frontend source
COPY frontend/ .

# Rebuild native modules for the current platform
RUN npm rebuild

# Build the frontend with memory optimization for EC2
RUN npm run build

# Stage 3: Production runtime
FROM base AS production

WORKDIR /app

# Copy built frontend
COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/package*.json ./
COPY --from=frontend-builder /app/next.config.ts ./
COPY --from=frontend-builder /app/tailwind.config.js ./
COPY --from=frontend-builder /app/postcss.config.mjs ./
COPY --from=frontend-builder /app/tsconfig.json ./

# Install production dependencies only
RUN npm install --only=production && npm cache clean --force

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["npm", "start"] 