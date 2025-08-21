#!/bin/bash

echo "🧪 Testing SEI Testnet Integration..."
echo "====================================="

# Test SEI network info
echo "📡 Testing SEI Network Info..."
dfx canister call split_dapp getSeiNetworkInfo

echo ""
echo "💰 Testing SEI Balance Query..."
# Test with a sample principal
dfx canister call split_dapp getSeiBalance '(principal "2vxsx-fae")'

echo ""
echo "🔗 Testing SEI Wallet Generation..."
dfx canister call split_dapp requestSeiWalletAnonymous

echo ""
echo "🚰 Testing SEI Faucet URL..."
dfx canister call split_dapp getSeiFaucetUrl

echo ""
echo "✅ SEI Testnet Integration Test Complete!"
echo ""
echo "🌐 SEI Testnet Resources:"
echo "   - RPC: https://rpc.atlantic-2.seinetwork.io"
echo "   - Explorer: https://atlantic-2.sei.explorers.guru"
echo "   - Faucet: https://atlantic-2.sei.explorers.guru/faucet"
echo ""
echo "💡 Next Steps:"
echo "   1. Get test SEI from faucet"
echo "   2. Test SEI escrow creation"
echo "   3. Verify transaction simulation"
