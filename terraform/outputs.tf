output "public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = module.ec2.public_ip
}

output "instance_id" {
  description = "ID of the EC2 instance"
  value       = module.ec2.instance_id
}

output "application_url" {
  description = "URL to access the SplitSafe application"
  value       = module.ec2.application_url
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i ${var.private_key_path} ec2-user@${module.ec2.public_ip}"
}

output "security_group_id" {
  description = "ID of the security group"
  value       = module.security.security_group_id
}

output "canister_id_parameter" {
  description = "SSM parameter for canister ID"
  value       = module.ssm.canister_id_parameter
} 