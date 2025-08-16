#!/bin/bash

# Local Development Deployment Script
# This script stops dfx, starts it clean, and deploys canisters

set -e  # Exit on any error

echo "🚀 Starting local deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Stop dfx if running
print_status "Stopping dfx if running..."
if pgrep -f "dfx" > /dev/null; then
    dfx stop
    print_success "dfx stopped"
else
    print_warning "dfx was not running"
fi

# Step 2: Clean dfx cache (automatic)
print_status "Cleaning dfx cache..."
# Start dfx clean in background, then stop it
nohup dfx start --clean > dfx-clean.log 2>&1 &
CLEAN_PID=$!
sleep 5
kill $CLEAN_PID 2>/dev/null || true
sleep 2
print_success "dfx cache cleaned"

# Step 3: Start dfx in background
print_status "Starting dfx in background..."
nohup dfx start --background > dfx.log 2>&1 &
DFX_PID=$!

# Wait for dfx to start
print_status "Waiting for dfx to start..."
sleep 5

# Check if dfx is running
if ! pgrep -f "dfx" > /dev/null; then
    print_error "Failed to start dfx"
    exit 1
fi

print_success "dfx started successfully (PID: $DFX_PID)"

# Step 4: Wait for dfx to be ready
print_status "Waiting for dfx to be ready..."
for i in {1..30}; do
    if dfx ping local > /dev/null 2>&1; then
        print_success "dfx is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "dfx failed to start within 30 seconds"
        exit 1
    fi
    sleep 1
done

# Step 5: Get current principal
print_status "Getting current principal..."
CURRENT_PRINCIPAL=$(dfx identity get-principal)
print_success "Current principal: $CURRENT_PRINCIPAL"

# Step 6: Deploy canisters
print_status "Deploying canisters..."

# Deploy split_dapp first with arguments
print_status "Deploying split_dapp..."
echo "yes" | dfx deploy split_dapp --network local --mode=reinstall --argument "(principal \"$CURRENT_PRINCIPAL\", \"ckbtc-minter-canister-id\")"

# Deploy split_dapp_test
print_status "Deploying split_dapp_test..."
dfx deploy --network local split_dapp_test

# Skip frontend deployment (since it's in Docker)
print_warning "Skipping frontend deployment (running in Docker)"

# Step 6: Get canister IDs
print_status "Getting canister IDs..."
SPLIT_DAPP_ID=$(dfx canister id --network local split_dapp)
SPLIT_DAPP_TEST_ID=$(dfx canister id --network local split_dapp_test)

# Step 7: Set initial balances for testing
print_status "Setting initial balances for testing..."
print_status "Setting 1 BTC balance for current user..."

# Set 1 BTC (100,000,000 satoshis) for the current user
dfx canister call split_dapp setBitcoinBalance "(principal \"$CURRENT_PRINCIPAL\", principal \"$CURRENT_PRINCIPAL\", 100_000_000)" --network local

# Also set 1 BTC for the specific user principal that's commonly used
print_status "Setting 1 BTC balance for ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe..."
dfx canister call split_dapp setMockBitcoinBalance "(principal \"ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe\", 100_000_000)" --network local

# Also set some ICP balance for testing
print_status "Setting 10 ICP balance for current user..."
dfx canister call split_dapp setInitialBalance "(principal \"$CURRENT_PRINCIPAL\", 1_000_000_000, principal \"$CURRENT_PRINCIPAL\")" --network local

print_success "Initial balances set!"
print_success "   - 1 BTC (100,000,000 satoshis)"
print_success "   - 10 ICP (1,000,000,000 e8s)"

print_success "Deployment completed!"
echo
echo "📋 Canister IDs:"
echo "   split_dapp: $SPLIT_DAPP_ID"
echo "   split_dapp_test: $SPLIT_DAPP_TEST_ID"
echo
echo "🌐 Access URLs:"
echo "   Frontend: http://localhost:3000"
echo "   dfx: http://localhost:4943"
echo "   split_dapp: http://$SPLIT_DAPP_ID.localhost:4943"
echo "   split_dapp_test: http://$SPLIT_DAPP_TEST_ID.localhost:4943"
echo
echo "📝 Logs:"
echo "   dfx logs: tail -f dfx.log"
echo "   Docker logs: docker logs frontend-development"
echo
print_success "Local deployment complete! 🎉"
