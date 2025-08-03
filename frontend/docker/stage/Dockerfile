# Multi-stage Dockerfile for SplitSafe
# Stage 1: Base image with Node.js
FROM node:20-alpine as base

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
FROM base as frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY next.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.mjs ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy frontend source
COPY . .

# Build the frontend
RUN npm run build

# Stage 3: Production runtime
FROM base as production

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