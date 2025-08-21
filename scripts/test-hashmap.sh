#!/bin/bash

echo "🔍 Testing HashMap Operations..."
echo ""

SENDER_PRINCIPAL="foj7a-xll5u-qiecr-quazw-tsad5-lhqex-e25yi-i4cwj-rdq3v-4pomz-hae"
ADMIN_PRINCIPAL="ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe"

echo "📋 Test Configuration:"
echo "   Sender: $SENDER_PRINCIPAL"
echo "   Admin: $ADMIN_PRINCIPAL"
echo ""

# Step 1: Clear the balance first
echo "🧹 Step 1: Clearing balance"
CLEAR_RESULT=$(dfx canister call split_dapp setBitcoinBalance "(principal \"$ADMIN_PRINCIPAL\", principal \"$SENDER_PRINCIPAL\", 0 : nat)")
echo "   Result: $CLEAR_RESULT"
echo ""

# Step 2: Check balance is 0
echo "📊 Step 2: Checking balance is 0"
BALANCE_ZERO=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$SENDER_PRINCIPAL\")")
echo "   Result: $BALANCE_ZERO"
echo ""

# Step 3: Set balance to 1000 satoshis
echo "💰 Step 3: Setting balance to 1000 satoshis"
SET_RESULT=$(dfx canister call split_dapp setBitcoinBalance "(principal \"$ADMIN_PRINCIPAL\", principal \"$SENDER_PRINCIPAL\", 1000 : nat)")
echo "   Result: $SET_RESULT"
echo ""

# Step 4: Check balance is 1000
echo "📊 Step 4: Checking balance is 1000"
BALANCE_1000=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$SENDER_PRINCIPAL\")")
echo "   Result: $BALANCE_1000"
echo ""

# Step 5: Try escrow creation with 1000 satoshis
echo "🔐 Step 5: Testing escrow creation with 1000 satoshis"
ESCROW_RESULT=$(dfx canister call split_dapp initiateEscrow "(
  principal \"$SENDER_PRINCIPAL\",
  vec {
    record {
      amount = 1000 : nat;
      nickname = \"HashMap Test\" : text;
      percentage = 100 : nat;
      \"principal\" = principal \"$SENDER_PRINCIPAL\";
    };
  },
  \"HashMap Test\" : text
)")

echo "   Result: $ESCROW_RESULT"
echo ""

echo "🔍 HashMap test complete!"
