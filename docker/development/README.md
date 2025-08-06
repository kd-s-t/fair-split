# Development Environment

This directory contains Docker configuration for development deployment.

## Usage

```bash
# From project root
cd docker/development

# Start development environment
docker compose up -d safesplit-development

# View logs
docker compose logs -f safesplit-development

# Stop
docker compose down
```

## Features

- **Production-like** environment
- **Read-only** source mounting
- **Uses `start.sh`** for proper startup
- **Port**: 3001:3000
- **Environment**: Development

## Access

- **Local**: http://localhost:3001
- **Network**: http://172.17.0.2:3000 