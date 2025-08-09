# Production Dockerfile for SplitSafe (Next.js)

FROM node:20.17.0-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

FROM deps AS builder
WORKDIR /app
COPY . .
ENV NODE_ENV=production
# Inject public envs at build time so Next.js client bundle gets them
ARG NEXT_PUBLIC_DFX_HOST
ARG NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP
ARG NEXT_PUBLIC_DOMAIN
ARG NEXT_PUBLIC_DEVELOPMENT_DOMAIN
ARG NEXT_PUBLIC_BLOCKSTREAM_URL
ARG NEXT_PUBLIC_MEMPOOL_URL
ARG NEXT_PUBLIC_ICP_DASHBOARD_URL
ARG NEXT_PUBLIC_ICSCAN_URL
ENV NEXT_PUBLIC_DFX_HOST=$NEXT_PUBLIC_DFX_HOST \
    NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP=$NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP \
    NEXT_PUBLIC_DOMAIN=$NEXT_PUBLIC_DOMAIN \
    NEXT_PUBLIC_DEVELOPMENT_DOMAIN=$NEXT_PUBLIC_DEVELOPMENT_DOMAIN \
    NEXT_PUBLIC_BLOCKSTREAM_URL=$NEXT_PUBLIC_BLOCKSTREAM_URL \
    NEXT_PUBLIC_MEMPOOL_URL=$NEXT_PUBLIC_MEMPOOL_URL \
    NEXT_PUBLIC_ICP_DASHBOARD_URL=$NEXT_PUBLIC_ICP_DASHBOARD_URL \
    NEXT_PUBLIC_ICSCAN_URL=$NEXT_PUBLIC_ICSCAN_URL
# Build Next.js app (standalone output enabled in next.config.ts)
RUN npm run build

FROM node:20.17.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# Keep envs available at runtime for any server-side code
ENV NEXT_PUBLIC_DFX_HOST=$NEXT_PUBLIC_DFX_HOST \
    NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP=$NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP \
    NEXT_PUBLIC_DOMAIN=$NEXT_PUBLIC_DOMAIN \
    NEXT_PUBLIC_DEVELOPMENT_DOMAIN=$NEXT_PUBLIC_DEVELOPMENT_DOMAIN \
    NEXT_PUBLIC_BLOCKSTREAM_URL=$NEXT_PUBLIC_BLOCKSTREAM_URL \
    NEXT_PUBLIC_MEMPOOL_URL=$NEXT_PUBLIC_MEMPOOL_URL \
    NEXT_PUBLIC_ICP_DASHBOARD_URL=$NEXT_PUBLIC_ICP_DASHBOARD_URL \
    NEXT_PUBLIC_ICSCAN_URL=$NEXT_PUBLIC_ICSCAN_URL

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Install minimal runtime tools used by healthcheck
RUN apk add --no-cache curl

# Copy standalone build output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Ensure runtime cache directory exists and is writable by the non-root user
RUN mkdir -p /app/.next/cache && chown -R 1001:1001 /app/.next

USER nextjs
EXPOSE 3000

# Healthcheck against Next.js API route
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/api/health >/dev/null || exit 1

CMD ["node", "server.js"]


