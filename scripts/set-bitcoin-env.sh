#!/bin/bash

# Bitcoin Environment Configuration Script
# This script sets the appropriate cKBTC canister ID based on the network

set -e

echo "🔧 Configuring Bitcoin environment..."

# Get current network
NETWORK=$(dfx config get networks.$(dfx config get networks.default).providers | head -n1)
echo "🌐 Current network: $NETWORK"

# Set cKBTC canister ID based on network
if [ "$NETWORK" = "https://ic0.app" ]; then
    CKBTC_ID="mxzaz-hqaaa-aaaar-qaada-cai"  # Mainnet
    echo "🔗 Using MAINNET cKBTC: $CKBTC_ID"
    echo "⚠️  WARNING: You are on MAINNET - real Bitcoin will be used!"
else
    CKBTC_ID="ml52i-qqaaa-aaaar-qaabq-cai"  # Testnet
    echo "🔗 Using TESTNET cKBTC: $CKBTC_ID"
    echo "✅ Safe for testing - no real Bitcoin involved"
fi

# Export environment variables
export CKBTC_CANISTER_ID=$CKBTC_ID
export BITCOIN_NETWORK=$(if [ "$NETWORK" = "https://ic0.app" ]; then echo "mainnet"; else echo "testnet"; fi)

# Create .env file with Bitcoin configuration
cat > .env.bitcoin << EOF
# Bitcoin Configuration
CKBTC_CANISTER_ID=$CKBTC_ID
BITCOIN_NETWORK=$(if [ "$NETWORK" = "https://ic0.app" ]; then echo "mainnet"; else echo "testnet"; fi)
EOF

echo "✅ Bitcoin environment configured!"
echo "📋 Configuration saved to .env.bitcoin"
echo ""
echo "Network: $(if [ "$NETWORK" = "https://ic0.app" ]; then echo "MAINNET"; else echo "TESTNET"; fi)"
echo "cKBTC ID: $CKBTC_ID" 