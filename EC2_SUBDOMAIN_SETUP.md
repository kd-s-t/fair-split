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
