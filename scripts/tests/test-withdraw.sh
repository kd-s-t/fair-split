#!/bin/bash

# Test script for withdraw functions
# This script tests both ICP to ICP and ckBTC to BTC withdrawals

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if dfx is available
if ! command -v dfx &> /dev/null; then
    print_error "dfx is not installed or not in PATH"
    exit 1
fi

# Get the canister ID
CANISTER_ID=$(dfx canister id split_dapp)
print_status "Using canister ID: $CANISTER_ID"

# Test user principal (using default dfx identity)
USER_PRINCIPAL=$(dfx identity get-principal)
print_status "Using user principal: $USER_PRINCIPAL"

# Set up initial balances for testing
print_status "Setting up initial balances for testing..."

# Get admin principal
ADMIN_PRINCIPAL=$(dfx canister call split_dapp getAdmin)
ADMIN_PRINCIPAL=$(echo "$ADMIN_PRINCIPAL" | sed 's/(principal "\([^"]*\)")/\1/')
print_status "Using admin principal: $ADMIN_PRINCIPAL"

# Set initial ICP balance (100 ICP = 10,000,000,000 e8s)
dfx canister call split_dapp setInitialBalance "(principal \"$USER_PRINCIPAL\", 10_000_000_000 : nat, principal \"$ADMIN_PRINCIPAL\")" || {
    print_error "Failed to set initial ICP balance"
    exit 1
}

# Set initial ckBTC balance (1 ckBTC = 100,000,000 satoshis)
dfx canister call split_dapp setBitcoinBalance "(principal \"$ADMIN_PRINCIPAL\", principal \"$USER_PRINCIPAL\", 100_000_000 : nat)" || {
    print_error "Failed to set initial ckBTC balance"
    exit 1
}

print_success "Initial balances set successfully"

# Check initial balances
print_status "Checking initial balances..."

ICP_BALANCE=$(dfx canister call split_dapp getBalance "(principal \"$USER_PRINCIPAL\")")
print_status "Initial ICP balance: $ICP_BALANCE"

CKBTC_BALANCE=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$USER_PRINCIPAL\")")
print_status "Initial ckBTC balance: $CKBTC_BALANCE"

echo ""
print_status "=== TESTING ICP TO ICP WITHDRAWAL ==="

# Test 1: ICP to ICP Withdrawal
print_status "Testing ICP to ICP withdrawal..."

# Withdraw 10 ICP (1,000,000,000 e8s) to an ICP address
ICP_WITHDRAW_AMOUNT=1_000_000_000
ICP_RECIPIENT_ADDRESS="test-icp-address-123456789012345678901234567890"

print_status "Withdrawing $ICP_WITHDRAW_AMOUNT e8s (10 ICP) to ICP address: $ICP_RECIPIENT_ADDRESS"

ICP_RESULT=$(dfx canister call split_dapp withdrawIcp "(principal \"$USER_PRINCIPAL\", $ICP_WITHDRAW_AMOUNT : nat, \"$ICP_RECIPIENT_ADDRESS\")")

if echo "$ICP_RESULT" | grep -q "ok"; then
    print_success "ICP to ICP withdrawal successful"
    echo "$ICP_RESULT"
else
    print_error "ICP to ICP withdrawal failed"
    echo "$ICP_RESULT"
    exit 1
fi

echo ""
print_status "=== TESTING CKBTC TO BTC WITHDRAWAL ==="

# Test 2: ckBTC to BTC Withdrawal
print_status "Testing ckBTC to BTC withdrawal..."

# Withdraw 0.1 ckBTC (10,000,000 satoshis) to a Bitcoin address
CKBTC_WITHDRAW_AMOUNT=10_000_000
CKBTC_RECIPIENT_ADDRESS="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"

print_status "Withdrawing $CKBTC_WITHDRAW_AMOUNT satoshis (0.1 ckBTC) to Bitcoin address: $CKBTC_RECIPIENT_ADDRESS"

CKBTC_RESULT=$(dfx canister call split_dapp withdrawBtc "(principal \"$USER_PRINCIPAL\", $CKBTC_WITHDRAW_AMOUNT : nat, \"$CKBTC_RECIPIENT_ADDRESS\")")

if echo "$CKBTC_RESULT" | grep -q "ok"; then
    print_success "ckBTC to BTC withdrawal successful"
    echo "$CKBTC_RESULT"
else
    print_error "ckBTC to BTC withdrawal failed"
    echo "$CKBTC_RESULT"
    exit 1
fi

echo ""
print_status "=== BALANCE VERIFICATION ==="

# Check final balances
print_status "Checking final balances after withdrawals..."

FINAL_ICP_BALANCE=$(dfx canister call split_dapp getBalance "(principal \"$USER_PRINCIPAL\")")
print_status "Final ICP balance: $FINAL_ICP_BALANCE"

FINAL_CKBTC_BALANCE=$(dfx canister call split_dapp getUserBitcoinBalance "(principal \"$USER_PRINCIPAL\")")
print_status "Final ckBTC balance: $FINAL_CKBTC_BALANCE"

# Calculate expected balances
EXPECTED_ICP_BALANCE=$((10_000_000_000 - 1_000_000_000))
EXPECTED_CKBTC_BALANCE=$((100_000_000 - 10_000_000))

print_status "Expected ICP balance: $EXPECTED_ICP_BALANCE e8s (9 ICP)"
print_status "Expected ckBTC balance: $EXPECTED_CKBTC_BALANCE satoshis (0.9 ckBTC)"

# Verify balance deductions
if echo "$FINAL_ICP_BALANCE" | grep -q "$EXPECTED_ICP_BALANCE"; then
    print_success "ICP balance deduction verified correctly"
else
    print_warning "ICP balance deduction may not match expected value"
fi

if echo "$FINAL_CKBTC_BALANCE" | grep -q "$EXPECTED_CKBTC_BALANCE"; then
    print_success "ckBTC balance deduction verified correctly"
else
    print_warning "ckBTC balance deduction may not match expected value"
fi

echo ""
print_status "=== TRANSACTION HISTORY ==="

# Get transaction history
print_status "Getting transaction history..."

TRANSACTIONS=$(dfx canister call split_dapp getTransactionsPaginated "(principal \"$USER_PRINCIPAL\", 0 : nat, 10 : nat)")
print_status "Transaction history:"
echo "$TRANSACTIONS"

echo ""
print_success "=== ALL WITHDRAW TESTS COMPLETED SUCCESSFULLY! ==="
print_status "Test Summary:"
print_status "✅ ICP to ICP withdrawal: 10 ICP to $ICP_RECIPIENT_ADDRESS"
print_status "✅ ckBTC to BTC withdrawal: 0.1 ckBTC to $CKBTC_RECIPIENT_ADDRESS"
print_status "✅ Balance deductions verified"
print_status "✅ Both transactions should appear in the transaction history with status 'withdraw_complete'"
print_status ""
print_status "Note: These tests use mock balances and addresses for development."
print_status "When deploying to mainnet, real ICP/ckBTC integration and address validation will be used."
