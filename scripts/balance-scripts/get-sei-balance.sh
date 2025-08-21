#!/bin/bash

# Get SEI balance for a user
# Usage: ./scripts/get-sei-balance.sh [PRINCIPAL]
# If no principal provided, uses the default one

PRINCIPAL=${1:-"ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe"}

echo "🔍 Getting SEI balance for principal: $PRINCIPAL"
dfx canister call split_dapp getUserSeiBalance "(principal \"$PRINCIPAL\")" --network local
