#!/bin/bash

ADMIN_PRINCIPAL=$(dfx identity get-principal)
FRONTEND_PRINCIPAL="uu3ee-ff3xm-vhws5-zxy6q-vtsvx-q2uhy-4ligb-wcltn-dd6xn-bckkv-mqe"
BTC_SATOSHIS=1000000000
rm -rf frontend/src/declarations/split_dapp frontend/src/declarations/split_dapp_test src/declarations

echo "🔄 Deploying split_dapp with admin = $(dfx identity get-principal)..."

# 1. Reinstall with admin argument
dfx deploy split_dapp --mode=reinstall --argument "(principal \"$(dfx identity get-principal)\")" -y

# 2. Generate frontend bindings
echo "🛠 Generating frontend bindings..."
dfx generate split_dapp

# 3. Copy the generated declarations to frontend
echo "📦 Copying declarations to frontend..."
cp -r src/declarations/* frontend/src/declarations/

# 4. Set initial balance for frontend principal
echo "💰 Setting initial balance for $FRONTEND_PRINCIPAL..."
dfx canister call split_dapp setInitialBalance "(principal \"$FRONTEND_PRINCIPAL\", $BTC_SATOSHIS, principal \"$ADMIN_PRINCIPAL\")"

echo "✅ Deploy complete!"
