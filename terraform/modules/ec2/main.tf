# EC2 Module
# Handles EC2 instance and basic setup

# Ubuntu 22.04 LTS AMI - using a reliable AMI ID
# ami-0c7217cdde317cfec (Ubuntu 22.04 LTS in us-east-1)
# If this doesn't work, find your region's AMI at: https://cloud-images.ubuntu.com/locator/ec2/
locals {
  ubuntu_ami_id = "ami-0c7217cdde317cfec" # Ubuntu 22.04 LTS us-east-1
}

# IAM Role for EC2 to access ECR
resource "aws_iam_role" "ec2_role" {
  name = "splitsafe-ec2-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "splitsafe-ec2-role-${var.environment}"
    Environment = var.environment
    Project     = "SplitSafe"
  }
}

# IAM Policy for ECR access
resource "aws_iam_role_policy" "ecr_policy" {
  name = "splitsafe-ecr-policy-${var.environment}"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ]
        Resource = "*"
      }
    ]
  })
}

# Instance Profile
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "splitsafe-ec2-profile-${var.environment}"
  role = aws_iam_role.ec2_role.name
}

# Create a default security group
resource "aws_security_group" "splitsafe_sg" {
  name        = "splitsafe-sg-${var.environment}"
  description = "Security group for SplitSafe EC2 instance"

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Custom port 3000"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

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

# Create a key pair
resource "aws_key_pair" "splitsafe_key" {
  key_name   = "splitsafe-key-${var.environment}"
  public_key = file(var.public_key_path)

  tags = {
    Name = "splitsafe-key-${var.environment}"
    Project = "SplitSafe"
    Environment = var.environment
  }
}

resource "aws_instance" "splitsafe_server" {
  ami                    = local.ubuntu_ami_id
  instance_type          = var.instance_type
  key_name              = aws_key_pair.splitsafe_key.key_name
  vpc_security_group_ids = [aws_security_group.splitsafe_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

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

  provisioner "remote-exec" {
    on_failure = continue

    connection {
      type        = "ssh"
      user        = "ubuntu"
      private_key = file(var.private_key_path)
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
      "sudo apt install -y docker-ce docker-ce-cli containerd.io",
      "sudo systemctl start docker",
      "sudo systemctl enable docker",
      "sudo usermod -aG docker ubuntu",
      "echo '✅ Docker installed and configured'",
      "echo '======================================================================================'",
      "echo 'Installing Docker Compose...'",
      "mkdir -p ~/.docker/cli-plugins/",
      "curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose",
      "chmod +x ~/.docker/cli-plugins/docker-compose",
      "docker compose version",
      "echo '✅ Docker Compose installed'",
      "echo '======================================================================================'",
      "echo 'Installing AWS CLI...'",
      "curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'",
      "unzip awscliv2.zip",
      "sudo ./aws/install",
      "rm -rf aws awscliv2.zip",
      "aws --version",
      "echo '✅ AWS CLI installed'",
      "echo '======================================================================================'",
      "echo '📦 Cloning SplitSafe repository...'",
      "cd ~",
      "if [ -d splitsafe ]; then",
      "  echo 'Repository exists, updating...'",
      "  cd splitsafe && git pull",
      "else",
      "  echo 'Cloning new repository...'",
      "  git clone ${var.repo_url} splitsafe && cd splitsafe",
      "fi",
      "echo '✅ Repository ready'",
      "echo '======================================================================================'",
      "echo '✅ Setup complete!'",
      "echo \"📱 Repository cloned to: ~/splitsafe\"",
      "echo \"🐳 Docker and Docker Compose installed\"",
      "echo \"🔧 AWS CLI installed\"",
      "echo '======================================================================================'"
    ]
  }
} 