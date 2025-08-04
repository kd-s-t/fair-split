# Staging Environment

This directory contains Docker configuration for staging deployment.

## Usage

```bash
# From project root
cd frontend/docker/stage

# Start staging environment
docker compose up -d splitsafe-staging

# View logs
docker compose logs -f splitsafe-staging

# Stop
docker compose down
```

## Features

- **Production-like** environment
- **Read-only** source mounting
- **Uses `start.sh`** for proper startup
- **Port**: 3001:3000
- **Environment**: Staging

## Access

- **Local**: http://localhost:3001
- **Network**: http://172.17.0.2:3000 