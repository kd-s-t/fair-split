# Docker Setup for SplitSafe

This directory contains all Docker-related files for the SplitSafe application.

## Files

- **`Dockerfile`** - Multi-stage production build
- **`Dockerfile.dev`** - Development build with hot reloading
- **`docker-compose.yml`** - Orchestration for both environments
- **`.dockerignore`** - Optimizes build context
- **`DOCKER.md`** - Complete documentation

## Quick Start

### Production
```bash
docker-compose -f frontend/docker/docker-compose.yml up --build
```

### Development
```bash
docker-compose -f frontend/docker/docker-compose.yml --profile dev up --build
```

### Manual Build
```bash
# Production
docker build -f frontend/docker/Dockerfile -t splitsafe:latest .

# Development
docker build -f frontend/docker/Dockerfile.dev -t splitsafe:dev .
```

## Usage

See `DOCKER.md` for complete documentation and usage instructions. 