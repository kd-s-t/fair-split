#!/bin/bash

# Docker Local Development Script
# Uses modern 'docker compose' syntax (no hyphen)

set -e

echo "🐳 SafeSplit Local Docker Development"
echo "====================================="

case "${1:-up}" in
  "up")
    echo "🚀 Starting SafeSplit local development environment..."
    
    # Check if DFX is running
    if ! lsof -i :4943 > /dev/null 2>&1; then
      echo "🔧 Starting DFX replica..."
      dfx start --background --clean
      sleep 3
    else
      echo "✅ DFX replica already running on port 4943"
    fi
    
    docker compose -f docker/local/docker-compose.yml up --build -d
    echo "✅ Services started!"
    echo "📱 Frontend: http://localhost:3000"
    echo "🔗 DFX Replica: http://localhost:4943"
    echo "📊 DFX Dashboard: http://localhost:8000"
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
    dfx deploy split_dapp
    echo "✅ Canisters deployed!"
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