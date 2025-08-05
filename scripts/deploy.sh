#!/bin/bash

ADMIN_PRINCIPAL=$(dfx identity get-principal)
FRONTEND_PRINCIPAL="uu3ee-ff3xm-vhws5-zxy6q-vtsvx-q2uhy-4ligb-wcltn-dd6xn-bckkv-mqe"
ICP_E8S=0                     # 0 ICP
BTC_SATOSHIS=1000000000       # 10 BTC in satoshis (10 * 100,000,000)
BTC_ADDRESS="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"  # Test Bitcoin address

echo "🔄 Deploying split_dapp with admin = $(dfx identity get-principal)..."

# 1. Set cKBTC canister ID (using testnet for local development)
CKBTC_ID="ml52i-qqaaa-aaaar-qaabq-cai"  # Testnet
echo "🔗 Using TESTNET cKBTC: $CKBTC_ID"

# 3. Reinstall with admin argument and cKBTC canister ID
dfx deploy split_dapp --mode=reinstall --argument "(principal \"$(dfx identity get-principal)\", \"$CKBTC_ID\")" -y

# 3. Generate frontend bindings
echo "🛠 Generating frontend bindings..."
dfx generate split_dapp

# 4. Set initial ICP balance for frontend principal (0 ICP)
echo "💰 Setting initial ICP balance for $FRONTEND_PRINCIPAL..."
dfx canister call split_dapp setInitialBalance "(principal \"$FRONTEND_PRINCIPAL\", $ICP_E8S, principal \"$ADMIN_PRINCIPAL\")"

# 5. Set initial Bitcoin balance (10 BTC)
echo "₿ Setting initial Bitcoin balance..."
dfx canister call split_dapp setBitcoinBalance "(principal \"$ADMIN_PRINCIPAL\", principal \"$FRONTEND_PRINCIPAL\", $BTC_SATOSHIS)"

# 6. Bind Bitcoin address for frontend principal
echo "🔗 Binding Bitcoin address for $FRONTEND_PRINCIPAL..."
dfx canister call split_dapp setBitcoinAddress "(principal \"$FRONTEND_PRINCIPAL\", \"$BTC_ADDRESS\")"

echo "✅ Deploy complete with Bitcoin integration!"
