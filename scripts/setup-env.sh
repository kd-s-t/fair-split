#!/bin/bash

# SplitSafe Environment Setup Script
echo "🚀 Setting up SplitSafe environment variables..."

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Backing up to .env.local.backup"
    cp .env.local .env.local.backup
fi

# Create .env.local from example
if [ -f "env.example" ]; then
    cp env.example .env.local
    echo "✅ Created .env.local from env.example"
else
    echo "❌ env.example not found. Creating basic .env.local..."
    cat > .env.local << EOF
# SplitSafe Environment Variables
# OpenAI API Configuration (Required for GPT-3.5 messaging system)
# Get your API key from: https://platform.openai.com/api-keys
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here

# Internet Computer (ICP) Configuration
NEXT_PUBLIC_INTERNET_IDENTITY_URL=https://identity.ic0.app
NEXT_PUBLIC_IC_HOST=https://ic0.app

# SplitSafe Canister Configuration
NEXT_PUBLIC_SPLIT_DAPP_CANISTER_ID=your_canister_id_here

# Development Configuration
NODE_ENV=development
EOF
fi

echo ""
echo "📝 Next steps:"
echo "1. Edit .env.local and add your OpenAI API key"
echo "2. Get your API key from: https://platform.openai.com/api-keys"
echo "3. Update other variables as needed"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "🔧 The messaging system will work without the API key, but will show a configuration error message." 