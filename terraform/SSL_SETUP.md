# SSL Configuration with Terraform

This document explains how to configure SSL certificates for your SplitSafe application using Let's Encrypt and Terraform.

## Overview

The Terraform configuration now includes automatic SSL certificate generation using Let's Encrypt. This feature:

- Installs Certbot and the Nginx plugin during EC2 provisioning
- Creates proper Nginx configuration for your domains
- Generates SSL certificates automatically
- Sets up automatic renewal
- Creates a status check script for monitoring certificates

## Configuration

### 1. Enable SSL in terraform.tfvars

To enable SSL certificate generation, update your `terraform.tfvars` file:

```hcl
# SSL Configuration
enable_ssl = true
ssl_domains = ["thesplitsafe.com", "www.thesplitsafe.com"]
ssl_email = "admin@thesplitsafe.com"
```

### 2. Variables Explained

- `enable_ssl`: Set to `true` to enable automatic SSL certificate generation
- `ssl_domains`: List of domains for which to generate certificates
- `ssl_email`: Email address for Let's Encrypt notifications and account registration

### 3. Prerequisites

Before enabling SSL, ensure:

1. **DNS Configuration**: Your domain(s) must point to the EC2 instance's public IP
2. **Security Group**: Ports 80 and 443 must be open (already configured)
3. **Domain Ownership**: You must own the domains you're requesting certificates for

## Deployment

### First-time SSL Setup

1. Configure your `terraform.tfvars` with SSL settings
2. Run `terraform apply`
3. The EC2 instance will be created with SSL tools installed
4. SSL certificates will be automatically generated during provisioning

### Adding SSL to Existing Instance

If you have an existing instance without SSL:

1. Update your `terraform.tfvars` to enable SSL
2. Run `terraform apply` - this will trigger the SSL setup provisioner
3. The SSL certificates will be generated on the existing instance

## Monitoring and Management

### Check SSL Status

SSH into your instance and run:

```bash
sudo /usr/local/bin/check-ssl-status.sh
```

This script shows:
- Current certificate status
- Expiry dates
- Next renewal schedule

### Manual Certificate Renewal

To manually renew certificates:

```bash
sudo certbot renew
```

### View Certificate Details

```bash
sudo certbot certificates
```

## Troubleshooting

### Certificate Generation Fails

If SSL certificate generation fails during provisioning:

1. Check DNS configuration - domains must resolve to the EC2 IP
2. Verify ports 80 and 443 are open in the security group
3. SSH into the instance and run manually:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com --non-interactive --agree-tos --email your-email@domain.com
   ```

### Nginx Configuration Issues

If Nginx fails to reload:

```bash
sudo nginx -t  # Test configuration
sudo systemctl status nginx  # Check service status
```

### Let's Encrypt Rate Limits

Let's Encrypt has rate limits. If you hit them:

1. Wait before retrying (usually 1 hour)
2. Check the rate limit status: https://letsencrypt.org/docs/rate-limits/

## Security Considerations

- Certificates are automatically renewed by Certbot
- Private keys are stored securely on the instance
- HTTP traffic is automatically redirected to HTTPS
- Certificates expire after 90 days but auto-renew at 60 days

## Example Configuration

Complete `terraform.tfvars` example with SSL enabled:

```hcl
aws_region = "us-east-1"
ami_id = "ami-0c7217cdde317cfec"
instance_type = "t3.micro"
public_key_path = "/path/to/public/key.pub"
private_key_path = "/path/to/private/key"
repo_url = "https://github.com/your-username/safesplit.git"
environment = "production"

# SSL Configuration
enable_ssl = true
ssl_domains = ["thesplitsafe.com", "www.thesplitsafe.com"]
ssl_email = "admin@thesplitsafe.com"
```

## Notes

- SSL setup is optional and disabled by default
- The SSL provisioner uses `on_failure = continue` to prevent deployment failures
- Certificates are generated using the Nginx plugin for automatic configuration
- All SSL tools and scripts are installed during the initial EC2 setup
