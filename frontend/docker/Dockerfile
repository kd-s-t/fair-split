# Multi-stage Dockerfile for SplitSafe
# Stage 1: Base image with DFINITY SDK and Node.js
FROM ubuntu:22.04 as base

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV DFX_VERSION=0.20.2
ENV NODE_VERSION=20.13.1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    ca-certificates \
    gnupg \
    lsb-release \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Install DFINITY SDK
RUN sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

# Add dfx to PATH
ENV PATH="/root/.local/bin:$PATH"

# Stage 2: Backend build
FROM base as backend-builder

WORKDIR /app

# Copy backend source
COPY backend/ ./backend/
COPY dfx.json ./

# Build the Motoko canister
RUN dfx build split_dapp

# Stage 3: Frontend build
FROM base as frontend-builder

WORKDIR /app

# Copy frontend source
COPY frontend/ ./frontend/
COPY dfx.json ./

# Install frontend dependencies
RUN cd frontend && npm ci

# Copy backend declarations (if available from previous stage)
COPY --from=backend-builder /app/src/declarations ./src/declarations/

# Generate frontend bindings
RUN dfx generate split_dapp

# Copy declarations to frontend
RUN cp -r src/declarations/split_dapp/* frontend/src/declarations/

# Build the frontend
RUN cd frontend && npm run build

# Stage 4: Production runtime
FROM ubuntu:22.04 as production

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Install DFINITY SDK for runtime
RUN sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

# Add dfx to PATH
ENV PATH="/root/.local/bin:$PATH"

WORKDIR /app

# Copy built frontend
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package.json ./frontend/package.json
COPY --from=frontend-builder /app/frontend/next.config.ts ./frontend/next.config.ts
COPY --from=frontend-builder /app/frontend/tailwind.config.js ./frontend/tailwind.config.js
COPY --from=frontend-builder /app/frontend/postcss.config.mjs ./frontend/postcss.config.mjs
COPY --from=frontend-builder /app/frontend/tsconfig.json ./frontend/tsconfig.json

# Copy backend artifacts
COPY --from=backend-builder /app/.dfx ./dfx
COPY --from=backend-builder /app/src/declarations ./src/declarations

# Copy deployment scripts
COPY deploy.sh ./
COPY start.sh ./
COPY principals.json ./

# Install production dependencies
RUN cd frontend && npm ci --only=production

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose ports
EXPOSE 3000 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Default command
CMD ["sh", "-c", "cd frontend && npm start"] 