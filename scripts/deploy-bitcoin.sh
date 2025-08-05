#!/bin/bash

# Bitcoin Integration Deployment Script for SafeSplit
# This script sets up cKBTC and Bitcoin integration

set -e

echo "🚀 Starting Bitcoin Integration Deployment..."

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo "❌ dfx is not installed. Please install dfx first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "dfx.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Set network (default to local for testing)
NETWORK=${1:-local}
echo "📡 Deploying to network: $NETWORK"

# Function to check if canister exists
canister_exists() {
    local canister_id=$1
    dfx canister --network $NETWORK status $canister_id &> /dev/null
}

# Deploy cKBTC ledger
echo "🔧 Deploying cKBTC ledger..."
if ! canister_exists "ckbtc_ledger"; then
    dfx deploy --network $NETWORK ckbtc_ledger
    echo "✅ cKBTC ledger deployed successfully"
else
    echo "ℹ️  cKBTC ledger already exists"
fi

# Get cKBTC ledger canister ID
CKBTC_ID=$(dfx canister --network $NETWORK id ckbtc_ledger)
echo "📋 cKBTC Ledger ID: $CKBTC_ID"

# Deploy main canister
echo "🔧 Deploying SafeSplit canister..."
dfx deploy --network $NETWORK split_dapp
echo "✅ SafeSplit canister deployed successfully"

# Get main canister ID
CANISTER_ID=$(dfx canister --network $NETWORK id split_dapp)
echo "📋 SafeSplit Canister ID: $CANISTER_ID"

# Set environment variables
echo "🔧 Setting environment variables..."
export CKBTC_LEDGER_ID=$CKBTC_ID
export SAFESPLIT_CANISTER_ID=$CANISTER_ID
export NETWORK=$NETWORK

# Create .env file
cat > .env << EOF
# Bitcoin Integration Environment Variables
CKBTC_LEDGER_ID=$CKBTC_ID
SAFESPLIT_CANISTER_ID=$CANISTER_ID
NETWORK=$NETWORK
BITCOIN_NETWORK=mainnet
EOF

echo "✅ Environment variables saved to .env"

# Test Bitcoin integration
echo "🧪 Testing Bitcoin integration..."
if [ "$NETWORK" = "local" ]; then
    echo "ℹ️  Skipping Bitcoin tests on local network"
else
    echo "🔍 Testing cKBTC connection..."
    # Add your test commands here
    # dfx canister call split_dapp getBitcoinBalance '(...)'
fi

# Display deployment summary
echo ""
echo "🎉 Bitcoin Integration Deployment Complete!"
echo "=========================================="
echo "Network: $NETWORK"
echo "cKBTC Ledger ID: $CKBTC_ID"
echo "SafeSplit Canister ID: $CANISTER_ID"
echo ""
echo "Next Steps:"
echo "1. Test Bitcoin functionality"
echo "2. Configure frontend to use Bitcoin features"
echo "3. Set up monitoring and analytics"
echo "4. Review security settings"
echo ""
echo "📚 Documentation: icp/BITCOIN_INTEGRATION.md"
echo "🔗 Network URL: https://$CANISTER_ID.ic0.app" 