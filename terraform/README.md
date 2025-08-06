# Terraform Configuration for SplitSafe

This directory contains the Terraform configuration for deploying SplitSafe on AWS with a modular architecture.

## Architecture Overview

The infrastructure is organized into dedicated modules for better maintainability and separation of concerns:

### **Modules:**

- **`modules/ec2/`** - EC2 instance and Elastic IP management
- **`modules/iam/`** - IAM roles, policies, and instance profiles
- **`modules/security/`** - Security groups and SSH key pairs
- **`modules/ssm/`** - AWS Systems Manager Parameter Store configuration
- **`modules/ecr/`** - Elastic Container Registry setup

### **Resource Organization:**

| Resource Type | Module | Purpose |
|---------------|--------|---------|
| EC2 Instance | `ec2` | Application server |
| Elastic IP | `ec2` | Static public IP |
| IAM Role/Policy | `iam` | EC2 permissions for ECR/SSM |
| Security Group | `security` | Network access controls |
| SSH Keys | `security` | Instance access |
| SSM Parameters | `ssm` | Environment variables |
| ECR Repository | `ecr` | Container registry |

## Setup

1. **Copy the template file:**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. **Edit terraform.tfvars with your values:**
   - Update `ami_id` with your desired AMI
   - Set `public_key_path` and `private_key_path` to your SSH keys
   - Update `repo_url` with your repository URL
   - Adjust `instance_type` as needed

3. **Initialize Terraform:**
   ```bash
   terraform init
   ```

4. **Plan the deployment:**
   ```bash
   terraform plan
   ```

5. **Deploy:**
   ```bash
   terraform apply
   ```

## Module Details

### EC2 Module (`modules/ec2/`)
- Manages the main application server
- Creates Elastic IP for consistent public IP
- Handles instance provisioning and configuration

### IAM Module (`modules/iam/`)
- Creates IAM role for EC2 instance
- Attaches policies for ECR and SSM access
- Manages instance profile

### Security Module (`modules/security/`)
- Generates SSH key pairs
- Creates security group with comprehensive rules
- Handles network access controls

### SSM Module (`modules/ssm/`)
- Manages environment variables in Parameter Store
- Stores application configuration
- Handles domain and service URLs

### ECR Module (`modules/ecr/`)
- Creates container registry
- Manages repository policies
- Handles image lifecycle

## Outputs

After deployment, you'll get:
- **Public IP**: The EC2 instance's public IP (Elastic IP)
- **Application URL**: Direct link to your application
- **SSH Command**: Command to connect to the instance
- **Instance ID**: AWS instance identifier
- **SSH Key File**: Path to the generated private key

## Security Notes

- `terraform.tfvars` is ignored by git (contains sensitive data)
- SSH keys are automatically generated and stored securely
- Security groups are configured with minimal required access
- IAM roles follow least privilege principle
- Consider using AWS Secrets Manager for production deployments

## Environment Variables

The SSM module automatically creates these parameters:
- `NEXT_PUBLIC_DOMAIN` - Production domain
- `NEXT_PUBLIC_DEVELOPMENT_DOMAIN` - Development domain
- `NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP` - ICP canister ID
- `NEXT_PUBLIC_DFX_HOST` - DFX host URL
- `NEXT_PUBLIC_BLOCKSTREAM_URL` - Bitcoin API
- `NEXT_PUBLIC_MEMPOOL_URL` - Mempool API
- `NEXT_PUBLIC_ICP_DASHBOARD_URL` - ICP dashboard
- `NEXT_PUBLIC_ICSCAN_URL` - ICP explorer
- `NODE_ENV` - Node.js environment

## Cleanup

To destroy the infrastructure:
```bash
terraform destroy
```

## Module Dependencies

```
main.tf
├── security (SSH keys, security groups)
├── iam (roles, policies)
├── ssm (parameters)
├── ec2 (instance, elastic IP)
└── ecr (container registry)
```

The modules are designed to be independent and reusable across different environments. 