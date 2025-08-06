output "public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.splitsafe_server.public_ip
}

output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.splitsafe_server.id
}

output "ssh_command" {
  description = "SSH command to connect to the EC2 instance"
  value       = "ssh -i ${var.private_key_path} ubuntu@${aws_instance.splitsafe_server.public_ip}"
}

output "ssh_private_key" {
  description = "Private key content for SSH access"
  value       = tls_private_key.splitsafe_key.private_key_openssh
  sensitive   = true
}

output "ssh_key_file" {
  description = "Path to the generated private key file"
  value       = local_file.private_key.filename
}

output "ec2_role_arn" {
  description = "ARN of the EC2 instance role"
  value       = aws_iam_role.ec2_role.arn
} 