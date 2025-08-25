# EC2 Module
# Handles EC2 instance and basic setup for SplitSafe application
# 
# This module creates:
# - EC2 instance with Ubuntu 22.04 LTS
# - IAM roles and policies for ECR access
# - Security groups for network access
# - SSH key pair for secure access
# - Elastic IP for consistent addressing
# - Parameter Store parameters for environment variables
# - User data script for instance initialization

# =============================================================================
# LOCALS & DATA SOURCES
# =============================================================================

# Ubuntu 22.04 LTS AMI - using a reliable AMI ID
# ami-0c7217cdde317cfec (Ubuntu 22.04 LTS in us-east-1)
# If this doesn't work, find your region's AMI at: https://cloud-images.ubuntu.com/locator/ec2/
locals {
  ubuntu_ami_id = "ami-0c7217cdde317cfec" # Ubuntu 22.04 LTS us-east-1
}

# =============================================================================
# ELASTIC IP
# =============================================================================

# Create Elastic IP for consistent IP address
resource "aws_eip" "splitsafe_eip" {
  instance = aws_instance.splitsafe_server.id
  domain   = "vpc"
  
  tags = {
    Name = "splitsafe-eip-${var.environment}"
    Project = "SplitSafe"
    Environment = var.environment
  }
}

# =============================================================================
# EC2 INSTANCE
# =============================================================================

# Main EC2 instance
resource "aws_instance" "splitsafe_server" {
  ami                    = local.ubuntu_ami_id
  instance_type          = var.instance_type
  key_name              = var.key_pair_name
  vpc_security_group_ids = [var.security_group_id]
  iam_instance_profile   = var.instance_profile_name

  # Root volume configuration
  root_block_device {
    volume_size = 30
    volume_type = "gp3"
    encrypted   = true
  }

  tags = {
    Name = "splitsafe-server-${var.environment}"
    Project = "SplitSafe"
    Environment = var.environment
  }

  # User data script for instance initialization
  provisioner "remote-exec" {
    on_failure = fail

    connection {
      type        = "ssh"
      user        = "ubuntu"
      private_key = var.private_key_content
      host        = self.public_ip
      timeout     = "30m"
    }

    inline = [
      "echo '======================================================================================'",
      "echo '🚀 SplitSafe EC2 Instance Setup (Ubuntu)'",
      "echo '======================================================================================'",
      "echo 'Disabling automatic updates to speed up provisioning...'",
      "sudo systemctl disable unattended-upgrades",
      "sudo systemctl stop unattended-upgrades",
      "echo 'Updating OS and installing dependencies...'",
      "sudo apt update -qq",
      "sudo apt install -y git curl wget unzip",
      "echo '✅ System packages installed'",
      "echo '======================================================================================'",
      "echo 'Installing Docker...'",
      "sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release",
      "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg",
      "echo \"deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable\" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null",
      "sudo apt update -qq",
      "sudo apt install -y docker-ce docker-ce-cli containerd.io || exit 1",
      "sudo systemctl start docker",
      "sudo systemctl enable docker",
      "sudo systemctl status docker --no-pager || exit 1",
      "sudo usermod -aG docker ubuntu",
      "echo '✅ Docker installed and configured'",
      "echo '======================================================================================'",
      "echo 'Installing Docker Compose...'",
      "mkdir -p ~/.docker/cli-plugins/",
      "curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose",
      "chmod +x ~/.docker/cli-plugins/docker-compose",
      "docker compose version || exit 1",
      "echo '✅ Docker Compose installed'",
      "echo '======================================================================================'",
      "echo 'Installing AWS CLI...'",
      "curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'",
      "unzip awscliv2.zip",
      "sudo ./aws/install",
      "rm -rf aws awscliv2.zip",
      "aws --version || exit 1",
      "echo '✅ AWS CLI installed'",
      "echo '======================================================================================'",
      "echo 'Installing Node.js and npm...'",
      "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -",
      "sudo apt install -y nodejs",
      "node --version || exit 1",
      "npm --version || exit 1",
      "echo '✅ Node.js and npm installed'",
      "echo '======================================================================================'",
      "echo 'Installing PM2...'",
      "sudo npm install -g pm2",
      "pm2 --version || exit 1",
      "echo '✅ PM2 installed'",
      "echo '======================================================================================'",
      "echo 'Installing basic web server (for monitoring)...'",
      "sudo apt install -y nginx",
      "sudo systemctl enable nginx",
      "sudo systemctl start nginx",
      "echo '✅ Nginx installed for basic monitoring'",
      "echo '======================================================================================'",
      "echo 'Installing SSL tools...'",
      "sudo apt install -y certbot python3-certbot-nginx",
      "echo '✅ SSL tools installed'",
      "echo '======================================================================================'",
      "echo 'All services will be managed by Docker containers'",
      "echo '======================================================================================'",
      "echo 'Installing additional tools...'",
      "sudo apt install -y htop fail2ban",
      "sudo systemctl start fail2ban",
      "sudo systemctl enable fail2ban",
      "echo '✅ Additional tools installed'",
      "echo '======================================================================================'",
      "echo '📦 Repository will be managed by Docker containers'",
      "echo '======================================================================================'",
      "echo '✅ Setup complete!'",
      "echo \"🐳 Docker and Docker Compose installed\"",
      "echo \"🔧 AWS CLI installed\"",
      "echo \"📦 Node.js and npm installed\"",
      "echo \"📦 PM2 process manager installed\"",
      "echo \"🔒 Fail2ban security installed\"",
      "echo \"📊 htop monitoring tool installed\"",
      "echo \"🔒 SSL tools (certbot) installed\"",
      "echo \"🔗 All services will be managed by Docker containers\"",
      "echo '======================================================================================'"
    ]
  }

  # SSL Setup provisioner (runs after initial setup)
  provisioner "remote-exec" {
    on_failure = continue  # Don't fail the entire deployment if SSL setup fails

    connection {
      type        = "ssh"
      user        = "ubuntu"
      private_key = var.private_key_content
      host        = self.public_ip
      timeout     = "10m"
    }

    inline = concat([
      "echo '======================================================================================'",
      "echo '🔒 SSL Certificate Setup'",
      "echo '======================================================================================'",
      "echo 'Checking if SSL setup is enabled...'"
    ], 
    var.enable_ssl ? [
      "echo 'SSL setup is enabled for domains: ${join(\", \", var.ssl_domains)}'",
      "echo 'Creating Nginx configuration for SSL domains...'",
      "sudo tee /etc/nginx/sites-available/ssl-domains > /dev/null << 'NGINX_EOF'",
      "server {",
      "    listen 80;",
      "    server_name ${join(\" \", var.ssl_domains)};",
      "    ",
      "    location / {",
      "        proxy_pass http://localhost:3000;",
      "        proxy_http_version 1.1;",
      "        proxy_set_header Upgrade \\$http_upgrade;",
      "        proxy_set_header Connection \"upgrade\";",
      "        proxy_set_header Host \\$host;",
      "        proxy_set_header X-Real-IP \\$remote_addr;",
      "        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;",
      "        proxy_set_header X-Forwarded-Proto \\$scheme;",
      "        proxy_cache_bypass \\$http_upgrade;",
      "    }",
      "    ",
      "    location /health {",
      "        access_log off;",
      "        return 200 \"healthy\\n\";",
      "        add_header Content-Type text/plain;",
      "    }",
      "}",
      "NGINX_EOF",
      "sudo ln -sf /etc/nginx/sites-available/ssl-domains /etc/nginx/sites-enabled/",
      "sudo nginx -t && sudo systemctl reload nginx",
      "echo '✅ Nginx configuration created'",
      "echo '======================================================================================'",
      "echo 'Generating SSL certificates with Let\\'s Encrypt...'",
      "sudo certbot --nginx -d ${join(\" -d \", var.ssl_domains)} --non-interactive --agree-tos --email ${var.ssl_email} || echo '⚠️ SSL certificate generation failed - this can be retried manually'",
      "echo '✅ SSL setup completed'",
      "echo '======================================================================================'",
      "echo 'Creating SSL status check script...'",
      "sudo tee /usr/local/bin/check-ssl-status.sh > /dev/null << 'SCRIPT_EOF'",
      "#!/bin/bash",
      "echo \"SSL Certificate Status:\"",
      "sudo certbot certificates",
      "echo \"\"",
      "echo \"Next renewal check:\"",
      "sudo systemctl list-timers certbot.timer",
      "echo \"\"",
      "echo \"Certificate expiry check:\"",
      "sudo certbot certificates | grep \"Expiry Date\"",
      "SCRIPT_EOF",
      "sudo chmod +x /usr/local/bin/check-ssl-status.sh",
      "echo '✅ SSL status check script created'"
    ] : [
      "echo 'SSL setup is disabled - skipping SSL configuration'",
      "echo 'To enable SSL later, run: terraform apply with enable_ssl = true'"
    ], [
      "echo '======================================================================================'",
      "echo '✅ SSL setup phase completed!'",
      "echo '======================================================================================'"
    ])
  }

  # Removed Dockerized dfx setup; we run dfx natively on the host now
} 