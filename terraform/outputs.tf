output "public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = module.ec2.public_ip
}

output "instance_id" {
  description = "ID of the EC2 instance"
  value       = module.ec2.instance_id
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i ${module.security.private_key_file} ubuntu@${module.ec2.public_ip}"
}

output "ssh_private_key" {
  description = "Private key content for SSH access (for GitHub Actions)"
  value       = module.security.private_key_content
  sensitive   = true
}

output "ssh_key_file" {
  description = "Path to the generated private key file"
  value       = module.security.private_key_file
}

output "house_key" {
  description = "House key for GitHub Actions secret"
  value       = random_password.house_key.result
  sensitive   = true
}

output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = module.ecr.repository_url
}

output "ecr_repository_name" {
  description = "Name of the ECR repository"
  value       = module.ecr.repository_name
} 

# Outputs for DFX EC2 instance
output "dfx_public_ip" {
  description = "Public IP address of the DFX EC2 instance"
  value       = module.ec2_dfx.public_ip
}

output "dfx_instance_id" {
  description = "ID of the DFX EC2 instance"
  value       = module.ec2_dfx.instance_id
}

output "dfx_ssh_command" {
  description = "SSH command to connect to the DFX instance"
  value       = "ssh -i ${module.security.private_key_file} ubuntu@${module.ec2_dfx.public_ip}"
}

# Convenience output to show whether dfx replica bootstrap is enabled
output "dfx_enabled" {
  description = "Whether DFX bootstrap is enabled for the DFX instance"
  value       = true
}