# SSL Setup Guide for SplitSafe EC2 Instance

This guide covers how to set up SSL certificates for your SplitSafe application running on an EC2 instance, including both manual setup and automated Terraform configuration.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Manual SSL Setup](#manual-ssl-setup)
4. [Automated SSL Setup with Terraform](#automated-ssl-setup-with-terraform)
5. [Verification and Testing](#verification-and-testing)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)
8. [Security Considerations](#security-considerations)

## Overview

SSL (Secure Sockets Layer) certificates encrypt the communication between your users' browsers and your web server, ensuring data security and building user trust. This guide covers setting up SSL using Let's Encrypt, a free certificate authority.

### What We'll Accomplish

- Install Certbot and Nginx plugin
- Configure Nginx for SSL domains
- Generate Let's Encrypt SSL certificates
- Set up automatic renewal
- Create monitoring scripts
- Integrate SSL setup into Terraform automation

## Prerequisites

Before setting up SSL, ensure you have:

1. **Domain Ownership**: You must own the domain(s) you're requesting certificates for
2. **DNS Configuration**: Your domain(s) must point to your EC2 instance's public IP
3. **EC2 Instance**: Ubuntu 22.04 LTS instance running
4. **Security Group**: Ports 80 and 443 must be open
5. **SSH Access**: Ability to connect to your EC2 instance

### DNS Configuration

Ensure your domain DNS records point to your EC2 instance:

```bash
# Check if your domain resolves to your EC2 IP
nslookup thesplitsafe.com
dig thesplitsafe.com
```

Your domain should resolve to your EC2 instance's public IP (e.g., `100.26.39.95`).

## Manual SSL Setup

### Step 1: Connect to Your EC2 Instance

```bash
# Use your private key to connect
chmod 600 terraform/modules/security/splitsafe-key-development.pem
ssh -i terraform/modules/security/splitsafe-key-development.pem ubuntu@100.26.39.95
```

### Step 2: Install Certbot and Nginx Plugin

```bash
# Update package list
sudo apt update

# Install Certbot and Nginx plugin
sudo apt install -y certbot python3-certbot-nginx
```

### Step 3: Configure Nginx for Your Domain

Create a Nginx configuration file for your domain:

```bash
sudo tee /etc/nginx/sites-available/thesplitsafe.com > /dev/null << 'EOF'
server {
    listen 80;
    server_name thesplitsafe.com www.thesplitsafe.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF
```

Enable the site and test configuration:

```bash
# Enable the site
sudo ln -sf /etc/nginx/sites-available/thesplitsafe.com /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 4: Generate SSL Certificates

```bash
# Generate certificates for both domain and www subdomain
sudo certbot --nginx -d thesplitsafe.com -d www.thesplitsafe.com --non-interactive --agree-tos --email admin@thesplitsafe.com
```

### Step 5: Create SSL Status Check Script

```bash
sudo tee /usr/local/bin/check-ssl-status.sh > /dev/null << 'EOF'
#!/bin/bash
echo "SSL Certificate Status:"
sudo certbot certificates
echo ""
echo "Next renewal check:"
sudo systemctl list-timers certbot.timer
echo ""
echo "Certificate expiry check:"
sudo certbot certificates | grep "Expiry Date"
EOF

sudo chmod +x /usr/local/bin/check-ssl-status.sh
```

## Automated SSL Setup with Terraform

### Overview

The Terraform configuration now includes automatic SSL setup that:

- Installs Certbot during EC2 provisioning
- Creates Nginx configuration automatically
- Generates SSL certificates during deployment
- Sets up automatic renewal
- Creates monitoring scripts

### Configuration

#### 1. Update terraform.tfvars

```hcl
# SSL Configuration
enable_ssl = true
ssl_domains = ["thesplitsafe.com", "www.thesplitsafe.com"]
ssl_email = "admin@thesplitsafe.com"
```

#### 2. Deploy with SSL

```bash
# Apply Terraform configuration with SSL enabled
terraform apply
```

The EC2 instance will be created with SSL automatically configured.

### Terraform Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `enable_ssl` | Enable SSL certificate generation | `false` | No |
| `ssl_domains` | List of domains for certificates | `[]` | No |
| `ssl_email` | Email for Let's Encrypt notifications | `admin@thesplitsafe.com` | No |

### Files Modified

The following Terraform files were updated to support SSL:

- `terraform/modules/ec2/variables.tf` - Added SSL variables
- `terraform/modules/ec2/main.tf` - Added SSL provisioner
- `terraform/main.tf` - Passes SSL variables to EC2 module
- `terraform/variables.tf` - Added SSL configuration variables
- `terraform/terraform.tfvars.example` - Added SSL configuration examples
- `terraform/SSL_SETUP.md` - Detailed SSL documentation

## Verification and Testing

### Test SSL Certificate

```bash
# Test HTTPS access
curl -I https://thesplitsafe.com
curl -I https://www.thesplitsafe.com

# Test HTTP to HTTPS redirect
curl -I http://thesplitsafe.com
```

### Check Certificate Details

```bash
# View certificate information
openssl s_client -connect thesplitsafe.com:443 -servername thesplitsafe.com < /dev/null 2>/dev/null | openssl x509 -noout -dates

# Check certificate status
sudo certbot certificates
```

### Verify Nginx Configuration

```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx
```

## Monitoring and Maintenance

### SSL Status Monitoring

```bash
# Run the SSL status check script
sudo /usr/local/bin/check-ssl-status.sh
```

### Certificate Renewal

Certificates automatically renew, but you can manually renew:

```bash
# Test renewal (dry run)
sudo certbot renew --dry-run

# Manual renewal
sudo certbot renew
```

### Monitoring Commands

```bash
# Check certificate expiry
sudo certbot certificates | grep "Expiry Date"

# Check renewal timer
sudo systemctl list-timers certbot.timer

# View Certbot logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

## Troubleshooting

### Common Issues

#### 1. Certificate Generation Fails

**Symptoms**: Certbot fails with domain validation errors

**Solutions**:
```bash
# Check DNS resolution
nslookup thesplitsafe.com
dig thesplitsafe.com

# Verify ports are open
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# Check Nginx is running
sudo systemctl status nginx
```

#### 2. Nginx Configuration Errors

**Symptoms**: `nginx -t` fails

**Solutions**:
```bash
# Check Nginx configuration syntax
sudo nginx -t

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

#### 3. Let's Encrypt Rate Limits

**Symptoms**: "Too many requests" errors

**Solutions**:
- Wait before retrying (usually 1 hour)
- Check rate limit status: https://letsencrypt.org/docs/rate-limits/
- Use staging environment for testing: `--staging` flag

#### 4. Terraform SSL Provisioner Fails

**Symptoms**: SSL setup fails during Terraform apply

**Solutions**:
```bash
# SSH into instance and run manually
ssh -i terraform/modules/security/splitsafe-key-development.pem ubuntu@100.26.39.95

# Run SSL setup manually
sudo certbot --nginx -d thesplitsafe.com -d www.thesplitsafe.com --non-interactive --agree-tos --email admin@thesplitsafe.com
```

### Debug Commands

```bash
# Check Certbot logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check system logs
sudo journalctl -u nginx -f
sudo journalctl -u certbot.timer -f
```

## Security Considerations

### Certificate Security

- **Automatic Renewal**: Certificates auto-renew at 60 days (expire at 90 days)
- **Private Key Storage**: Keys stored securely in `/etc/letsencrypt/live/`
- **Access Control**: Only root can access certificate files

### Best Practices

1. **Regular Monitoring**: Check certificate status monthly
2. **Backup Configuration**: Backup Nginx and SSL configurations
3. **Security Updates**: Keep Certbot and Nginx updated
4. **Firewall Rules**: Ensure only necessary ports are open

### Security Commands

```bash
# Check certificate file permissions
ls -la /etc/letsencrypt/live/thesplitsafe.com/

# Verify SSL configuration
sudo nginx -t

# Check for security vulnerabilities
sudo apt list --upgradable | grep -E "(nginx|certbot)"
```

## Example Commands Summary

### Quick SSL Setup (Manual)

```bash
# 1. Connect to instance
ssh -i terraform/modules/security/splitsafe-key-development.pem ubuntu@100.26.39.95

# 2. Install Certbot
sudo apt update && sudo apt install -y certbot python3-certbot-nginx

# 3. Generate certificates
sudo certbot --nginx -d thesplitsafe.com -d www.thesplitsafe.com --non-interactive --agree-tos --email admin@thesplitsafe.com

# 4. Verify setup
curl -I https://thesplitsafe.com
sudo /usr/local/bin/check-ssl-status.sh
```

### Quick SSL Setup (Terraform)

```bash
# 1. Enable SSL in terraform.tfvars
echo 'enable_ssl = true' >> terraform/terraform.tfvars
echo 'ssl_domains = ["thesplitsafe.com", "www.thesplitsafe.com"]' >> terraform/terraform.tfvars

# 2. Apply configuration
terraform apply

# 3. Verify setup
curl -I https://thesplitsafe.com
```

## Additional Resources

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Certbot User Guide](https://certbot.eff.org/docs/)
- [Nginx SSL Configuration](https://nginx.org/en/docs/http/configuring_https_servers.html)
- [Terraform SSL Setup Documentation](terraform/SSL_SETUP.md)

---

**Note**: This guide covers the SSL setup for SplitSafe running on EC2. For production deployments, consider additional security measures such as HSTS headers, security headers, and regular security audits.
