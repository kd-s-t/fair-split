#!/bin/bash

# Get ICP balance for a user
# Usage: ./scripts/get-icp-balance.sh [PRINCIPAL]
# If no principal provided, uses the default one

PRINCIPAL=${1:-"ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe"}

echo "🔍 Getting ICP balance for principal: $PRINCIPAL"
dfx canister call split_dapp getBalance "(principal \"$PRINCIPAL\")" --network local
