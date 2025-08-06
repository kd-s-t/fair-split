# Security Module
# Handles security groups, key pairs, and access controls for SplitSafe application
# 
# This module manages:
# - SSH key pair generation and storage
# - Security group with comprehensive network rules
# - Network access controls for all application ports

# =============================================================================
# SSH KEY PAIR
# =============================================================================

# Generate SSH private key
resource "tls_private_key" "splitsafe_key" {
  algorithm = "ED25519"
  rsa_bits  = 4096
}

# Create AWS key pair
resource "aws_key_pair" "splitsafe_key" {
  key_name   = "splitsafe-key-${var.environment}"
  public_key = tls_private_key.splitsafe_key.public_key_openssh

  tags = {
    Name = "splitsafe-key-${var.environment}"
    Project = "SplitSafe"
    Environment = var.environment
  }
}

# Save private key to local file
resource "local_file" "private_key" {
  content  = tls_private_key.splitsafe_key.private_key_openssh
  filename = "${path.module}/splitsafe-key-${var.environment}.pem"
  file_permission = "0600"
}

# =============================================================================
# SECURITY GROUP
# =============================================================================

# Security group for EC2 instance
resource "aws_security_group" "splitsafe_sg" {
  name        = "splitsafe-sg-${var.environment}"
  description = "Security group for SplitSafe EC2 instance"

  # SSH access
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP access
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS access
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Application port
  ingress {
    description = "Custom port 3000"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # DFX port for Internet Computer
  ingress {
    description = "DFX port 4943"
    from_port   = 4943
    to_port     = 4943
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # All outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "splitsafe-sg-${var.environment}"
    Project = "SplitSafe"
    Environment = var.environment
  }
} 