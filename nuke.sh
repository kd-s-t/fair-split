#!/bin/bash

set -e

# Start the local replica
echo "\n====================\nStarting local replica...\n===================="
./start.sh

# Deploy the canisters
echo "\n====================\nDeploying canisters...\n===================="
./deploy.sh

# Seed user identities and principals
echo "\n====================\nSeeding user identities...\n===================="
./seed-users.sh
