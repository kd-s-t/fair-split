#!/bin/bash

# Set ICP balance for a user
# Usage: ./scripts/set-icp-balance.sh [PRINCIPAL] [AMOUNT]
# If no principal provided, uses the default one
# Amount should be in e8s (e.g., 1000000000 for 10 ICP)

PRINCIPAL=${1:-"ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe"}
AMOUNT=${2:-"1000000000"}

echo "💰 Setting ICP balance for principal: $PRINCIPAL"
echo "💰 Amount: $AMOUNT e8s ($(echo "scale=8; $AMOUNT/100000000" | bc) ICP)"
dfx canister call split_dapp setInitialBalance "(principal \"$PRINCIPAL\", $AMOUNT, principal \"$(dfx identity get-principal)\")" --network local
