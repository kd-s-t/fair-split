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

output "dfx_url" {
  description = "Public HTTPS URL for the DFX replica served via Caddy"
  value       = "https://${var.dfx_domain}"
}