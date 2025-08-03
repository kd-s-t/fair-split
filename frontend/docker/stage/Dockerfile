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
COPY frontend/package*.json ./frontend/
COPY frontend/next.config.ts ./frontend/
COPY frontend/tailwind.config.js ./frontend/
COPY frontend/postcss.config.mjs ./frontend/
COPY frontend/tsconfig.json ./frontend/

# Install dependencies
RUN cd frontend && npm install

# Copy frontend source
COPY frontend/ ./frontend/

# Build the frontend
RUN cd frontend && npm run build

# Stage 3: Production runtime
FROM base as production

WORKDIR /app

# Copy built frontend
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package*.json ./frontend/
COPY --from=frontend-builder /app/frontend/next.config.ts ./frontend/
COPY --from=frontend-builder /app/frontend/tailwind.config.js ./frontend/
COPY --from=frontend-builder /app/frontend/postcss.config.mjs ./frontend/
COPY --from=frontend-builder /app/frontend/tsconfig.json ./frontend/

# Install production dependencies only
RUN cd frontend && npm install --only=production && npm cache clean --force

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
CMD ["cd", "frontend", "&&", "npm", "start"] 