#!/bin/bash

# Install dfx on EC2 instance
echo "🔗 Installing dfx (Internet Computer SDK) on EC2 instance..."

# Get the EC2 IP from Terraform output
EC2_IP=$(cd terraform && terraform output -raw public_ip)
SSH_KEY=$(cd terraform && terraform output -raw ssh_key_file)

echo "📡 Connecting to EC2 instance at $EC2_IP..."

# Install dfx on the EC2 instance
ssh -i "$SSH_KEY" ubuntu@"$EC2_IP" << 'EOF'
echo "🔗 Installing dfx (Internet Computer SDK)..."
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
echo 'source ~/.bashrc' >> ~/.profile
source ~/.bashrc
dfx --version
echo "✅ dfx installed successfully!"

# Check if dfx is working
echo "🔍 Testing dfx installation..."
dfx --version
echo "✅ dfx is ready to use!"
EOF

echo "✅ dfx installation completed!"
echo "🌐 You can now SSH to the instance and use dfx commands:"
echo "   ssh -i $SSH_KEY ubuntu@$EC2_IP" 