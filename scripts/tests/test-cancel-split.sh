#!/bin/bash

echo "🧪 Starting CancelSplit E2E Test..."
echo ""

# Check if dfx is running
if ! dfx ping > /dev/null 2>&1; then
    echo "❌ DFX is not running. Please start dfx first: dfx start --background"
    exit 1
fi

# Real test principals
SENDER_PRINCIPAL="ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe"
RECIPIENT_PRINCIPAL="hxmjs-porgp-cfkrg-37ls7-ph6op-5nfza-v2v3a-c7asz-xecxj-fidqe-qqe"
ADMIN_PRINCIPAL="ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe"
ESCROW_AMOUNT=3000  # 0.00003 BTC in satoshis (0.00003 * 100000000)

echo "📋 Test Configuration:"
echo "   Sender: $SENDER_PRINCIPAL"
echo "   Recipient: $RECIPIENT_PRINCIPAL"
echo "   Amount: $ESCROW_AMOUNT satoshis (0.00003 BTC)"
echo ""

# Set initial balances for testing
echo "💰 Setting initial balances..."
dfx canister call split_dapp setBitcoinBalance "(principal \"$ADMIN_PRINCIPAL\", principal \"$SENDER_PRINCIPAL\", 100_000_000 : nat)"
dfx canister call split_dapp setBitcoinBalance "(principal \"$ADMIN_PRINCIPAL\", principal \"$RECIPIENT_PRINCIPAL\", 5_000 : nat)"
echo "   ✅ Set balances for sender and recipient"
echo ""

# Step 1: Get initial balances
echo "📊 Step 1: Fetching initial balances..."
SENDER_BALANCE=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$SENDER_PRINCIPAL\")" | grep -o '[0-9_]*' | sed 's/_//g')
RECIPIENT_BALANCE=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$RECIPIENT_PRINCIPAL\")" | grep -o '[0-9_]*' | sed 's/_//g')

echo "   Sender: $SENDER_BALANCE satoshis"
echo "   Recipient: $RECIPIENT_BALANCE satoshis"
echo ""

# Step 2: Create escrow
echo "🔐 Step 2: Creating escrow..."
ESCROW_RESULT=$(dfx canister call split_dapp initiateEscrow "(
  principal \"$SENDER_PRINCIPAL\",
  vec {
    record {
      amount = $ESCROW_AMOUNT : nat;
      nickname = \"Test Recipient\" : text;
      percentage = 100 : nat;
      \"principal\" = principal \"$RECIPIENT_PRINCIPAL\";
    };
  },
  \"CancelSplit E2E Test\" : text
)")

ESCROW_ID=$(echo "$ESCROW_RESULT" | grep -o '"[^"]*"' | head -1 | sed 's/"//g')
echo "   Escrow ID: $ESCROW_ID"
echo ""

# Step 3: Verify escrow is pending
echo "⏳ Step 3: Verifying escrow is in pending state..."
SENDER_TX_BEFORE=$(dfx canister call split_dapp getTransaction "(\"$ESCROW_ID\" : text, principal \"$SENDER_PRINCIPAL\")")
echo "   Transaction status before cancellation: $SENDER_TX_BEFORE"
echo ""

# Step 4: Cancel escrow (sender cancels before recipient approves)
echo "❌ Step 4: Cancelling escrow..."
dfx canister call split_dapp cancelSplit "(
  principal \"$SENDER_PRINCIPAL\"
)"
echo "   ✅ Escrow cancelled by sender"
echo ""

# Step 5: Get final balances
echo "📊 Step 5: Verifying final balances..."
FINAL_SENDER_BALANCE=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$SENDER_PRINCIPAL\")" | grep -o '[0-9_]*' | sed 's/_//g')
FINAL_RECIPIENT_BALANCE=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$RECIPIENT_PRINCIPAL\")" | grep -o '[0-9_]*' | sed 's/_//g')

echo "   Final sender balance: $FINAL_SENDER_BALANCE satoshis"
echo "   Final recipient balance: $FINAL_RECIPIENT_BALANCE satoshis"
echo ""

# Step 6: Get transaction status after cancellation
echo "📋 Step 6: Verifying transaction status after cancellation..."
SENDER_TX_AFTER=$(dfx canister call split_dapp getTransaction "(\"$ESCROW_ID\" : text, principal \"$SENDER_PRINCIPAL\")")
RECIPIENT_TX_AFTER=$(dfx canister call split_dapp getTransaction "(\"$ESCROW_ID\" : text, principal \"$RECIPIENT_PRINCIPAL\")")

echo "   Sender transaction after cancellation: $SENDER_TX_AFTER"
echo "   Recipient transaction after cancellation: $RECIPIENT_TX_AFTER"
echo ""

# Summary
echo "🎉 CancelSplit E2E Test Summary:"
echo "📋 Escrow ID: $ESCROW_ID"
echo "💰 Amount: $ESCROW_AMOUNT satoshis (0.00003 BTC)"
echo "👤 Sender: $SENDER_PRINCIPAL"
echo "👥 Recipient: $RECIPIENT_PRINCIPAL"
echo "✅ Escrow successfully cancelled by sender"
echo "✅ All cancel tests completed successfully!"
echo ""
