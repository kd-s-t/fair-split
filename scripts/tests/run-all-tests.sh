#!/bin/bash

echo "🧪 Running All E2E Integration Tests"
echo "===================================="
echo ""

# Check if dfx is running
if ! dfx ping > /dev/null 2>&1; then
    echo "❌ DFX is not running. Please start dfx first: dfx start --background"
    exit 1
fi

echo "🚀 Starting test sequence..."
echo ""

# Test 1: Withdraw
echo "1️⃣ Running: Withdraw Test"
echo "------------------------"
./scripts/tests/test-withdraw.sh
if [ $? -ne 0 ]; then
    echo "❌ Withdraw test failed"
    exit 1
fi
echo ""

# Test 2: Decline Split
echo "2️⃣ Running: Decline Split Test"
echo "-----------------------------"
./scripts/tests/test-decline-split.sh
if [ $? -ne 0 ]; then
    echo "❌ Decline split test failed"
    exit 1
fi
echo ""

# Test 3: Cancel Split
echo "3️⃣ Running: Cancel Split Test"
echo "----------------------------"
./scripts/tests/test-cancel-split.sh
if [ $? -ne 0 ]; then
    echo "❌ Cancel split test failed"
    exit 1
fi
echo ""

# Test 4: Release Split
echo "4️⃣ Running: Release Split Test"
echo "------------------------------"
./scripts/tests/test-release-split.sh
if [ $? -ne 0 ]; then
    echo "❌ Release split test failed"
    exit 1
fi
echo ""

# Test 5: SEI Testnet
echo "5️⃣ Running: SEI Testnet Test"
echo "----------------------------"
./scripts/tests/test-sei-testnet.sh
if [ $? -ne 0 ]; then
    echo "❌ SEI testnet test failed"
    exit 1
fi
echo ""

echo "✅ All tests completed successfully!"
echo ""
echo "📊 Test Summary:"
echo "   • ✅ Withdraw functionality"
echo "   • ✅ Escrow decline functionality"
echo "   • ✅ Escrow cancellation functionality"
echo "   • ✅ Escrow release functionality"
echo "   • ✅ SEI integration"
echo ""
echo "🎉 All E2E integration tests passed!"
echo ""
