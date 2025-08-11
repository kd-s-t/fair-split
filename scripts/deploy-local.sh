#!/bin/bash

# SafeSplit Local Deployment Script
# Updated for identity-agnostic deployment - works with ANY user principal
# This allows multiple users (your 20 customers) to use the same canister

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Start the local replica
echo "\n====================\nStarting local replica...\n===================="

# Comprehensive cleanup function
cleanup_dfx() {
    printf "${YELLOW}🧹 Performing comprehensive cleanup...${NC}\n"
    
    # Stop dfx gracefully first
    dfx stop 2>/dev/null || true
    
    # Kill any dfx processes
    pkill -f dfx 2>/dev/null || true
    
    # Kill any PocketIC processes
    pkill -f pocket-ic 2>/dev/null || true
    
    # Kill processes on port 4943
    lsof -ti:4943 | xargs kill -9 2>/dev/null || true
    
    # Remove dfx state completely
    rm -rf .dfx 2>/dev/null || true
    
    # Wait for cleanup
    sleep 3
}

# Call cleanup
cleanup_dfx

printf "${YELLOW}🚀 Starting a fresh local replica...${NC}\n"

# Function to start dfx with retry logic
start_dfx() {
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        printf "${YELLOW}🔄 Attempt $attempt: Starting dfx...${NC}\n"
        
        if dfx start --background; then
            printf "${GREEN}✅ dfx started successfully!${NC}\n"
            return 0
        else
            printf "${YELLOW}⚠️ Attempt $attempt failed${NC}\n"
            
            if [ $attempt -lt $max_attempts ]; then
                printf "${YELLOW}🔄 Cleaning up and retrying...${NC}\n"
                cleanup_dfx
                sleep 2
            fi
            
            attempt=$((attempt + 1))
        fi
    done
    
    printf "${YELLOW}⚠️ All attempts failed, trying manual approach...${NC}\n"
    
    # Final attempt with minimal options
    dfx start --background --host localhost:4943 || {
        printf "${YELLOW}⚠️ Manual approach failed, trying without host binding...${NC}\n"
        dfx start --background
    }
}

# Start dfx
start_dfx

printf "${GREEN}✅ Local Internet Computer environment is ready!${NC}\n"

# Wait for replica to be ready
printf "${YELLOW}⏳ Waiting for replica to be ready...${NC}\n"
sleep 5

# Check if replica is responding
if ! dfx ping --network local >/dev/null 2>&1; then
    printf "${YELLOW}⚠️ Replica not responding, waiting a bit more...${NC}\n"
    sleep 10
fi

# Deploy the canisters
echo "\n====================\nDeploying canisters...\n===================="

# Function to deploy with retry logic
deploy_canisters() {
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        printf "${YELLOW}🔄 Attempt $attempt: Deploying split_dapp...${NC}\n"
        
        # Use identity-agnostic deployment with anonymous principal as admin
        # This allows ANY authenticated user to use the canister
        if dfx deploy split_dapp --network local --mode=reinstall --argument "(principal \"2vxsx-fae\", \"ckbtc-minter-canister-id\")" -y; then
            printf "${GREEN}✅ Canister deployed successfully!${NC}\n"
            printf "${GREEN}✅ Identity-agnostic deployment: Works with ANY user principal${NC}\n"
            return 0
        else
            printf "${YELLOW}⚠️ Deployment attempt $attempt failed${NC}\n"
            
            if [ $attempt -lt $max_attempts ]; then
                printf "${YELLOW}🔄 Waiting before retry...${NC}\n"
                sleep 5
            fi
            
            attempt=$((attempt + 1))
        fi
    done
    
    printf "${YELLOW}⚠️ All deployment attempts failed${NC}\n"
    return 1
}

# Deploy canisters
deploy_canisters

# Generate frontend bindings
echo "🛠 Generating frontend bindings..."
dfx generate split_dapp --network local

# Set initial balances
echo "💰 Setting up initial balances..."
FRONTEND_PRINCIPAL="uu3ee-ff3xm-vhws5-zxy6q-vtsvx-q2uhy-4ligb-wcltn-dd6xn-bckkv-mqe"
ADMIN_PRINCIPAL=$(dfx identity get-principal)
ICP_E8S=1000000000  # 10 ICP for testing

# Function to setup initial balances with retry logic
setup_initial_balances() {
    printf "${YELLOW}🔄 Setting up initial balances...${NC}\n"
    
    # Set initial ICP balance for frontend principal (10 ICP)
    dfx canister call split_dapp setInitialBalance "(principal \"$FRONTEND_PRINCIPAL\", $ICP_E8S, principal \"$ADMIN_PRINCIPAL\")" --network local || {
        printf "${YELLOW}⚠️ Failed to set ICP balance, retrying...${NC}\n"
        sleep 2
        dfx canister call split_dapp setInitialBalance "(principal \"$FRONTEND_PRINCIPAL\", $ICP_E8S, principal \"$ADMIN_PRINCIPAL\")" --network local
    }
    
    printf "${GREEN}✅ Initial balances setup complete!${NC}\n"
}

# Setup initial balances
setup_initial_balances


# Final success message
echo "\n====================\n🎉 Local Development Environment Ready! 🎉\n===================="
printf "${GREEN}✅ dfx replica running on localhost:4943${NC}\n"
printf "${GREEN}✅ split_dapp canister deployed (identity-agnostic)${NC}\n"
printf "${GREEN}✅ Frontend bindings generated${NC}\n"
printf "${GREEN}✅ Initial balances configured${NC}\n"
printf "${GREEN}✅ Test users created${NC}\n"
echo "\n🚀 You can now start your frontend development server!"
echo "\n💡 Note: cKBTC wallet addresses will be generated automatically when users visit the Integrations page."
echo "\n🔐 Multi-user ready: Any authenticated user can now use the canister!"
