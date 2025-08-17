#!/bin/bash

# Use static principal for browser-based development
STATIC_PRINCIPAL="ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe"
echo "Using static principal: $STATIC_PRINCIPAL"

# Deploy split_dapp with automatic arguments
echo "Deploying split_dapp with arguments..."
dfx deploy split_dapp --network local --mode=reinstall --argument "(principal \"$STATIC_PRINCIPAL\", \"ckbtc-minter-canister-id\")" --yes

# Generate TypeScript declarations
echo "Generating TypeScript declarations..."
dfx generate --network local

echo "Backend deployment complete!"
