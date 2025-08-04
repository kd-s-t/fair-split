#!/bin/bash

set -e

# Start the local replica
echo "\n====================\nStarting local replica...\n===================="
./scripts/start.sh

# Deploy the canisters
echo "\n====================\nDeploying canisters...\n===================="
./scripts/deploy.sh

# Seed user identities and principals
echo "\n====================\nSeeding user identities...\n===================="
./scripts/seed-users.sh
