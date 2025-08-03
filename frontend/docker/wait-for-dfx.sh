#!/bin/bash

# Wait for DFX replica to be ready
set -e

echo "⏳ Waiting for DFX replica to be ready..."

# Extract host and port from DFX_HOST
DFX_HOST=${NEXT_PUBLIC_DFX_HOST:-http://localhost:4943}

# Parse host and port
if [[ "$DFX_HOST" =~ ^(https?://)([^:]+):([0-9]+)$ ]]; then
    PROTOCOL="${BASH_REMATCH[1]}"
    HOST="${BASH_REMATCH[2]}"
    PORT="${BASH_REMATCH[3]}"
else
    echo "❌ Invalid DFX_HOST format: $DFX_HOST"
    exit 1
fi

# Set up PATH for official DFX installer
export PATH="$PATH:$HOME/.local/bin"

# Wait for DFX replica to be accessible
MAX_ATTEMPTS=30
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    echo "🔍 Attempt $ATTEMPT/$MAX_ATTEMPTS: Checking DFX replica at $DFX_HOST"
    
    # Try to connect to DFX replica
    if curl -f -s "$DFX_HOST" > /dev/null 2>&1; then
        echo "✅ DFX replica is ready at $DFX_HOST"
        exit 0
    fi
    
    echo "⏳ DFX replica not ready yet, waiting 10 seconds..."
    sleep 10
    ATTEMPT=$((ATTEMPT + 1))
done

echo "❌ DFX replica failed to start after $MAX_ATTEMPTS attempts"
echo "⚠️  Starting application anyway - canister calls may fail"
exit 0 