#!/bin/bash

echo "🧪 ReleaseSplit Test - Quick Check"
echo ""

# Check if dfx is available
if ! command -v dfx &> /dev/null; then
    echo "❌ DFX is not installed. Please install DFX first."
    exit 1
fi

echo "✅ DFX is installed"

# Check if we can connect to any network
echo ""
echo "🌐 Checking available networks..."

# Try mainnet
if dfx ping --network ic > /dev/null 2>&1; then
    echo "✅ Mainnet (IC) is available"
    NETWORK="ic"
else
    echo "❌ Mainnet not available"
fi

# Try local
if dfx ping --network local > /dev/null 2>&1; then
    echo "✅ Local network is available"
    NETWORK="local"
else
    echo "❌ Local network not available"
fi

if [ -z "$NETWORK" ]; then
    echo ""
    echo "❌ No networks available. Options:"
    echo "   1. Start local network: dfx start --background (takes 2-5 minutes)"
    echo "   2. Use mainnet (requires canister deployment)"
    echo "   3. Use testnet"
    exit 1
fi

echo ""
echo "🎯 Using network: $NETWORK"

# Real test principals
SENDER_PRINCIPAL="ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe"
RECIPIENT_PRINCIPAL="hxmjs-porgp-cfkrg-37ls7-ph6op-5nfza-v2v3a-c7asz-xecxj-fidqe-qqe"

echo ""
echo "📋 Test Configuration:"
echo "   Network: $NETWORK"
echo "   Sender: $SENDER_PRINCIPAL"
echo "   Recipient: $RECIPIENT_PRINCIPAL"
echo ""

# Check if canister exists
echo "🔍 Checking if split_dapp canister exists..."
if dfx canister id split_dapp --network $NETWORK > /dev/null 2>&1; then
    CANISTER_ID=$(dfx canister id split_dapp --network $NETWORK)
    echo "✅ Canister found: $CANISTER_ID"
    
    echo ""
    echo "📊 Checking balances..."
    
    # Get balances
    SENDER_BALANCE=$(dfx canister call split_dapp getBalance "($SENDER_PRINCIPAL)" --network $NETWORK 2>/dev/null | grep -o '[0-9]*' | head -1 || echo "0")
    RECIPIENT_BALANCE=$(dfx canister call split_dapp getBalance "($RECIPIENT_PRINCIPAL)" --network $NETWORK 2>/dev/null | grep -o '[0-9]*' | head -1 || echo "0")
    
    echo "   Sender balance: $SENDER_BALANCE satoshis"
    echo "   Recipient balance: $RECIPIENT_BALANCE satoshis"
    
    echo ""
    echo "✅ Ready to run ReleaseSplit test!"
    echo "   Run: ./scripts/test-release-split.sh"
    
else
    echo "❌ split_dapp canister not found on $NETWORK"
    echo ""
    echo "Options:"
    echo "   1. Deploy to $NETWORK: dfx deploy --network $NETWORK"
    echo "   2. Start local network and deploy: dfx start --background && dfx deploy"
    echo "   3. Use a different network"
fi
