#!/bin/bash

# Set Bitcoin balance for a user
# Usage: ./scripts/set-bitcoin-balance.sh [PRINCIPAL] [AMOUNT]
# If no principal provided, uses the default one
# Amount should be in satoshis (e.g., 100000000 for 1 BTC)

PRINCIPAL=${1:-"ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe"}
AMOUNT=${2:-"100000000"}

echo "💰 Setting Bitcoin balance for principal: $PRINCIPAL"
echo "💰 Amount: $AMOUNT satoshis ($(echo "scale=8; $AMOUNT/100000000" | bc) BTC)"
dfx canister call split_dapp setBitcoinBalance "(principal \"$(dfx identity get-principal)\", principal \"$PRINCIPAL\", $AMOUNT)" --network local
