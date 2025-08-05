#!/bin/bash

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Start the local replica
echo "\n====================\nStarting local replica...\n===================="
printf "${YELLOW}🚮 Removing old .dfx state...${NC}\n"
rm -rf .dfx           

printf "${YELLOW}🛑 Stopping any running local replica...${NC}\n"
dfx stop

printf "${YELLOW}🚀 Starting a fresh local replica...${NC}\n"
dfx start --background --clean

printf "${GREEN}✅ Local Internet Computer environment is ready!${NC}\n"

# Deploy the canisters
echo "\n====================\nDeploying canisters...\n===================="
./scripts/deploy.sh

# Seed user identities and principals
echo "\n====================\nSeeding user identities...\n===================="
./scripts/seed-users.sh
