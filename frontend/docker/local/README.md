# Local Development Environment

This directory contains Docker configuration for local development.

## Usage

```bash
# From project root
cd frontend/docker/local

# Start local development
docker compose up -d splitsafe-local

# View logs
docker compose logs -f splitsafe-local

# Stop
docker compose down
```

## Features

- **Hot reloading** with `npm run dev`
- **Full source mounting** for live code changes
- **Development tools** (vim, nano, htop, procps)
- **Port**: 3000:3000
- **Environment**: Development

## Access

- **Local**: http://localhost:3000
- **Network**: http://172.17.0.2:3000 