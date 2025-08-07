# SplitSafe Development Environment

This directory contains the Docker setup for the SplitSafe development environment.

## Architecture

The development environment consists of:
- **Next.js Application**: Runs on port 3000 with hot reloading
- **dfx (Internet Computer)**: Runs on port 4943 for local canister development
- **Shared Network**: Both services communicate via `safesplit-network`

## Services

### frontend
- Next.js application container
- Built from `docker/development/Dockerfile`
- Exposes port 3000 externally
- Uses development mode with hot reloading
- Depends on dfx service

### dfx
- Internet Computer development environment
- Built from `docker/local/Dockerfile.dfx`
- Exposes port 4943 externally
- Automatically starts dfx server and deploys canisters
- Provides local ICP network for testing

## Usage

### Start the development environment:
```bash
docker compose up --build
```

### Access the application:
- **Frontend**: http://localhost:3000
- **dfx**: http://localhost:4943

### Stop the environment:
```bash
docker compose down
```

### View logs:
```bash
docker compose logs -f
```

## Configuration

- Docker Compose: `docker-compose.yml`
- Frontend Dockerfile: `Dockerfile`
- dfx Dockerfile: `docker/local/Dockerfile.dfx`

## Network

Both services are connected via the `safesplit-network` bridge network, allowing the frontend to communicate with dfx using the service name `dfx`.

## Volumes

- `dfx_cache`: Persistent dfx cache
- `dfx_config`: Persistent dfx configuration 