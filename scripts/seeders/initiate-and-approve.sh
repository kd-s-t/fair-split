#!/bin/bash

echo "🌱 Seeder: Initiate Escrow + Approve"
echo "====================================="
echo ""

# Check if dfx is running
if ! dfx ping > /dev/null 2>&1; then
    echo "❌ DFX is not running. Please start dfx first: dfx start --background"
    exit 1
fi

# Test principals
SENDER_PRINCIPAL="ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe"
RECIPIENT_PRINCIPAL="hxmjs-porgp-cfkrg-37ls7-ph6op-5nfza-v2v3a-c7asz-xecxj-fidqe-qqe"
ADMIN_PRINCIPAL="ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe"
ESCROW_AMOUNT=4000  # 0.00004 BTC in satoshis

echo "📋 Configuration:"
echo "   Sender: $SENDER_PRINCIPAL"
echo "   Recipient: $RECIPIENT_PRINCIPAL"
echo "   Amount: $ESCROW_AMOUNT satoshis (0.00004 BTC)"
echo ""

# Set initial balances
echo "💰 Setting initial balances..."
dfx canister call split_dapp setBitcoinBalance "(principal \"$ADMIN_PRINCIPAL\", principal \"$SENDER_PRINCIPAL\", 100_000_000 : nat)"
dfx canister call split_dapp setBitcoinBalance "(principal \"$ADMIN_PRINCIPAL\", principal \"$RECIPIENT_PRINCIPAL\", 5_000 : nat)"
echo ""

# Get initial balances
echo "📊 Initial balances..."
SENDER_BALANCE=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$SENDER_PRINCIPAL\")" | grep -o '[0-9_]*' | sed 's/_//g')
RECIPIENT_BALANCE=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$RECIPIENT_PRINCIPAL\")" | grep -o '[0-9_]*' | sed 's/_//g')

echo "   Sender: $SENDER_BALANCE satoshis"
echo "   Recipient: $RECIPIENT_BALANCE satoshis"
echo ""

# Step 1: Create escrow
echo "🔐 Step 1: Creating escrow..."
ESCROW_RESULT=$(dfx canister call split_dapp initiateEscrow "(
  principal \"$SENDER_PRINCIPAL\",
  vec {
    record {
      amount = $ESCROW_AMOUNT : nat;
      nickname = \"Seeder Recipient\" : text;
      percentage = 100 : nat;
      \"principal\" = principal \"$RECIPIENT_PRINCIPAL\";
    };
  },
  \"Seeder: Initiate + Approve\" : text
)")

ESCROW_ID=$(echo "$ESCROW_RESULT" | grep -o '"[^"]*"' | head -1 | sed 's/"//g')
echo "   Escrow ID: $ESCROW_ID"
echo ""

# Step 2: Approve escrow
echo "✅ Step 2: Approving escrow..."
dfx canister call split_dapp recipientApproveEscrow "(
  principal \"$SENDER_PRINCIPAL\",
  \"$ESCROW_ID\" : text,
  principal \"$RECIPIENT_PRINCIPAL\"
)"
echo "   Escrow approved by recipient"
echo ""

# Verify escrow is approved
echo "📋 Verifying escrow is approved..."
SENDER_TX=$(dfx canister call split_dapp getTransaction "(\"$ESCROW_ID\" : text, principal \"$SENDER_PRINCIPAL\")")
RECIPIENT_TX=$(dfx canister call split_dapp getTransaction "(\"$ESCROW_ID\" : text, principal \"$RECIPIENT_PRINCIPAL\")")

echo "   Sender transaction: $SENDER_TX"
echo "   Recipient transaction: $RECIPIENT_TX"
echo ""

# Summary
echo "✅ Seeder Complete: Initiate Escrow + Approve"
echo "📋 Escrow ID: $ESCROW_ID"
echo "💰 Amount: $ESCROW_AMOUNT satoshis (0.00004 BTC)"
echo "👤 Sender: $SENDER_PRINCIPAL"
echo "👥 Recipient: $RECIPIENT_PRINCIPAL"
echo "📊 Status: Approved (ready for release)"
echo ""
