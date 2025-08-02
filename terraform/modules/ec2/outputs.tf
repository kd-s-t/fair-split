output "public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.splitsafe_server.public_ip
}

output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.splitsafe_server.id
}

output "application_url" {
  description = "URL to access the SplitSafe application"
  value       = "http://${aws_instance.splitsafe_server.public_ip}:3000"
} 