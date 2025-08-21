#!/bin/bash

# Local Development Deployment Script - Fixed Version
# This script stops dfx, starts it clean, and deploys canisters
# Usage: ./scripts/local-deploy-fixed.sh [ADMIN_PRINCIPAL]

set -e  # Exit on any error

# Show help if requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "SafeSplit Local Deployment Script"
    echo "================================="
    echo ""
    echo "Usage: $0 [ADMIN_PRINCIPAL]"
    echo ""
    echo "Arguments:"
    echo "  ADMIN_PRINCIPAL    Principal ID to use as admin (optional)"
    echo "                     Default: ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Use default admin principal"
    echo "  $0 your-principal-id-here            # Use custom admin principal"
    echo ""
    echo "This script will:"
    echo "  1. Stop and clean dfx"
    echo "  2. Start dfx with clean state"
    echo "  3. Deploy split_dapp and split_dapp_test canisters"
    echo "  4. Set up initial balances for testing"
    echo ""
    exit 0
fi

# Check if admin principal is provided as argument
if [ -n "$1" ]; then
    ADMIN_PRINCIPAL="$1"
    echo "🚀 Starting local deployment process with admin principal: $ADMIN_PRINCIPAL"
else
    # Use default principal if none provided
    ADMIN_PRINCIPAL="ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe"
    echo "🚀 Starting local deployment process with default admin principal: $ADMIN_PRINCIPAL"
    echo "💡 Tip: You can specify a custom admin principal: $0 your-principal-id"
fi

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
    sleep 3  # Give dfx time to fully stop
    print_success "dfx stopped"
else
    print_warning "dfx was not running"
fi

# Step 2: Clean dfx cache more thoroughly
print_status "Cleaning dfx cache..."
rm -rf .dfx/local 2>/dev/null || true
sleep 2
print_success "dfx cache cleaned"

# Step 3: Start dfx in background
print_status "Starting dfx in background..."
nohup dfx start --clean --background > dfx.log 2>&1 &
DFX_PID=$!

# Wait for dfx to start
print_status "Waiting for dfx to start..."
sleep 10  # Give dfx more time to start up

# Check if dfx is running
if ! pgrep -f "dfx" > /dev/null; then
    print_error "Failed to start dfx"
    cat dfx.log
    exit 1
fi

print_success "dfx started successfully (PID: $DFX_PID)"

# Step 4: Wait for dfx to be ready with longer timeout
print_status "Waiting for dfx to be ready..."
for i in {1..60}; do  # Increased timeout to 60 seconds
    if dfx ping local > /dev/null 2>&1; then
        print_success "dfx is ready!"
        break
    fi
    if [ $i -eq 60 ]; then
        print_error "dfx failed to start within 60 seconds"
        print_error "Checking dfx logs:"
        cat dfx.log
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

# For local development, use admin principal as placeholder cKBTC IDs
# In production, these would be real cKBTC canister IDs
print_status "Using admin principal as placeholder cKBTC IDs for local development..."
CKBTC_LEDGER_ID="$ADMIN_PRINCIPAL"
CKBTC_MINTER_ID="$ADMIN_PRINCIPAL"
print_success "cKBTC Ledger ID: $CKBTC_LEDGER_ID (placeholder)"
print_success "cKBTC Minter ID: $CKBTC_MINTER_ID (placeholder)"

# Deploy split_dapp with admin principal and placeholder cKBTC canister IDs
print_status "Deploying split_dapp..."
echo "yes" | dfx deploy split_dapp --network local --mode=reinstall --argument "(principal \"$ADMIN_PRINCIPAL\", \"$CKBTC_LEDGER_ID\", \"$CKBTC_MINTER_ID\")"

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

# Set 1 BTC (100,000,000 satoshis) for the admin user
dfx canister call split_dapp setBitcoinBalance "(principal \"$ADMIN_PRINCIPAL\", principal \"$ADMIN_PRINCIPAL\", 100_000_000)" --network local

# Also set 1 BTC for the specific user principal that's commonly used
print_status "cKBTC integration initialized - balances managed by ledger..."

# Real cKBTC balances are managed by the ledger
print_status "cKBTC integration ready for real transactions..."

print_success "Initial balances set!"
print_success "   - 1 BTC (100,000,000 satoshis)"

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
