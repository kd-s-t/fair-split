#!/bin/bash

# Docker Local Development Script
# Uses modern 'docker compose' syntax (no hyphen)

set -e

echo "🐳 SafeSplit Local Docker Development"
echo "====================================="

case "${1:-up}" in
  "up")
    echo "🚀 Starting SafeSplit local development environment..."
    
    docker compose -f docker/local/docker-compose.yml up --build -d
    echo "✅ Services started!"
    echo "📱 Frontend: http://localhost:3000"
    echo "🔗 DFX Replica: http://localhost:4943"
    echo "📊 DFX Dashboard: http://localhost:8000"
    echo ""
    echo "💡 To deploy canisters, run: ./scripts/docker-local.sh deploy"
    ;;
  "down")
    echo "🛑 Stopping SafeSplit local development environment..."
    docker compose -f docker/local/docker-compose.yml down
    echo "✅ Services stopped!"
    ;;
  "logs")
    echo "📋 Showing logs..."
    docker compose -f docker/local/docker-compose.yml logs -f
    ;;
  "restart")
    echo "🔄 Restarting services..."
    docker compose -f docker/local/docker-compose.yml down
    docker compose -f docker/local/docker-compose.yml up --build -d
    echo "✅ Services restarted!"
    ;;
  "deploy")
    echo "🚀 Deploying canisters..."
    echo "⏳ Waiting for dfx to be ready..."
    sleep 5
    
    # Deploy canisters via dfx container
    echo "🔧 Deploying canisters..."
    ADMIN_PRINCIPAL=$(docker exec dfx dfx identity get-principal || docker exec dfx-development dfx identity get-principal)
    docker exec dfx sh -lc 'cd /app/icp && dfx deploy split_dapp --mode=reinstall --argument "(principal '"'"$ADMIN_PRINCIPAL'"'", \"ml52i-qqaaa-aaaar-qaabq-cai\")" -y' 2>/dev/null || \
    docker exec dfx-development sh -lc 'cd /app/icp && dfx deploy split_dapp --mode=reinstall --argument "(principal '"'"$ADMIN_PRINCIPAL'"'", \"ml52i-qqaaa-aaaar-qaabq-cai\")" -y'
    
    # Generate frontend bindings
    echo "🛠 Generating frontend bindings..."
    docker exec dfx sh -lc 'cd /app/icp && dfx generate split_dapp' 2>/dev/null || \
    docker exec dfx-development sh -lc 'cd /app/icp && dfx generate split_dapp'
    
    # Set initial balances
    echo "💰 Setting initial balances..."
    FRONTEND_PRINCIPAL="uu3ee-ff3xm-vhws5-zxy6q-vtsvx-q2uhy-4ligb-wcltn-dd6xn-bckkv-mqe"
    
    # Set initial ICP balance (0 ICP)
    docker exec dfx sh -lc 'cd /app/icp && dfx canister call split_dapp setInitialBalance "(principal \"'$FRONTEND_PRINCIPAL'\", 0, principal \"'$ADMIN_PRINCIPAL'\")"' 2>/dev/null || \
    docker exec dfx-development sh -lc 'cd /app/icp && dfx canister call split_dapp setInitialBalance "(principal \"'$FRONTEND_PRINCIPAL'\", 0, principal \"'$ADMIN_PRINCIPAL'\")"'
    
    # Set initial Bitcoin balance (10 BTC)
    docker exec dfx sh -lc 'cd /app/icp && dfx canister call split_dapp setBitcoinBalance "(principal \"'$ADMIN_PRINCIPAL'\", principal \"'$FRONTEND_PRINCIPAL'\", 1000000000)"' 2>/dev/null || \
    docker exec dfx-development sh -lc 'cd /app/icp && dfx canister call split_dapp setBitcoinBalance "(principal \"'$ADMIN_PRINCIPAL'\", principal \"'$FRONTEND_PRINCIPAL'\", 1000000000)"'
    
    # Bind Bitcoin address
    docker exec dfx sh -lc 'cd /app/icp && dfx canister call split_dapp setBitcoinAddress "(principal \"'$FRONTEND_PRINCIPAL'\", \"bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh\")"' 2>/dev/null || \
    docker exec dfx-development sh -lc 'cd /app/icp && dfx canister call split_dapp setBitcoinAddress "(principal \"'$FRONTEND_PRINCIPAL'\", \"bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh\")"'
    
    echo "✅ Canisters deployed and configured!"
    ;;
  "clean")
    echo "🧹 Cleaning up containers and volumes..."
    docker compose -f docker/local/docker-compose.yml down -v
    docker system prune -f
    echo "✅ Cleanup complete!"
    ;;
  *)
    echo "Usage: $0 [up|down|logs|restart|deploy|clean]"
    echo ""
    echo "Commands:"
    echo "  up      - Start services (default)"
    echo "  down    - Stop services"
    echo "  logs    - Show logs"
    echo "  restart - Restart services"
    echo "  deploy  - Deploy canisters"
    echo "  clean   - Clean up containers and volumes"
    ;;
esac 