#!/bin/bash

# Dynamic startup script for SplitSafe
set -e

echo "🚀 Starting SplitSafe with dynamic configuration..."

# Function to print status
print_status() {
    echo "📋 $1"
}

# Function to print success
print_success() {
    echo "✅ $1"
}

# Function to print error
print_error() {
    echo "❌ $1"
}

# Set default values if not provided
export NODE_ENV=${NODE_ENV:-staging}
export PORT=${PORT:-3000}
export NEXT_PUBLIC_DFX_HOST=${NEXT_PUBLIC_DFX_HOST:-https://ic0.app}
export NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP=${NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP:-}
export NEXT_PUBLIC_BLOCKSTREAM_URL=${NEXT_PUBLIC_BLOCKSTREAM_URL:-https://blockstream.info}
export NEXT_PUBLIC_MEMPOOL_URL=${NEXT_PUBLIC_MEMPOOL_URL:-https://mempool.space}
export NEXT_PUBLIC_ICP_DASHBOARD_URL=${NEXT_PUBLIC_ICP_DASHBOARD_URL:-https://dashboard.internetcomputer.org}
export NEXT_PUBLIC_ICSCAN_URL=${NEXT_PUBLIC_ICSCAN_URL:-https://icscan.io}

print_status "Environment Configuration:"
echo "  NODE_ENV: $NODE_ENV"
echo "  PORT: $PORT"
echo "  DFX_HOST: $NEXT_PUBLIC_DFX_HOST"
echo "  CANISTER_ID: $NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP"
echo "  BLOCKSTREAM_URL: $NEXT_PUBLIC_BLOCKSTREAM_URL"
echo "  MEMPOOL_URL: $NEXT_PUBLIC_MEMPOOL_URL"

# Environment-specific configurations
case $NODE_ENV in
    "development")
        print_status "Starting in development mode..."
        npm run dev
        ;;
    "staging")
        print_status "Starting in staging mode..."
        
        # Wait for DFX if local canister is being used
        if [[ "$NEXT_PUBLIC_DFX_HOST" == *"localhost"* ]] || [[ "$NEXT_PUBLIC_DFX_HOST" == *"0.0.0.0"* ]]; then
            print_status "Waiting for DFX replica to be ready..."
            ./wait-for-dfx.sh
            print_success "DFX replica is ready"
        fi
        
        # Check if canister declarations need to be updated
        if [ -n "$NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP" ]; then
            print_status "Canister ID provided: $NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP"
            
            # Check if declarations directory exists and has content
            if [ ! -d "src/declarations" ] || [ -z "$(ls -A src/declarations 2>/dev/null)" ]; then
                print_status "No declarations found, creating placeholder..."
                mkdir -p src/declarations
                echo "// Placeholder declarations - will be updated at runtime" > src/declarations/index.ts
            fi
        else
            print_status "No canister ID provided, using default configuration"
        fi
        
        # Start the application
        print_success "Starting Next.js application on port $PORT"
        npm start
        ;;
    "production")
        print_status "Starting in production mode..."
        
        # Production mode - no DFX waiting, no dynamic declarations
        print_success "Starting production Next.js application on port $PORT"
        npm start
        ;;
    *)
        print_error "Unknown NODE_ENV: $NODE_ENV"
        exit 1
        ;;
esac 