# Terraform Configuration for SplitSafe

This directory contains the Terraform configuration for deploying SplitSafe on AWS.

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

## Outputs

After deployment, you'll get:
- **Public IP**: The EC2 instance's public IP
- **Application URL**: Direct link to your application
- **SSH Command**: Command to connect to the instance
- **Instance ID**: AWS instance identifier

## Security Notes

- `terraform.tfvars` is ignored by git (contains sensitive data)
- SSH keys should be kept secure
- Consider using AWS Secrets Manager for production deployments

## Cleanup

To destroy the infrastructure:
```bash
terraform destroy
``` 