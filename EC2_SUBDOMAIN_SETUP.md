# EC2 Subdomain Configuration Guide

## How to Point EC2 Port 3000 to a Subdomain

This guide shows how to configure nginx to serve your frontend application (running on port 3000) through a custom subdomain.

### Prerequisites
- EC2 instance running Ubuntu
- Docker container running your frontend on port 3000
- Domain with DNS access (e.g., `thesplitsafe.com`)

### Step 1: DNS Configuration
Configure your domain's DNS records to point the subdomain to your EC2 IP:

```
Type: A
Name: app
Value: 34.193.29.93 (your EC2 public IP)
TTL: 600 seconds
```

This will make `app.thesplitsafe.com` resolve to your EC2 instance.

### Step 2: Install and Configure Nginx
```bash
# Install nginx
sudo apt update
sudo apt install -y nginx

# Create nginx site configuration
sudo tee /etc/nginx/sites-available/app.thesplitsafe.com > /dev/null << 'EOF'
server {
    listen 80;
    server_name app.thesplitsafe.com;

    # Frontend requests
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/app.thesplitsafe.com /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Start/reload nginx
sudo systemctl start nginx
sudo systemctl reload nginx
```

### Step 3: Verify Configuration
```bash
# Test locally
curl -I http://localhost

# Test domain
curl -I http://app.thesplitsafe.com
```

### Step 4: Access Your Application
Your frontend will now be accessible at:
- **HTTP**: `http://app.thesplitsafe.com`
- **Direct IP**: `http://34.193.29.93:3000`

### Troubleshooting

#### Connection Refused
Check if nginx is running:
```bash
sudo systemctl status nginx
```

#### Default Nginx Page Shows
Remove default site configuration:
```bash
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl reload nginx
```

#### HTTPS Redirects
- Use `http://` explicitly in browser
- Or configure SSL certificates with Let's Encrypt

#### Port Conflicts
If port 80 is already in use (e.g., by Caddy):
```bash
# Stop conflicting service
sudo systemctl stop caddy

# Start nginx
sudo systemctl start nginx
```

### Security Group Configuration
Ensure your EC2 security group allows:
- Port 80 (HTTP) - for nginx
- Port 3000 (Application) - for direct access
- Port 22 (SSH) - for management

### Multiple Subdomains
To configure additional subdomains (e.g., `staging.thesplitsafe.com`):

```bash
# Create configuration for staging
sudo tee /etc/nginx/sites-available/staging.thesplitsafe.com > /dev/null << 'EOF'
server {
    listen 80;
    server_name staging.thesplitsafe.com;

    # Frontend requests
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API requests to dfx replica
    location /api/ {
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Connection "";
        proxy_pass http://127.0.0.1:4943;
    }
}
EOF

# Enable staging site
sudo ln -s /etc/nginx/sites-available/staging.thesplitsafe.com /etc/nginx/sites-enabled/

# Reload nginx
sudo systemctl reload nginx
```

### SSL/HTTPS Setup (Optional)
For production, consider setting up SSL certificates:

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d app.thesplitsafe.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Useful Commands

#### Check Nginx Status
```bash
sudo systemctl status nginx
sudo nginx -t
```

#### View Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

#### Restart Services
```bash
sudo systemctl restart nginx
sudo systemctl restart docker
```

#### Check Port Usage
```bash
sudo lsof -i :80
sudo lsof -i :3000
```

### Example Configuration Files

#### Complete Nginx Configuration
```nginx
# /etc/nginx/sites-available/app.thesplitsafe.com
server {
    listen 80;
    server_name app.thesplitsafe.com;

    # Frontend requests
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (if needed)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

This configuration will successfully route traffic from `app.thesplitsafe.com` to your Docker container running on port 3000.

## DFX Local Network Deployment

### How to Run DFX and Deploy Canisters

This section covers how to set up and deploy Internet Computer canisters using dfx on your EC2 instance.

#### Prerequisites
- EC2 instance with dfx installed
- Docker container running your frontend on port 3000
- Nginx configured for domain routing

#### Step 1: Configure dfx.json
Ensure your `dfx.json` has the correct local network configuration:

```json
{
  "networks": {
    "local": {
      "bind": "localhost:4943",
      "type": "ephemeral"
    }
  }
}
```

#### Step 2: Start DFX in Background
```bash
# Start dfx in background (so it doesn't stop when you cancel commands)
nohup dfx start --background > dfx.log 2>&1 &

# Verify dfx is running
sudo lsof -i :4943
# Should show: pocket-ic process listening on localhost:4943
```

#### Step 3: Test DFX Connection
```bash
# Test if dfx is responding
dfx ping local

# Expected output:
# {
#   "replica_health_status": "healthy",
#   "root_key": [...]
# }
```

#### Step 4: Deploy Canisters
```bash
# Deploy specific canisters (skip frontend since it's in Docker)
dfx deploy --network local split_dapp

# The deployment will prompt for initialization arguments:
# Enter argument 1 of 2: [principal]
# Enter argument 2 of 2: [text]

# Get your current principal for initialization
dfx identity get-principal
# Example output: fchmh-gk5xj-2mf4u-bkqqu-vbcoy-kjn6g-3apii-cwaff-yycsa-5tdsn-dae

# Enter the principal when prompted
# For the second argument, enter: "ckbtc-minter-canister-id"

# Expected output:
# Installed code for canister split_dapp, with canister ID u6s2n-gx777-77774-qaaba-cai
# Deployed canisters.
# URLs:
#   Frontend canister via browser:
#     frontend: http://uxrrr-q7777-77774-qaaaq-cai.localhost:4943/
#   Backend canister via Candid interface:
#     split_dapp: http://umunu-kh777-77774-qaaca-cai.localhost:4943/?id=u6s2n-gx777-77774-qaaba-cai
```

#### Step 5: Verify Deployment
```bash
# Check canister status
dfx canister status --network local --all

# List deployed canisters
dfx canister list --network local
```

#### Step 6: Access Your Application
After deployment, your application will be accessible at:

- **Frontend**: `http://app.thesplitsafe.com` (via nginx → Docker container)
- **Direct DFX**: `http://localhost:4943` (direct access to dfx)

#### Step 7: Access Deployed Canisters
**Important**: The dfx replica only recognizes localhost domains, not custom domains.

**Correct Access Methods:**

1. **Direct Local Access (Works):**
   ```
   http://umunu-kh777-77774-qaaca-cai.localhost:4943/?id=u6s2n-gx777-77774-qaaba-cai
   ```

2. **Via Localhost (Works):**
   ```
   http://localhost:4943/?id=u6s2n-gx777-77774-qaaba-cai
   ```

3. **Via Custom Domain (Fixed with Host Header):**
   ```
   http://thesplitsafe.com/?id=u6s2n-gx777-77774-qaaba-cai
   ```
   ✅ Now works because nginx forces `Host: localhost` header

**Canister IDs:**
- **split_dapp**: `u6s2n-gx777-77774-qaaba-cai`
- **split_dapp_test**: `uzt4z-lp777-77774-qaabq-cai`
- **frontend**: `uxrrr-q7777-77774-qaaaq-cai`

**Test Canister:**
```bash
# Call a method on your canister
dfx canister call --network local split_dapp greet '("World")'
```

#### Step 8: Complete Custom Domain Setup (Recommended)
**Problem**: dfx local replica only recognizes `localhost` domains, causing "400 - unknown domain" errors.

**Solution**: Use proper nginx configuration with API routing:

**1. Restart dfx with proper host binding:**
```bash
dfx stop && dfx start --clean --host 0.0.0.0:4943 --background
```

**2. Update nginx configuration:**
```nginx
# /etc/nginx/sites-available/thesplitsafe.com
server {
    listen 80;
    server_name thesplitsafe.com;
    # server_name staging.thesplitsafe.com;

    # Your app (Next.js, etc.)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }

    # Proxy replica API to local dfx, but make it look like 'localhost' to the replica
    location ~ ^/api/(v2|v3)/ {
        proxy_http_version 1.1;
        proxy_set_header Host localhost;  # IMPORTANT
        proxy_set_header Connection "";
        proxy_pass http://127.0.0.1:4943/api/$1/;
    }
}
```

**3. Update frontend code:**
```typescript
// In your agent code:
const host = IS_LOCAL ? 'http://localhost:4943' : 'https://thesplitsafe.com'
await agent.fetchRootKey() // Always call this since using local replica

// Add crypto polyfill for Internet Computer
if (typeof window !== 'undefined' && !window.crypto) {
  const { webcrypto } = require('crypto')
  window.crypto = webcrypto
}
```

**4. Update Next.js config:**
```typescript
// next.config.ts
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false,
      stream: false,
      buffer: false,
    };
  }
  return config;
},
```

**Apply the fix:**
```bash
# Update nginx configuration
sudo nginx -t && sudo systemctl reload nginx
```

**Why this works**: 
- Frontend calls go to `/api/v2/...` or `/api/v3/...` (agent does this automatically)
- Nginx proxies these to localhost with correct Host header
- dfx replica thinks it's talking to localhost, so signatures match

**Important**: You cannot access canister URLs directly via custom domains like:
```
http://uxrrr-q7777-77774-qaaaq-cai.thesplitsafe.com/
```
This will show "ERR_NAME_NOT_RESOLVED" because:
- DNS doesn't exist for canister ID subdomains
- dfx local replica only recognizes localhost domains
- This is expected behavior, not an error

**Correct access methods:**
- ✅ Frontend: `http://app.thesplitsafe.com`
- ✅ Backend API: `https://thesplitsafe.com`
- ✅ Direct canister: `http://uxrrr-q7777-77774-qaaaq-cai.localhost:4943/`

#### Troubleshooting

##### DFX Won't Start
```bash
# Kill any existing processes on port 4943
sudo lsof -i :4943
sudo kill <PID>

# Start dfx again
nohup dfx start --background > dfx.log 2>&1 &
```

##### Port Conflicts
If PocketIC is already running:
```bash
# Stop PocketIC
sudo pkill -f pocket-ic

# Start dfx
nohup dfx start --background > dfx.log 2>&1 &
```

##### Build Failures
If frontend build fails (missing Node.js):
```bash
# Install Node.js dependencies (if needed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
npm install
```

##### Check DFX Logs
```bash
# View dfx startup logs
cat dfx.log

# Check dfx processes
ps aux | grep dfx
ps aux | grep pocket-ic
```

#### Useful Commands

##### Stop DFX
```bash
dfx stop
```

##### Restart DFX
```bash
dfx stop
nohup dfx start --background > dfx.log 2>&1 &
```

##### Check Canister Status
```bash
dfx canister status --network local split_dapp
dfx canister status --network local frontend
```

##### View Canister Logs
```bash
dfx canister call --network local split_dapp greet '("World")'
```

#### Complete Setup Summary

**Final Configuration:**
- ✅ **DFX**: Running on `localhost:4943` (background)
- ✅ **Nginx**: Proxying `thesplitsafe.com` → `127.0.0.1:4943`
- ✅ **Frontend**: Running on `app.thesplitsafe.com` → `127.0.0.1:3000`
- ✅ **Canisters**: Deployed to local network

**Access URLs:**
- Frontend: `http://app.thesplitsafe.com`
- DFX API: `http://thesplitsafe.com`
- Direct DFX: `http://localhost:4943`

This setup provides a complete local development environment with domain routing for both frontend and backend services.
