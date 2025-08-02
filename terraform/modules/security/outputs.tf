output "key_pair_name" {
  description = "Name of the SSH key pair"
  value       = aws_key_pair.splitsafe_key.key_name
}

output "security_group_id" {
  description = "ID of the security group"
  value       = aws_security_group.splitsafe_sg.id
} 