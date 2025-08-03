# Security Module
# Handles security groups, key pairs, and access controls

resource "aws_key_pair" "splitsafe_key" {
  key_name   = "splitsafe-key-${var.environment}"
  public_key = file(var.public_key_path)
}

resource "aws_security_group" "splitsafe_sg" {
  name_prefix = "splitsafe-sg-${var.environment}-"
  description = "Security group for SplitSafe ${var.environment} application"
  
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP access"
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Next.js application"
  }

  ingress {
    from_port   = 4943
    to_port     = 4943
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "DFX local replica (ICP development)"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = {
    Name = "splitsafe-security-group-${var.environment}"
    Environment = var.environment
  }
} 