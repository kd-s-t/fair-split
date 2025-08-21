#!/bin/bash

# Set username for a user
# Usage: ./scripts/set-username.sh [PRINCIPAL] [USERNAME]
# If no principal provided, uses the default one

PRINCIPAL=${1:-"ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe"}
USERNAME=${2:-"admin"}

echo "👤 Setting username for principal: $PRINCIPAL"
echo "👤 Username: $USERNAME"
dfx canister call split_dapp setUsername "(principal \"$PRINCIPAL\", \"$USERNAME\")" --network local
