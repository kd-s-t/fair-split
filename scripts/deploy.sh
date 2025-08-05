#!/bin/bash

ADMIN_PRINCIPAL=$(dfx identity get-principal)
FRONTEND_PRINCIPAL="uu3ee-ff3xm-vhws5-zxy6q-vtsvx-q2uhy-4ligb-wcltn-dd6xn-bckkv-mqe"
BTC_SATOSHIS=1000000000

echo "🔄 Deploying split_dapp with admin = $(dfx identity get-principal)..."

# 1. Set cKBTC canister ID (using testnet for local development)
CKBTC_ID="ml52i-qqaaa-aaaar-qaabq-cai"  # Testnet
echo "🔗 Using TESTNET cKBTC: $CKBTC_ID"

# 3. Reinstall with admin argument and cKBTC canister ID
dfx deploy split_dapp --mode=reinstall --argument "(principal \"$(dfx identity get-principal)\", \"$CKBTC_ID\")" -y

# 3. Generate frontend bindings
echo "🛠 Generating frontend bindings..."
dfx generate split_dapp

# 4. Set initial balance for frontend principal
echo "💰 Setting initial balance for $FRONTEND_PRINCIPAL..."
dfx canister call split_dapp setInitialBalance "(principal \"$FRONTEND_PRINCIPAL\", $BTC_SATOSHIS, principal \"$ADMIN_PRINCIPAL\")"

echo "✅ Deploy complete with Bitcoin integration!"
