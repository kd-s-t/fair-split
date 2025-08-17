#!/bin/bash

echo "🧹 Clearing all test data..."

# Check if dfx is running
if ! dfx ping > /dev/null 2>&1; then
    echo "❌ DFX is not running. Please start dfx first: dfx start --background"
    exit 1
fi

# Test principals
SENDER_PRINCIPAL="ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe"
RECIPIENT_PRINCIPAL="hxmjs-porgp-cfkrg-37ls7-ph6op-5nfza-v2v3a-c7asz-xecxj-fidqe-qqe"
ADMIN_PRINCIPAL="ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe"

echo "📋 Clearing balances for:"
echo "   Sender: $SENDER_PRINCIPAL"
echo "   Recipient: $RECIPIENT_PRINCIPAL"
echo ""

# Clear Bitcoin balances (set to 0)
echo "💰 Clearing Bitcoin balances..."
dfx canister call split_dapp setBitcoinBalance "(principal \"$ADMIN_PRINCIPAL\", principal \"$SENDER_PRINCIPAL\", 0 : nat)"
dfx canister call split_dapp setBitcoinBalance "(principal \"$ADMIN_PRINCIPAL\", principal \"$RECIPIENT_PRINCIPAL\", 0 : nat)"

# Clear mock cKBTC balances
echo "💰 Clearing mock cKBTC balances..."
dfx canister call split_dapp setMockBitcoinBalance "(principal \"$SENDER_PRINCIPAL\", 0 : nat)"
dfx canister call split_dapp setMockBitcoinBalance "(principal \"$RECIPIENT_PRINCIPAL\", 0 : nat)"

# Clear ICP balances (set to 0)
echo "💰 Clearing ICP balances..."
dfx canister call split_dapp setInitialBalance "(principal \"$SENDER_PRINCIPAL\", 0 : nat, principal \"$ADMIN_PRINCIPAL\")"
dfx canister call split_dapp setInitialBalance "(principal \"$RECIPIENT_PRINCIPAL\", 0 : nat, principal \"$ADMIN_PRINCIPAL\")"

# Reset user reputation (optional - uncomment if needed)
# echo "🔄 Resetting user reputation..."
# dfx canister call split_dapp resetUserReputation "(principal \"$SENDER_PRINCIPAL\", principal \"$ADMIN_PRINCIPAL\")"
# dfx canister call split_dapp resetUserReputation "(principal \"$RECIPIENT_PRINCIPAL\", principal \"$ADMIN_PRINCIPAL\")"

echo ""
echo "📊 Verifying cleared balances..."
SENDER_BALANCE=$(dfx canister call split_dapp getCkbtcBalance "(principal \"$SENDER_PRINCIPAL\")" | grep -o 'ok = [0-9_]*' | sed 's/ok = //' | sed 's/_//g')
RECIPIENT_BALANCE=$(dfx canister call split_dapp getCkbtcBalance "(principal \"$RECIPIENT_PRINCIPAL\")" | grep -o 'ok = [0-9_]*' | sed 's/ok = //' | sed 's/_//g')

echo "   Sender: $SENDER_BALANCE satoshis"
echo "   Recipient: $RECIPIENT_BALANCE satoshis"
echo ""

echo "✅ Data cleared successfully!"
echo "💡 You can now run the test again with: ./scripts/test-release-split.sh"
