#!/bin/bash

echo "🔍 Debugging Balance Issue..."
echo ""

SENDER_PRINCIPAL="foj7a-xll5u-qiecr-quazw-tsad5-lhqex-e25yi-i4cwj-rdq3v-4pomz-hae"
ADMIN_PRINCIPAL="ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe"

echo "📋 Principals:"
echo "   Sender: $SENDER_PRINCIPAL"
echo "   Admin: $ADMIN_PRINCIPAL"
echo ""

# Step 1: Check current balance
echo "📊 Step 1: Current balance via getUserBitcoinBalance"
BALANCE_RESULT=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$SENDER_PRINCIPAL\")")
echo "   Result: $BALANCE_RESULT"
echo ""

# Step 2: Set balance again to make sure
echo "💰 Step 2: Setting balance again"
SET_RESULT=$(dfx canister call split_dapp setBitcoinBalance "(principal \"$ADMIN_PRINCIPAL\", principal \"$SENDER_PRINCIPAL\", 100_000_000 : nat)")
echo "   Result: $SET_RESULT"
echo ""

# Step 3: Check balance again
echo "📊 Step 3: Balance after setting"
BALANCE_RESULT2=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$SENDER_PRINCIPAL\")")
echo "   Result: $BALANCE_RESULT2"
echo ""

# Step 4: Try a direct call to initiateEscrow with minimal data
echo "🔐 Step 4: Testing initiateEscrow directly"
ESCROW_RESULT=$(dfx canister call split_dapp initiateEscrow "(
  principal \"$SENDER_PRINCIPAL\",
  vec {
    record {
      amount = 1000 : nat;
      nickname = \"Debug Test\" : text;
      percentage = 100 : nat;
      \"principal\" = principal \"$SENDER_PRINCIPAL\";
    };
  },
  \"Debug Test\" : text
)")

echo "   Result: $ESCROW_RESULT"
echo ""

echo "🔍 Debug complete!"
