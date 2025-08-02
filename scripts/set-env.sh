#!/bin/bash

# Script to set environment variables for SplitSafe deployment
# Usage: ./scripts/set-env.sh <CANISTER_ID>

if [ -z "$1" ]; then
    echo "❌ Error: Canister ID is required"
    echo "Usage: ./scripts/set-env.sh <CANISTER_ID>"
    echo "Example: ./scripts/set-env.sh abcde-fghij-klmno-pqrst-uvwxy-zabcd-efghi-jklmn"
    exit 1
fi

CANISTER_ID=$1

echo "🚀 Setting environment variables for SplitSafe..."
echo "🎯 Canister ID: $CANISTER_ID"

# Create .env file
cat > .env << EOF
NEXT_PUBLIC_DFX_HOST=https://ic0.app
NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP=$CANISTER_ID
NODE_ENV=production
EOF

echo "✅ Environment variables set!"
echo "📄 Created .env file with:"
echo "   - NEXT_PUBLIC_DFX_HOST=https://ic0.app"
echo "   - NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP=$CANISTER_ID"
echo "   - NODE_ENV=production"

echo ""
echo "🔄 To deploy with new environment variables:"
echo "   docker compose -f frontend/docker/docker-compose.yml up --build -d splitsafe" 