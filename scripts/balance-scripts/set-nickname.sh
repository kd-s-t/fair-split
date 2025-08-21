#!/bin/bash

# Set nickname for a user
# Usage: ./scripts/set-nickname.sh [PRINCIPAL] [NICKNAME]
# If no principal provided, uses the default one

PRINCIPAL=${1:-"ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe"}
NICKNAME=${2:-"admin"}

echo "📝 Setting nickname for principal: $PRINCIPAL"
echo "📝 Nickname: $NICKNAME"
dfx canister call split_dapp setNickname "(principal \"$PRINCIPAL\", \"$NICKNAME\")" --network local
