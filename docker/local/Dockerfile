# Local Dockerfile for Mac M1 development
FROM node:20-alpine AS base

# Set environment variables
ENV NODE_ENV=development
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

# Set environment variables for lightningcss on Mac M1
ENV LIGHTNING_CSS_BINARY_TARGET=linux-arm64-musl
ENV NODE_OPTIONS="--max-old-space-size=512"

# Copy package files
COPY frontend/package*.json ./
COPY frontend/next.config.ts ./
COPY frontend/tailwind.config.js ./
COPY frontend/postcss.config.mjs ./
COPY frontend/tsconfig.json ./

# Install all dependencies (including dev dependencies needed for build)
RUN npm install --include=dev --no-optional

# Force reinstall lightningcss with correct binary
RUN npm uninstall lightningcss && npm install lightningcss --force

# Copy frontend source
COPY frontend/ .

# Rebuild all native modules
RUN npm rebuild

# Build the frontend
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