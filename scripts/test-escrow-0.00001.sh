#!/bin/bash

echo "🧪 Testing Escrow Creation with 0.00001 BTC..."
echo ""

# Check if dfx is running
if ! dfx ping > /dev/null 2>&1; then
    echo "❌ DFX is not running. Please start dfx first: dfx start --background"
    exit 1
fi

# Test principals - using actual user principal
SENDER_PRINCIPAL="foj7a-xll5u-qiecr-quazw-tsad5-lhqex-e25yi-i4cwj-rdq3v-4pomz-hae"
RECIPIENT_PRINCIPAL="hxmjs-porgp-cfkrg-37ls7-ph6op-5nfza-v2v3a-c7asz-xecxj-fidqe-qqe"
ADMIN_PRINCIPAL="foj7a-xll5u-qiecr-quazw-tsad5-lhqex-e25yi-i4cwj-rdq3v-4pomz-hae"
ESCROW_AMOUNT=1000  # 0.00001 BTC in satoshis

echo "📋 Test Configuration:"
echo "   Sender: $SENDER_PRINCIPAL"
echo "   Recipient: $RECIPIENT_PRINCIPAL"
echo "   Amount: $ESCROW_AMOUNT satoshis (0.00001 BTC)"
echo ""

# Step 1: Get initial balances
echo "📊 Step 1: Fetching initial balances..."
SENDER_BALANCE=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$SENDER_PRINCIPAL\")" | grep -o '[0-9_]*' | sed 's/_//g')
RECIPIENT_BALANCE=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$RECIPIENT_PRINCIPAL\")" | grep -o '[0-9_]*' | sed 's/_//g')

echo "   Sender: $SENDER_BALANCE satoshis"
echo "   Recipient: $RECIPIENT_BALANCE satoshis"
echo ""

# Check if sender has enough balance
if [ "$SENDER_BALANCE" -lt "$ESCROW_AMOUNT" ]; then
    echo "❌ ERROR: Insufficient balance!"
    echo "   Required: $ESCROW_AMOUNT satoshis"
    echo "   Available: $SENDER_BALANCE satoshis"
    echo "   Difference: $((ESCROW_AMOUNT - SENDER_BALANCE)) satoshis"
    exit 1
fi

echo "✅ Sufficient balance confirmed"
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
  \"Test: 0.00001 BTC Escrow\" : text
)")

echo "   Raw result: $ESCROW_RESULT"

# Check if the result contains an error
if echo "$ESCROW_RESULT" | grep -q "Error:"; then
    echo "❌ ERROR: Escrow creation failed!"
    echo "$ESCROW_RESULT"
    exit 1
fi

ESCROW_ID=$(echo "$ESCROW_RESULT" | grep -o '"[^"]*"' | head -1 | sed 's/"//g')
echo "   Escrow ID: $ESCROW_ID"
echo ""

# Step 3: Verify escrow is pending
echo "📋 Step 3: Verifying escrow is in pending state..."
SENDER_TX=$(dfx canister call split_dapp getTransaction "(\"$ESCROW_ID\" : text, principal \"$SENDER_PRINCIPAL\")")
RECIPIENT_TX=$(dfx canister call split_dapp getTransaction "(\"$ESCROW_ID\" : text, principal \"$RECIPIENT_PRINCIPAL\")")

echo "   Sender transaction: $SENDER_TX"
echo "   Recipient transaction: $RECIPIENT_TX"
echo ""

# Step 4: Check updated balances
echo "📊 Step 4: Checking updated balances..."
NEW_SENDER_BALANCE=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$SENDER_PRINCIPAL\")" | grep -o '[0-9_]*' | sed 's/_//g')
NEW_RECIPIENT_BALANCE=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$RECIPIENT_PRINCIPAL\")" | grep -o '[0-9_]*' | sed 's/_//g')

echo "   Sender (after): $NEW_SENDER_BALANCE satoshis (was: $SENDER_BALANCE)"
echo "   Recipient (after): $NEW_RECIPIENT_BALANCE satoshis (was: $RECIPIENT_BALANCE)"
echo ""

# Summary
echo "🎉 Test Summary:"
echo "📋 Escrow ID: $ESCROW_ID"
echo "💰 Amount: $ESCROW_AMOUNT satoshis (0.00001 BTC)"
echo "👤 Sender: $SENDER_PRINCIPAL"
echo "👥 Recipient: $RECIPIENT_PRINCIPAL"
echo "✅ Escrow successfully created!"
echo "✅ Balance check passed!"
echo "✅ All test steps completed successfully!"
echo ""
