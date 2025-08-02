# EC2 Module
# Handles EC2 instance and application deployment

data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

resource "aws_instance" "splitsafe_server" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name              = var.key_pair_name
  vpc_security_group_ids = [var.security_group_id]

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
      user        = "ec2-user"
      private_key = file(var.private_key_path)
      host        = self.public_ip
    }

    inline = [
      "echo '======================================================================================'",
      "echo 'Updating OS and installing dependencies...'",
      "echo '======================================================================================'",
      "sudo yum update -y",
      "sudo yum install -y git curl wget unzip aws-cli",
      "echo '======================================================================================'",
      "echo 'Installing Docker...'",
      "echo '======================================================================================'",
      "sudo amazon-linux-extras enable docker",
      "sudo yum install -y docker",
      "sudo systemctl start docker",
      "sudo systemctl enable docker",
      "sudo usermod -aG docker ec2-user",
      "echo '======================================================================================'",
      "echo 'Installing Docker Compose...'",
      "echo '======================================================================================'",
      "mkdir -p ~/.docker/cli-plugins/",
      "curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose",
      "chmod +x ~/.docker/cli-plugins/docker-compose",
      "docker compose version",
      "echo '======================================================================================'",
      "echo 'Done installing dependencies. Rebooting now...'",
      "echo '======================================================================================'",
      "sudo reboot || true"
    ]
  }
}

resource "null_resource" "deploy_splitsafe" {
  depends_on = [aws_instance.splitsafe_server]

  provisioner "remote-exec" {
    connection {
      type        = "ssh"
      user        = "ec2-user"
      private_key = file(var.private_key_path)
      host        = aws_instance.splitsafe_server.public_ip
    }

    inline = [
      "echo '======================================================================================'",
      "echo 'Waiting for system to stabilize after reboot...'",
      "echo '======================================================================================'",
      "sleep 60",
      "echo '======================================================================================'",
      "echo 'Cloning SplitSafe repository...'",
      "echo '======================================================================================'",
      "cd ~",
      "if [ -d splitsafe ]; then cd splitsafe && git pull; else git clone ${var.repo_url} splitsafe && cd splitsafe; fi",
      "echo '======================================================================================'",
      "echo 'Getting environment variables from AWS Parameter Store...'",
      "echo '======================================================================================'",
      "export CANISTER_ID=$(aws ssm get-parameter --name '${var.parameter_prefix}/canister-id' --query 'Parameter.Value' --output text --region ${var.aws_region})",
      "export DFX_HOST=$(aws ssm get-parameter --name '${var.parameter_prefix}/dfx-host' --query 'Parameter.Value' --output text --region ${var.aws_region})",
      "export NODE_ENV=$(aws ssm get-parameter --name '${var.parameter_prefix}/node-env' --query 'Parameter.Value' --output text --region ${var.aws_region})",
      "export PORT=$(aws ssm get-parameter --name '${var.parameter_prefix}/port' --query 'Parameter.Value' --output text --region ${var.aws_region})",
      "export BLOCKSTREAM_URL=$(aws ssm get-parameter --name '${var.parameter_prefix}/blockstream-url' --query 'Parameter.Value' --output text --region ${var.aws_region})",
      "export MEMPOOL_URL=$(aws ssm get-parameter --name '${var.parameter_prefix}/mempool-url' --query 'Parameter.Value' --output text --region ${var.aws_region})",
      "export ICP_DASHBOARD_URL=$(aws ssm get-parameter --name '${var.parameter_prefix}/icp-dashboard-url' --query 'Parameter.Value' --output text --region ${var.aws_region})",
      "export ICSCAN_URL=$(aws ssm get-parameter --name '${var.parameter_prefix}/icscan-url' --query 'Parameter.Value' --output text --region ${var.aws_region})",
      "echo '======================================================================================'",
      "echo 'Deploying SplitSafe with Docker Compose...'",
      "echo '======================================================================================'",
      "docker compose -f frontend/docker/docker-compose.yml up --build -d splitsafe",
      "echo '======================================================================================'",
      "echo 'SplitSafe is now running!'",
      "echo \"Your application should be accessible at http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000\"",
      "echo '======================================================================================'"
    ]
  }
} 