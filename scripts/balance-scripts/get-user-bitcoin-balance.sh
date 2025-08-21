#!/bin/bash

# Get Bitcoin balance for a user
# Usage: ./scripts/get-user-bitcoin-balance.sh [PRINCIPAL]
# If no principal provided, uses the default one

PRINCIPAL=${1:-"ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe"}

echo "🔍 Getting Bitcoin balance for principal: $PRINCIPAL"
dfx canister call split_dapp getUserBitcoinBalance "(principal \"$PRINCIPAL\")" --network local