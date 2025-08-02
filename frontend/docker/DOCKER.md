# SplitSafe Docker Setup

This document explains how to build and run SplitSafe using Docker.

## Prerequisites

- Docker
- Docker Compose

## Quick Start

### Production Build

```bash
# Build and run the production container
docker-compose up --build

# Or build and run in detached mode
docker-compose up --build -d
```

### Development Build

```bash
# Build and run the development container with hot reloading
docker-compose --profile dev up --build
```

## Manual Docker Commands

### Build the Production Image

```bash
docker build -f frontend/docker/Dockerfile -t splitsafe:latest .
```

### Run the Production Container

```bash
docker run -p 3000:3000 -p 8080:8080 splitsafe:latest
```

### Build the Development Image

```bash
docker build -f frontend/docker/Dockerfile.dev -t splitsafe:dev .
```

### Run the Development Container

```bash
docker run -p 3001:3000 -v $(pwd)/frontend:/app/frontend -v $(pwd)/backend:/app/backend splitsafe:dev
```

## Docker Compose Services

### Production Service (`splitsafe`)
- **Ports**: 3000 (frontend), 8080 (backend)
- **Environment**: Production
- **Health Check**: Enabled
- **Restart Policy**: Unless stopped

### Development Service (`splitsafe-dev`)
- **Ports**: 3001 (frontend)
- **Environment**: Development
- **Hot Reloading**: Enabled
- **Volume Mounts**: Source code mounted for live updates

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Node.js environment | `production` |
| `PORT` | Frontend port | `3000` |
| `DFX_VERSION` | DFINITY SDK version | `0.20.2` |

## Health Check

The application includes a health check that runs every 30 seconds:

```bash
curl -f http://localhost:3000/api/health
```

## Building for Different Environments

### Local Development

```bash
# Start development environment
docker-compose --profile dev up --build

# Access the application
open http://localhost:3001
```

### Production Deployment

```bash
# Build and start production environment
docker-compose up --build -d

# Access the application
open http://localhost:3000
```

### Staging Environment

```bash
# Build with staging configuration
docker build -f frontend/docker/Dockerfile --build-arg NODE_ENV=staging -t splitsafe:staging .

# Run staging container
docker run -p 3000:3000 -e NODE_ENV=staging splitsafe:staging
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   
   # Kill the process or use a different port
   docker run -p 3001:3000 splitsafe:latest
   ```

2. **Build fails due to memory**
   ```bash
   # Increase Docker memory limit
docker build -f frontend/docker/Dockerfile --memory=4g -t splitsafe:latest .
   ```

3. **Permission issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### Logs

```bash
# View container logs
docker-compose logs -f splitsafe

# View specific service logs
docker-compose logs -f splitsafe-dev
```

### Shell Access

```bash
# Access running container
docker-compose exec splitsafe bash

# Access development container
docker-compose exec splitsafe-dev bash
```

## Multi-Architecture Build

For ARM64 (Apple Silicon) and AMD64:

```bash
# Build for multiple architectures
docker buildx build -f frontend/docker/Dockerfile --platform linux/amd64,linux/arm64 -t splitsafe:latest .
```

## Security Considerations

- The container runs as a non-root user (`appuser`)
- Production builds exclude development dependencies
- Health checks monitor application status
- Environment variables are properly configured

## Performance Optimization

- Multi-stage builds reduce final image size
- Layer caching optimizes build times
- Production builds exclude unnecessary files
- Health checks ensure application availability 