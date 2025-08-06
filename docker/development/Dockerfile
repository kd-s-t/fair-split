# Development Dockerfile for SplitSafe
FROM node:20.17.0-alpine

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

WORKDIR /app

# Set environment variables for lightningcss
ENV LIGHTNING_CSS_BINARY_TARGET=linux-x64-musl
ENV NODE_OPTIONS="--max-old-space-size=512"

# Copy package files
COPY package.json package-lock.json ./

# Update npm to specific version and install all dependencies
RUN npm install -g npm@11.5.2 && npm ci --ignore-scripts

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies and clean cache
RUN npm prune --staging && npm cache clean --force

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["npm", "start"] 