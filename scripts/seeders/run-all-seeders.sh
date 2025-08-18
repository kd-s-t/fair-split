#!/bin/bash

echo "🌱 Running All Seeder Scripts"
echo "=============================="
echo ""

# Check if dfx is running
if ! dfx ping > /dev/null 2>&1; then
    echo "❌ DFX is not running. Please start dfx first: dfx start --background"
    exit 1
fi

# Make all scripts executable
chmod +x scripts/seeders/*.sh

echo "🚀 Starting seeder sequence..."
echo ""

# Run each seeder script
echo "1️⃣ Running: Initiate Escrow Only"
echo "--------------------------------"
./scripts/seeders/initiate-escrow-only.sh
echo ""

echo "2️⃣ Running: Initiate + Approve"
echo "-------------------------------"
./scripts/seeders/initiate-and-approve.sh
echo ""

echo "3️⃣ Running: Initiate + Decline"
echo "-------------------------------"
./scripts/seeders/initiate-and-decline.sh
echo ""

echo "4️⃣ Running: Initiate + Cancel"
echo "------------------------------"
./scripts/seeders/initiate-and-cancel.sh
echo ""

echo "✅ All seeder scripts completed!"
echo ""
echo "📊 Summary of created transactions:"
echo "   • 1 Pending escrow (waiting for approval)"
echo "   • 1 Approved escrow (ready for release)"
echo "   • 1 Declined escrow (funds returned)"
echo "   • 1 Canceled escrow (funds returned)"
echo ""
echo "🎉 Database seeded with test data!"
